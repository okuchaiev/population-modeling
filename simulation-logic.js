'use strict';

/*
 * SimulationLogic encapsulates the population model used by the UI.
 *
 * Why this file exists:
 * - Keep simulation/math code separate from map and DOM concerns.
 * - Make model behavior easier to reason about and test in isolation.
 * - Provide one explicit API that app.js can call.
 */
(function attachSimulationLogic(globalObject) {
  /*
   * Highest age tracked by the model.
   * Everyone older than this age remains in this terminal bucket.
   */
  const MAX_AGE = 110;

  // Fertility age range — wider than before, with age-dependent weighting.
  const FERTILE_AGE_START = 15;
  const FERTILE_AGE_END = 50;

  /*
   * Age-specific fertility weights (ages 15..50).
   * Models a realistic bell curve peaking around age 27,
   * tapering at both ends. Weights are pre-normalized so they sum to 1.
   * Based on a skewed-normal shape fitted to typical ASFR curves.
   */
  const FERTILITY_WEIGHTS = buildFertilityWeights(FERTILE_AGE_START, FERTILE_AGE_END);

  function buildFertilityWeights(startAge, endAge) {
    const peak = 27;
    const sigmaLeft = 6;
    const sigmaRight = 10;
    const weights = new Array(endAge - startAge + 1);
    let total = 0;
    for (let age = startAge; age <= endAge; age += 1) {
      const sigma = age <= peak ? sigmaLeft : sigmaRight;
      const z = (age - peak) / sigma;
      const w = Math.exp(-0.5 * z * z);
      weights[age - startAge] = w;
      total += w;
    }
    // Normalize so weights sum to 1.
    for (let i = 0; i < weights.length; i += 1) {
      weights[i] /= total;
    }
    return weights;
  }

  /*
   * Runs the stochastic population simulation forward in yearly steps.
   *
   * Inputs:
   * - ageDistribution: array of age-bucket totals (0-10, 10-20, ..., 80+).
   * - fertilityRate: average births per woman over fertile years.
   * - lifeExpectancy: average lifespan input controlling mortality curve.
   * - years: number of years to simulate.
   * - femaleShare: fraction of population that is female (0..1, default 0.5).
   *
   * Output:
   * - total population at t=0 and after each simulated year.
   */
  function simulatePopulation(ageDistribution, fertilityRate, lifeExpectancy, years, femaleShare) {
    const safeFemaleShare = Number.isFinite(femaleShare) ? clampNumber(femaleShare, 0, 1, 0.5) : 0.5;
    // Convert coarse buckets into single-year ages so aging/death can be modeled yearly.
    let byAge = toAgeArray(ageDistribution);
    const totals = [totalPopulationFromAges(byAge)];

    // Keep the simulation robust if the caller passes an unexpected years value.
    const safeYears = Math.max(1, Math.round(Number(years) || 1));

    // Pre-compute mortality table once for the given life expectancy.
    const mortalityTable = buildMortalityTable(lifeExpectancy);

    for (let year = 0; year < safeYears; year += 1) {
      // Next year's population starts empty; survivors and births are accumulated here.
      const nextYear = new Array(MAX_AGE + 1).fill(0);

      // Age everyone by one year while sampling deaths for each age.
      for (let age = MAX_AGE; age >= 0; age -= 1) {
        const peopleAtAge = byAge[age];
        if (peopleAtAge <= 0) {
          continue;
        }

        const deathProbability = mortalityTable[age];
        const deaths = sampleDeaths(peopleAtAge, deathProbability);
        const survivors = Math.max(0, peopleAtAge - deaths);

        // Move survivors to the next age, clamping to MAX_AGE terminal bucket.
        const destinationAge = Math.min(MAX_AGE, age + 1);
        nextYear[destinationAge] += survivors;
      }

      /*
       * Birth model:
       * - For each fertile age (15..50), estimate women at that age.
       * - Weight each age by a bell-shaped fertility curve peaking ~27.
       * - The total expected births = sum over ages of:
       *     women_at_age * fertilityRate * weight_at_age
       *   where the weights are pre-normalized to sum to 1, so the
       *   total lifetime births per woman still equals fertilityRate.
       */
      let expectedBirths = 0;
      for (let age = FERTILE_AGE_START; age <= FERTILE_AGE_END; age += 1) {
        const womenAtAge = nextYear[age] * safeFemaleShare;
        expectedBirths += womenAtAge * fertilityRate * FERTILITY_WEIGHTS[age - FERTILE_AGE_START];
      }
      expectedBirths = Math.max(0, expectedBirths);
      const births = samplePoisson(expectedBirths);

      // Newborns enter age 0 at the end of the yearly step.
      nextYear[0] += births;

      byAge = nextYear;
      totals.push(totalPopulationFromAges(byAge));
    }

    // Enforce non-negative integer totals for charting and display.
    return totals.map((value) => Math.max(0, Math.round(value)));
  }

  /*
   * Builds x-axis labels for results charts.
   * Example: startYear=2026, count=4 -> [2026, 2027, 2028, 2029]
   */
  function makeYearLabels(startYear, count) {
    return Array.from({ length: count }, (_, index) => startYear + index);
  }

  /*
   * Computes total population from age-bucket distribution.
   * This is used by both UI status text and map coloring.
   */
  function totalPopulation(distribution) {
    return Math.round((distribution || []).reduce((sum, value) => sum + value, 0));
  }

  /*
   * Spreads each 10-year bucket into one-year ages.
   * The final bucket is treated as 80..MAX_AGE.
   */
  function toAgeArray(distribution) {
    const normalizedDistribution = Array.isArray(distribution) ? distribution : [];
    const byAge = new Array(MAX_AGE + 1).fill(0);

    normalizedDistribution.forEach((bucketPopulation, index) => {
      const bucketStart = index * 10;
      const bucketEnd = index === normalizedDistribution.length - 1 ? MAX_AGE + 1 : bucketStart + 10;
      const width = bucketEnd - bucketStart;
      const perAge = width > 0 ? bucketPopulation / width : 0;

      for (let age = bucketStart; age < bucketEnd; age += 1) {
        byAge[age] += perAge;
      }
    });

    return byAge;
  }

  /*
   * Gompertz-Makeham mortality model.
   *
   * Hazard rate: μ(age) = λ + α·exp(β·age) + infantComponent(age)
   *   λ   – baseline (accidents, disease unrelated to age)
   *   α,β – Gompertz aging parameters
   *   infantComponent – elevated risk for ages 0–4, scaling with LE
   *
   * β ≈ 0.085 is the remarkably stable Gompertz constant across populations.
   * α is calibrated per-LE via binary search so the implied life expectancy
   * matches the user's input.
   *
   * Returns a Float64Array of annual death probabilities for ages 0..MAX_AGE.
   */
  const GOMPERTZ_BETA = 0.085;
  const BASELINE_LAMBDA = 0.0002;

  function buildMortalityTable(lifeExpectancy) {
    const clampedLE = clampNumber(lifeExpectancy, 30, 100, 73);
    const infantPeak = 0.4 * Math.exp(-0.05 * clampedLE);

    let lo = 1e-9;
    let hi = 0.01;
    for (let i = 0; i < 60; i += 1) {
      const mid = (lo + hi) / 2;
      if (gompertzImpliedLE(mid, infantPeak) > clampedLE) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const alpha = (lo + hi) / 2;

    const table = new Float64Array(MAX_AGE + 1);
    for (let age = 0; age <= MAX_AGE; age += 1) {
      let hazard = BASELINE_LAMBDA + alpha * Math.exp(GOMPERTZ_BETA * age);
      if (age < 5) {
        hazard += infantPeak * Math.exp(-age * 1.5);
      }
      table[age] = clampNumber(1 - Math.exp(-hazard), 0.0001, 0.98, 0.02);
    }
    return table;
  }

  function gompertzImpliedLE(alpha, infantPeak) {
    let survival = 1.0;
    let le = 0;
    for (let age = 0; age <= MAX_AGE; age += 1) {
      let hazard = BASELINE_LAMBDA + alpha * Math.exp(GOMPERTZ_BETA * age);
      if (age < 5) {
        hazard += infantPeak * Math.exp(-age * 1.5);
      }
      const q = clampNumber(1 - Math.exp(-hazard), 0.0001, 0.98, 0.02);
      le += survival;
      survival *= (1 - q);
      if (survival < 1e-12) {
        break;
      }
    }
    return le;
  }

  /*
   * Samples yearly deaths for one age group.
   * Uses exact binomial for smaller counts, normal approximation for larger counts.
   */
  function sampleDeaths(count, probability) {
    if (count < 1 || probability <= 0) {
      return 0;
    }

    if (count < 220) {
      return sampleBinomial(Math.round(count), probability);
    }

    const mean = count * probability;
    const variance = count * probability * (1 - probability);
    const sampled = sampleNormal(mean, Math.sqrt(Math.max(variance, 1)));
    return clampNumber(sampled, 0, count, mean);
  }

  // Bernoulli trial sampler for smaller populations.
  function sampleBinomial(n, p) {
    if (n <= 0 || p <= 0) {
      return 0;
    }

    if (p >= 1) {
      return n;
    }

    let successes = 0;
    for (let i = 0; i < n; i += 1) {
      if (Math.random() < p) {
        successes += 1;
      }
    }

    return successes;
  }

  /*
   * Poisson sampler for births:
   * - Knuth algorithm for small means,
   * - normal approximation for large means.
   */
  function samplePoisson(mean) {
    if (mean <= 0) {
      return 0;
    }

    if (mean < 30) {
      const threshold = Math.exp(-mean);
      let product = 1;
      let count = 0;

      while (product > threshold) {
        count += 1;
        product *= Math.random();
      }

      return count - 1;
    }

    return Math.max(0, Math.round(sampleNormal(mean, Math.sqrt(mean))));
  }

  // Box-Muller transform to sample from a normal distribution.
  function sampleNormal(mean, standardDeviation) {
    let u = 0;
    let v = 0;

    while (u === 0) {
      u = Math.random();
    }

    while (v === 0) {
      v = Math.random();
    }

    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + standardDeviation * z;
  }

  function totalPopulationFromAges(byAge) {
    return byAge.reduce((sum, value) => sum + value, 0);
  }

  function sumRange(values, startAge, endAge) {
    let total = 0;
    const from = Math.max(0, Math.floor(startAge));
    const to = Math.min(values.length - 1, Math.floor(endAge));

    for (let age = from; age <= to; age += 1) {
      total += values[age];
    }

    return total;
  }

  function clampNumber(value, min, max, fallback) {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, value));
  }

  // Public API intentionally small and stable.
  const api = Object.freeze({
    MAX_AGE,
    makeYearLabels,
    simulatePopulation,
    totalPopulation
  });

  // Browser global used by app.js.
  globalObject.SimulationLogic = api;

  // Node/CommonJS export for unit tests.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
