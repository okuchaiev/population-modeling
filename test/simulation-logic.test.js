'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const simulationLogic = require('../simulation-logic.js');

function withSeededRandom(seed, fn) {
  const originalRandom = Math.random;
  let state = seed >>> 0;

  // Deterministic LCG in (0, 1), suitable for repeatable tests.
  Math.random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return (state + 1) / 4294967297;
  };

  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
}

test('exposes expected public API', () => {
  assert.equal(typeof simulationLogic.simulatePopulation, 'function');
  assert.equal(typeof simulationLogic.totalPopulation, 'function');
  assert.equal(typeof simulationLogic.makeYearLabels, 'function');
  assert.equal(simulationLogic.MAX_AGE, 110);
});

test('makeYearLabels builds inclusive yearly sequence', () => {
  const labels = simulationLogic.makeYearLabels(2026, 5);
  assert.deepEqual(labels, [2026, 2027, 2028, 2029, 2030]);
});

test('totalPopulation sums and rounds distribution values', () => {
  const total = simulationLogic.totalPopulation([10.4, 19.4, 0.2]);
  assert.equal(total, 30);
});

test('simulatePopulation returns years + 1 totals and valid values', () => {
  const totals = withSeededRandom(12345, () =>
    simulationLogic.simulatePopulation(
      [300000, 280000, 260000, 240000, 220000, 200000, 180000, 120000, 60000],
      2.1,
      75,
      30
    )
  );

  assert.equal(totals.length, 31);
  for (const value of totals) {
    assert.equal(Number.isInteger(value), true);
    assert.equal(Number.isFinite(value), true);
    assert.equal(value >= 0, true);
  }
});

test('simulatePopulation is deterministic for a fixed random seed', () => {
  const inputDistribution = [50000, 48000, 46000, 44000, 42000, 40000, 38000, 26000, 14000];

  const runA = withSeededRandom(20260216, () =>
    simulationLogic.simulatePopulation(inputDistribution, 1.8, 79, 20)
  );
  const runB = withSeededRandom(20260216, () =>
    simulationLogic.simulatePopulation(inputDistribution, 1.8, 79, 20)
  );

  assert.deepEqual(runA, runB);
});

test('simulatePopulation keeps all totals at zero when starting from zero population', () => {
  const totals = withSeededRandom(9, () =>
    simulationLogic.simulatePopulation([0, 0, 0, 0, 0, 0, 0, 0, 0], 5.0, 85, 25)
  );

  assert.deepEqual(totals, new Array(26).fill(0));
});

test('simulatePopulation is non-increasing when fertility is zero', () => {
  const totals = withSeededRandom(777, () =>
    simulationLogic.simulatePopulation(
      [120000, 110000, 100000, 90000, 80000, 70000, 60000, 50000, 40000],
      0,
      72,
      25
    )
  );

  for (let index = 1; index < totals.length; index += 1) {
    assert.equal(totals[index] <= totals[index - 1], true);
  }
});
