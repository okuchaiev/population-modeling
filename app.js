'use strict';

const AGE_GROUPS = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80+'];
const DEFAULT_AGE_DISTRIBUTION = [1200000, 1100000, 1000000, 900000, 800000, 700000, 600000, 450000, 250000];
const WORLD_TOTAL_ID = '__WORLD_TOTAL__';
const WORLD_TOTAL_NAME = 'World Total';
// World defaults from UN World Population Prospects 2024 Revision (Medium variant).
// Population and age distribution: UN WPP 2024 mid-year estimates.
// TFR: UN WPP 2024 (global average 2.25 children/woman).
// Life expectancy: UN WPP 2024 (global average 73.3 years).
const WORLD_DEFAULT_PROFILE = Object.freeze({
  fertility: 2.25,
  lifeExpectancy: 73.3,
  femaleShare: 0.4972,
  years: 80,
  ageDistribution: Object.freeze([1331452079, 1336489561, 1219741371, 1195856623, 1011021796, 882412609, 644057049, 376836774, 164104711])
});
const FALLBACK_DEFAULT_PROFILE = Object.freeze({
  fertility: 2.1,
  lifeExpectancy: 75,
  femaleShare: 0.5,
  years: 80,
  ageDistribution: Object.freeze([...DEFAULT_AGE_DISTRIBUTION])
});
// Country defaults from UN World Population Prospects 2024 Revision (Medium variant).
// Population and age distribution: UN WPP 2024 mid-year estimates.
// TFR: UN WPP 2024.
// Life expectancy: UN WPP 2024.
// Age brackets: 5-year UN groups combined into 10-year brackets [0-10, 10-20, 20-30, 30-40, 40-50, 50-60, 60-70, 70-80, 80+].
// Taiwan data from CIA World Factbook / World Population Review (not in UN WPP).
// Generated from UN WPP 2024 CSV data for 173 countries/territories.
const PRELOADED_COUNTRY_DEFAULTS_BY_NAME = Object.freeze({
  'Afghanistan': Object.freeze({
    fertility: 4.76,
    lifeExpectancy: 66.3,
    femaleShare: 0.4951,
    years: 80,
    ageDistribution: Object.freeze([12868125, 10194255, 7860270, 4995893, 3113085, 1970888, 1062281, 469011, 113682])
  }),
  'Albania': Object.freeze({
    fertility: 1.34,
    lifeExpectancy: 79.8,
    femaleShare: 0.5057,
    years: 80,
    ageDistribution: Object.freeze([300495, 335957, 414301, 430107, 312549, 341378, 347702, 205276, 103999])
  }),
  'Algeria': Object.freeze({
    fertility: 2.72,
    lifeExpectancy: 76.5,
    femaleShare: 0.4900,
    years: 80,
    ageDistribution: Object.freeze([9653011, 8203635, 5946496, 7204081, 6532897, 4580574, 2843424, 1388108, 462082])
  }),
  'Angola': Object.freeze({
    fertility: 5.05,
    lifeExpectancy: 64.8,
    femaleShare: 0.5052,
    years: 80,
    ageDistribution: Object.freeze([11945537, 8874162, 5929661, 4419051, 3005466, 1950918, 1160251, 473234, 127567])
  }),
  'Argentina': Object.freeze({
    fertility: 1.50,
    lifeExpectancy: 77.5,
    femaleShare: 0.5037,
    years: 80,
    ageDistribution: Object.freeze([6164668, 7262839, 6955878, 6735242, 6157995, 4721050, 3795872, 2571599, 1331015])
  }),
  'Armenia': Object.freeze({
    fertility: 1.72,
    lifeExpectancy: 75.8,
    femaleShare: 0.5357,
    years: 80,
    ageDistribution: Object.freeze([368597, 392791, 375865, 491749, 404855, 332550, 367874, 170567, 68994])
  }),
  'Australia': Object.freeze({
    fertility: 1.64,
    lifeExpectancy: 84.1,
    femaleShare: 0.5038,
    years: 80,
    ageDistribution: Object.freeze([3119263, 3270760, 3441188, 3909428, 3465363, 3240523, 2898669, 2162908, 1205104])
  }),
  'Austria': Object.freeze({
    fertility: 1.32,
    lifeExpectancy: 82.1,
    femaleShare: 0.5077,
    years: 80,
    ageDistribution: Object.freeze([864573, 871108, 1022796, 1255465, 1199706, 1358054, 1207467, 770756, 570891])
  }),
  'Azerbaijan': Object.freeze({
    fertility: 1.67,
    lifeExpectancy: 74.6,
    femaleShare: 0.5098,
    years: 80,
    ageDistribution: Object.freeze([1402651, 1613164, 1388083, 1850733, 1413705, 1198809, 1003919, 350966, 114547])
  }),
  'Bahamas': Object.freeze({
    fertility: 1.37,
    lifeExpectancy: 74.7,
    femaleShare: 0.5225,
    years: 80,
    ageDistribution: Object.freeze([45025, 55539, 60492, 63634, 54725, 53482, 36418, 20576, 11392])
  }),
  'Bangladesh': Object.freeze({
    fertility: 2.14,
    lifeExpectancy: 74.9,
    femaleShare: 0.5083,
    years: 80,
    ageDistribution: Object.freeze([32384903, 33269939, 31204301, 25790446, 20376231, 14025957, 9431436, 5185654, 1893494])
  }),
  'Belarus': Object.freeze({
    fertility: 1.22,
    lifeExpectancy: 74.6,
    femaleShare: 0.5340,
    years: 80,
    ageDistribution: Object.freeze([908941, 1053302, 889933, 1388455, 1350054, 1205986, 1246584, 699120, 314321])
  }),
  'Belgium': Object.freeze({
    fertility: 1.38,
    lifeExpectancy: 82.3,
    femaleShare: 0.5069,
    years: 80,
    ageDistribution: Object.freeze([1195519, 1363979, 1371736, 1527621, 1511958, 1573402, 1469218, 1059326, 666006])
  }),
  'Belize': Object.freeze({
    fertility: 2.02,
    lifeExpectancy: 73.7,
    femaleShare: 0.4954,
    years: 80,
    ageDistribution: Object.freeze([74291, 75172, 79356, 69135, 50198, 35446, 21282, 9151, 3043])
  }),
  'Benin': Object.freeze({
    fertility: 4.48,
    lifeExpectancy: 61.0,
    femaleShare: 0.4985,
    years: 80,
    ageDistribution: Object.freeze([4228609, 3318345, 2430867, 1771595, 1206711, 786835, 457806, 204181, 57776])
  }),
  'Bhutan': Object.freeze({
    fertility: 1.45,
    lifeExpectancy: 73.3,
    femaleShare: 0.4655,
    years: 80,
    ageDistribution: Object.freeze([101486, 131789, 147330, 156651, 109445, 68997, 44495, 22930, 8403])
  }),
  'Bolivia': Object.freeze({
    fertility: 2.52,
    lifeExpectancy: 68.7,
    femaleShare: 0.4990,
    years: 80,
    ageDistribution: Object.freeze([2482992, 2393553, 2197759, 1887822, 1400101, 992909, 625039, 313221, 119918])
  }),
  'Bosnia and Herz.': Object.freeze({
    fertility: 1.49,
    lifeExpectancy: 78.0,
    femaleShare: 0.5241,
    years: 80,
    ageDistribution: Object.freeze([264531, 311686, 339754, 361119, 489962, 441459, 484756, 306946, 164043])
  }),
  'Botswana': Object.freeze({
    fertility: 2.70,
    lifeExpectancy: 69.3,
    femaleShare: 0.5016,
    years: 80,
    ageDistribution: Object.freeze([563236, 492028, 492597, 412786, 241548, 164650, 92024, 46679, 15593])
  }),
  'Brazil': Object.freeze({
    fertility: 1.61,
    lifeExpectancy: 76.0,
    femaleShare: 0.5080,
    years: 80,
    ageDistribution: Object.freeze([27291058, 29275505, 32102359, 32755272, 31377474, 25033453, 19373043, 10627824, 4162582])
  }),
  'Brunei': Object.freeze({
    fertility: 1.73,
    lifeExpectancy: 75.5,
    femaleShare: 0.4690,
    years: 80,
    ageDistribution: Object.freeze([63904, 64342, 76127, 82465, 72024, 53406, 32545, 13803, 4104])
  }),
  'Bulgaria': Object.freeze({
    fertility: 1.75,
    lifeExpectancy: 75.8,
    femaleShare: 0.5161,
    years: 80,
    ageDistribution: Object.freeze([634283, 683972, 628354, 891411, 1019053, 966182, 878106, 724700, 331628])
  }),
  'Burkina Faso': Object.freeze({
    fertility: 4.11,
    lifeExpectancy: 61.3,
    femaleShare: 0.5019,
    years: 80,
    ageDistribution: Object.freeze([6711949, 5818853, 4025637, 2857239, 1963668, 1157404, 668593, 283060, 62379])
  }),
  'Burundi': Object.freeze({
    fertility: 4.79,
    lifeExpectancy: 63.8,
    femaleShare: 0.5032,
    years: 80,
    ageDistribution: Object.freeze([4280323, 3615052, 2120582, 1703283, 1196731, 588695, 338138, 164595, 40386])
  }),
  'Cambodia': Object.freeze({
    fertility: 2.55,
    lifeExpectancy: 70.8,
    femaleShare: 0.5100,
    years: 80,
    ageDistribution: Object.freeze([3583995, 3302280, 2719660, 2782598, 2094130, 1460370, 1056918, 497297, 141553])
  }),
  'Cameroon': Object.freeze({
    fertility: 4.26,
    lifeExpectancy: 64.0,
    femaleShare: 0.5016,
    years: 80,
    ageDistribution: Object.freeze([8504777, 6709138, 4884762, 3712854, 2510452, 1508976, 826902, 364458, 101426])
  }),
  'Canada': Object.freeze({
    fertility: 1.34,
    lifeExpectancy: 82.7,
    femaleShare: 0.5034,
    years: 80,
    ageDistribution: Object.freeze([3896648, 4285119, 5221402, 5655964, 5181116, 4938240, 5119346, 3518502, 1926094])
  }),
  'Central African Rep.': Object.freeze({
    fertility: 5.95,
    lifeExpectancy: 57.7,
    femaleShare: 0.5201,
    years: 80,
    ageDistribution: Object.freeze([1816563, 1448941, 940838, 469330, 254670, 205867, 137394, 49237, 7848])
  }),
  'Chad': Object.freeze({
    fertility: 6.03,
    lifeExpectancy: 55.2,
    femaleShare: 0.4984,
    years: 80,
    ageDistribution: Object.freeze([6744254, 4817222, 3398008, 2244135, 1454048, 929036, 479705, 187332, 45380])
  }),
  'Chile': Object.freeze({
    fertility: 1.14,
    lifeExpectancy: 81.4,
    femaleShare: 0.5030,
    years: 80,
    ageDistribution: Object.freeze([2111670, 2455771, 2873016, 3222180, 2751418, 2479364, 1992297, 1233656, 645399])
  }),
  'China': Object.freeze({
    fertility: 1.01,
    lifeExpectancy: 78.0,
    femaleShare: 0.4906,
    years: 80,
    ageDistribution: Object.freeze([137112565, 173211772, 163888847, 223635408, 194667325, 234616048, 158236924, 98217224, 35735164])
  }),
  'Colombia': Object.freeze({
    fertility: 1.63,
    lifeExpectancy: 77.9,
    femaleShare: 0.5066,
    years: 80,
    ageDistribution: Object.freeze([7061436, 7633248, 8954494, 8535700, 7063943, 5917798, 4535140, 2353439, 831164])
  }),
  'Congo': Object.freeze({
    fertility: 4.11,
    lifeExpectancy: 66.0,
    femaleShare: 0.5001,
    years: 80,
    ageDistribution: Object.freeze([1743148, 1492358, 992793, 769236, 612374, 405072, 215486, 80983, 21513])
  }),
  'Costa Rica': Object.freeze({
    fertility: 1.32,
    lifeExpectancy: 81.0,
    femaleShare: 0.5059,
    years: 80,
    ageDistribution: Object.freeze([610333, 715981, 777031, 824812, 710415, 591888, 488882, 277442, 133126])
  }),
  "Côte d'Ivoire": Object.freeze({
    fertility: 4.23,
    lifeExpectancy: 62.1,
    femaleShare: 0.4912,
    years: 80,
    ageDistribution: Object.freeze([9106758, 7346702, 5093532, 4230097, 3090794, 1701496, 895338, 362666, 106846])
  }),
  'Croatia': Object.freeze({
    fertility: 1.47,
    lifeExpectancy: 78.8,
    femaleShare: 0.5176,
    years: 80,
    ageDistribution: Object.freeze([339914, 405538, 412721, 454543, 542111, 540252, 558203, 400145, 221900])
  }),
  'Cuba': Object.freeze({
    fertility: 1.45,
    lifeExpectancy: 78.3,
    femaleShare: 0.5066,
    years: 80,
    ageDistribution: Object.freeze([1057659, 1202176, 1328257, 1509635, 1333627, 1912753, 1358938, 826815, 449924])
  }),
  'Cyprus': Object.freeze({
    fertility: 1.38,
    lifeExpectancy: 81.8,
    femaleShare: 0.4962,
    years: 80,
    ageDistribution: Object.freeze([147955, 137500, 165788, 248790, 218701, 168047, 135875, 89095, 46531])
  }),
  'Czechia': Object.freeze({
    fertility: 1.46,
    lifeExpectancy: 80.0,
    femaleShare: 0.5069,
    years: 80,
    ageDistribution: Object.freeze([1089044, 1142218, 1082718, 1419797, 1682192, 1470180, 1230364, 1111508, 507839])
  }),
  'Dem. Rep. Congo': Object.freeze({
    fertility: 5.98,
    lifeExpectancy: 62.1,
    femaleShare: 0.5039,
    years: 80,
    ageDistribution: Object.freeze([36428457, 25261829, 17503339, 11905490, 7606657, 5313155, 3293775, 1543465, 420093])
  }),
  'Denmark': Object.freeze({
    fertility: 1.52,
    lifeExpectancy: 82.1,
    femaleShare: 0.5029,
    years: 80,
    ageDistribution: Object.freeze([620135, 668551, 775691, 769750, 712560, 807975, 705041, 586795, 330913])
  }),
  'Djibouti': Object.freeze({
    fertility: 2.62,
    lifeExpectancy: 66.2,
    femaleShare: 0.5043,
    years: 80,
    ageDistribution: Object.freeze([227759, 228319, 213975, 171823, 138777, 99202, 55031, 26383, 7452])
  }),
  'Dominican Rep.': Object.freeze({
    fertility: 2.22,
    lifeExpectancy: 73.9,
    femaleShare: 0.5029,
    years: 80,
    ageDistribution: Object.freeze([2011039, 1999274, 1889281, 1689876, 1383077, 1102513, 809636, 388817, 154041])
  }),
  'Ecuador': Object.freeze({
    fertility: 1.81,
    lifeExpectancy: 77.6,
    femaleShare: 0.5015,
    years: 80,
    ageDistribution: Object.freeze([2844253, 3168462, 3101834, 2822650, 2295571, 1730633, 1188951, 696574, 286551])
  }),
  'Egypt': Object.freeze({
    fertility: 2.74,
    lifeExpectancy: 71.8,
    femaleShare: 0.4951,
    years: 80,
    ageDistribution: Object.freeze([24783503, 23254435, 18712363, 17056514, 13547982, 9620411, 6289547, 2732875, 540628])
  }),
  'El Salvador': Object.freeze({
    fertility: 1.77,
    lifeExpectancy: 72.3,
    femaleShare: 0.5250,
    years: 80,
    ageDistribution: Object.freeze([1012990, 1117226, 1232939, 946315, 712800, 578571, 398120, 239566, 99666])
  }),
  'Eq. Guinea': Object.freeze({
    fertility: 4.12,
    lifeExpectancy: 63.9,
    femaleShare: 0.4728,
    years: 80,
    ageDistribution: Object.freeze([492289, 393990, 282056, 278676, 200295, 129793, 76105, 31222, 8090])
  }),
  'Eritrea': Object.freeze({
    fertility: 3.68,
    lifeExpectancy: 68.9,
    femaleShare: 0.5063,
    years: 80,
    ageDistribution: Object.freeze([905990, 868162, 657226, 386536, 276107, 214489, 134843, 69085, 23167])
  }),
  'Estonia': Object.freeze({
    fertility: 1.36,
    lifeExpectancy: 79.3,
    femaleShare: 0.5245,
    years: 80,
    ageDistribution: Object.freeze([136655, 152439, 132947, 193812, 190810, 177075, 169134, 124894, 82781])
  }),
  'eSwatini': Object.freeze({
    fertility: 2.72,
    lifeExpectancy: 64.3,
    femaleShare: 0.5090,
    years: 80,
    ageDistribution: Object.freeze([279709, 264235, 227032, 188399, 128402, 75043, 48889, 23870, 7243])
  }),
  'Ethiopia': Object.freeze({
    fertility: 3.91,
    lifeExpectancy: 67.6,
    femaleShare: 0.4990,
    years: 80,
    ageDistribution: Object.freeze([36365089, 29852150, 24535912, 16772602, 10529400, 7206718, 4281902, 1954873, 561119])
  }),
  'Falkland Is.': Object.freeze({
    fertility: 1.69,
    lifeExpectancy: 79.4,
    femaleShare: 0.5064,
    years: 80,
    ageDistribution: Object.freeze([367, 377, 304, 508, 611, 634, 405, 154, 117])
  }),
  'Fiji': Object.freeze({
    fertility: 2.27,
    lifeExpectancy: 67.5,
    femaleShare: 0.5037,
    years: 80,
    ageDistribution: Object.freeze([167318, 166111, 147589, 141226, 121055, 88187, 63466, 26748, 7086])
  }),
  'Finland': Object.freeze({
    fertility: 1.29,
    lifeExpectancy: 82.1,
    femaleShare: 0.5057,
    years: 80,
    ageDistribution: Object.freeze([505322, 633445, 640115, 733092, 718775, 679524, 715731, 648365, 342939])
  }),
  'France': Object.freeze({
    fertility: 1.64,
    lifeExpectancy: 83.5,
    femaleShare: 0.5152,
    years: 80,
    ageDistribution: Object.freeze([6991474, 8122288, 7920514, 7771149, 8176213, 8653152, 8077523, 6671646, 4164570])
  }),
  'Gabon': Object.freeze({
    fertility: 3.59,
    lifeExpectancy: 68.5,
    femaleShare: 0.4924,
    years: 80,
    ageDistribution: Object.freeze([645583, 517238, 396334, 370737, 279537, 170085, 96368, 46751, 16314])
  }),
  'Gambia': Object.freeze({
    fertility: 3.91,
    lifeExpectancy: 66.1,
    femaleShare: 0.5021,
    years: 80,
    ageDistribution: Object.freeze([756629, 658621, 484935, 351011, 210448, 155474, 96653, 36194, 10022])
  }),
  'Georgia': Object.freeze({
    fertility: 1.80,
    lifeExpectancy: 74.7,
    femaleShare: 0.5339,
    years: 80,
    ageDistribution: Object.freeze([516680, 507876, 435828, 554699, 501672, 453131, 448297, 260821, 128665])
  }),
  'Germany': Object.freeze({
    fertility: 1.45,
    lifeExpectancy: 81.5,
    femaleShare: 0.5062,
    years: 80,
    ageDistribution: Object.freeze([7924948, 7698825, 9008455, 10918957, 10409640, 12381732, 11993708, 7841925, 6374052])
  }),
  'Ghana': Object.freeze({
    fertility: 3.34,
    lifeExpectancy: 65.7,
    femaleShare: 0.5006,
    years: 80,
    ageDistribution: Object.freeze([8390345, 7444405, 5800094, 4761270, 3577978, 2359011, 1353736, 562663, 177913])
  }),
  'Greece': Object.freeze({
    fertility: 1.34,
    lifeExpectancy: 82.0,
    femaleShare: 0.5156,
    years: 80,
    ageDistribution: Object.freeze([824073, 1032390, 1016725, 1085936, 1485076, 1521960, 1303903, 1025747, 752008])
  }),
  'Greenland': Object.freeze({
    fertility: 1.93,
    lifeExpectancy: 70.2,
    femaleShare: 0.4742,
    years: 80,
    ageDistribution: Object.freeze([7928, 7147, 7592, 8946, 6511, 7557, 6946, 2473, 740])
  }),
  'Guatemala': Object.freeze({
    fertility: 2.29,
    lifeExpectancy: 72.7,
    femaleShare: 0.5040,
    years: 80,
    ageDistribution: Object.freeze([3860238, 3843641, 3567316, 2790507, 1870148, 1158686, 767933, 414560, 133329])
  }),
  'Guinea': Object.freeze({
    fertility: 4.13,
    lifeExpectancy: 60.9,
    femaleShare: 0.5052,
    years: 80,
    ageDistribution: Object.freeze([4227193, 3408172, 2638762, 1855239, 1091517, 749136, 479905, 233896, 70964])
  }),
  'Guinea-Bissau': Object.freeze({
    fertility: 3.76,
    lifeExpectancy: 64.3,
    femaleShare: 0.5058,
    years: 80,
    ageDistribution: Object.freeze([583768, 509962, 387866, 287793, 202754, 120467, 68698, 32065, 7979])
  }),
  'Guyana': Object.freeze({
    fertility: 2.39,
    lifeExpectancy: 70.3,
    femaleShare: 0.5132,
    years: 80,
    ageDistribution: Object.freeze([163887, 150562, 147217, 112528, 89869, 79614, 54591, 24404, 8415])
  }),
  'Haiti': Object.freeze({
    fertility: 2.63,
    lifeExpectancy: 65.1,
    femaleShare: 0.5052,
    years: 80,
    ageDistribution: Object.freeze([2458529, 2375975, 2122441, 1789957, 1291812, 870652, 542673, 254479, 66037])
  }),
  'Honduras': Object.freeze({
    fertility: 2.48,
    lifeExpectancy: 73.0,
    femaleShare: 0.4966,
    years: 80,
    ageDistribution: Object.freeze([2244002, 2133278, 2046281, 1659042, 1243622, 762770, 458530, 221100, 57079])
  }),
  'Hungary': Object.freeze({
    fertility: 1.49,
    lifeExpectancy: 77.2,
    femaleShare: 0.5198,
    years: 80,
    ageDistribution: Object.freeze([930440, 967266, 1066029, 1260813, 1520190, 1356788, 1155832, 945421, 473356])
  }),
  'Iceland': Object.freeze({
    fertility: 1.52,
    lifeExpectancy: 83.0,
    femaleShare: 0.4880,
    years: 80,
    ageDistribution: Object.freeze([45669, 49197, 56111, 62374, 51764, 45266, 40901, 27884, 14232])
  }),
  'India': Object.freeze({
    fertility: 1.96,
    lifeExpectancy: 72.2,
    femaleShare: 0.4842,
    years: 80,
    ageDistribution: Object.freeze([232539412, 252114139, 254460342, 230372880, 185999417, 138782481, 94796708, 46325433, 15544977])
  }),
  'Indonesia': Object.freeze({
    fertility: 2.11,
    lifeExpectancy: 71.3,
    femaleShare: 0.4977,
    years: 80,
    ageDistribution: Object.freeze([45329505, 47739216, 43963928, 41871168, 39852514, 32157855, 20589714, 8977993, 3006037])
  }),
  'Iran': Object.freeze({
    fertility: 1.68,
    lifeExpectancy: 77.9,
    femaleShare: 0.4918,
    years: 80,
    ageDistribution: Object.freeze([13470049, 13433828, 11988478, 17061336, 14704391, 9714599, 6526211, 3592500, 1076346])
  }),
  'Iraq': Object.freeze({
    fertility: 3.22,
    lifeExpectancy: 72.4,
    femaleShare: 0.4980,
    years: 80,
    ageDistribution: Object.freeze([11172274, 10450077, 8100383, 6182034, 4495697, 3129871, 1540734, 767621, 203324])
  }),
  'Ireland': Object.freeze({
    fertility: 1.60,
    lifeExpectancy: 82.6,
    femaleShare: 0.5050,
    years: 80,
    ageDistribution: Object.freeze([613179, 718973, 656958, 657920, 806758, 676675, 541807, 381375, 201373])
  }),
  'Israel': Object.freeze({
    fertility: 2.78,
    lifeExpectancy: 82.7,
    femaleShare: 0.5021,
    years: 80,
    ageDistribution: Object.freeze([1747640, 1572211, 1347904, 1187047, 1097187, 887532, 712458, 559478, 275564])
  }),
  'Italy': Object.freeze({
    fertility: 1.21,
    lifeExpectancy: 83.9,
    femaleShare: 0.5113,
    years: 80,
    ageDistribution: Object.freeze([4376187, 5585984, 6127072, 6658115, 7990687, 9584420, 8144071, 6240570, 4635762])
  }),
  'Jamaica': Object.freeze({
    fertility: 1.35,
    lifeExpectancy: 71.6,
    femaleShare: 0.5055,
    years: 80,
    ageDistribution: Object.freeze([336350, 417214, 493577, 498539, 402155, 322826, 233868, 100188, 34459])
  }),
  'Japan': Object.freeze({
    fertility: 1.22,
    lifeExpectancy: 84.9,
    femaleShare: 0.5122,
    years: 80,
    ageDistribution: Object.freeze([8819952, 10985386, 12195984, 12784596, 16318239, 18208923, 14895050, 16469500, 13075413])
  }),
  'Jordan': Object.freeze({
    fertility: 2.60,
    lifeExpectancy: 78.0,
    femaleShare: 0.4843,
    years: 80,
    ageDistribution: Object.freeze([2324322, 2354903, 1974563, 1746485, 1318917, 988078, 539863, 230556, 75192])
  }),
  'Kazakhstan': Object.freeze({
    fertility: 2.98,
    lifeExpectancy: 74.5,
    femaleShare: 0.5129,
    years: 80,
    ageDistribution: Object.freeze([4140303, 3505311, 2483789, 3125682, 2545051, 2077779, 1695594, 749776, 269285])
  }),
  'Kenya': Object.freeze({
    fertility: 3.17,
    lifeExpectancy: 63.8,
    femaleShare: 0.5028,
    years: 80,
    ageDistribution: Object.freeze([13934515, 13351289, 10243487, 7676579, 5233041, 3277248, 1736135, 702278, 278371])
  }),
  'Kosovo': Object.freeze({
    fertility: 1.54,
    lifeExpectancy: 78.2,
    femaleShare: 0.5081,
    years: 80,
    ageDistribution: Object.freeze([209318, 280487, 275299, 249182, 225051, 196528, 141842, 77521, 29563])
  }),
  'Kuwait': Object.freeze({
    fertility: 1.51,
    lifeExpectancy: 80.6,
    femaleShare: 0.3889,
    years: 80,
    ageDistribution: Object.freeze([574886, 607693, 668893, 1146972, 1062802, 583933, 210691, 61105, 17535])
  }),
  'Kyrgyzstan': Object.freeze({
    fertility: 2.78,
    lifeExpectancy: 71.8,
    femaleShare: 0.5057,
    years: 80,
    ageDistribution: Object.freeze([1578702, 1355957, 1071295, 1079847, 791335, 629452, 464680, 168908, 45832])
  }),
  'Laos': Object.freeze({
    fertility: 2.40,
    lifeExpectancy: 69.2,
    femaleShare: 0.4975,
    years: 80,
    ageDistribution: Object.freeze([1588483, 1494966, 1405334, 1228057, 874059, 596938, 377550, 159958, 44474])
  }),
  'Latvia': Object.freeze({
    fertility: 1.34,
    lifeExpectancy: 76.3,
    femaleShare: 0.5364,
    years: 80,
    ageDistribution: Object.freeze([188320, 202786, 174765, 258658, 253114, 254582, 253241, 170640, 115767])
  }),
  'Lebanon': Object.freeze({
    fertility: 2.23,
    lifeExpectancy: 77.9,
    femaleShare: 0.5137,
    years: 80,
    ageDistribution: Object.freeze([952730, 1090889, 893295, 707466, 673488, 634425, 478140, 267016, 108512])
  }),
  'Lesotho': Object.freeze({
    fertility: 2.66,
    lifeExpectancy: 57.8,
    femaleShare: 0.5128,
    years: 80,
    ageDistribution: Object.freeze([539358, 508593, 423978, 386521, 227696, 115222, 82130, 38620, 15305])
  }),
  'Liberia': Object.freeze({
    fertility: 3.86,
    lifeExpectancy: 62.3,
    femaleShare: 0.5008,
    years: 80,
    ageDistribution: Object.freeze([1514079, 1345371, 958202, 671852, 503974, 321756, 192696, 83480, 21405])
  }),
  'Libya': Object.freeze({
    fertility: 2.30,
    lifeExpectancy: 71.1,
    femaleShare: 0.4915,
    years: 80,
    ageDistribution: Object.freeze([1317789, 1382699, 1154287, 1053471, 1088178, 782221, 373912, 165457, 63010])
  }),
  'Lithuania': Object.freeze({
    fertility: 1.21,
    lifeExpectancy: 76.2,
    femaleShare: 0.5280,
    years: 80,
    ageDistribution: Object.freeze([273454, 288415, 340489, 415484, 361854, 394647, 384158, 237509, 163098])
  }),
  'Luxembourg': Object.freeze({
    fertility: 1.40,
    lifeExpectancy: 82.4,
    femaleShare: 0.4967,
    years: 80,
    ageDistribution: Object.freeze([70220, 71030, 85665, 107156, 100051, 93968, 73031, 44798, 27118])
  }),
  'Macedonia': Object.freeze({
    fertility: 1.47,
    lifeExpectancy: 77.5,
    femaleShare: 0.5135,
    years: 80,
    ageDistribution: Object.freeze([196965, 212643, 215637, 244079, 255874, 247728, 235408, 155320, 59357])
  }),
  'Madagascar': Object.freeze({
    fertility: 3.91,
    lifeExpectancy: 63.8,
    femaleShare: 0.4984,
    years: 80,
    ageDistribution: Object.freeze([8786250, 7170985, 5737172, 3936172, 2788468, 1830863, 1104462, 492121, 118463])
  }),
  'Malawi': Object.freeze({
    fertility: 3.59,
    lifeExpectancy: 67.6,
    femaleShare: 0.5120,
    years: 80,
    ageDistribution: Object.freeze([6013500, 5372423, 3886697, 2762515, 1828713, 925112, 515411, 252151, 98764])
  }),
  'Malaysia': Object.freeze({
    fertility: 1.54,
    lifeExpectancy: 76.8,
    femaleShare: 0.4764,
    years: 80,
    ageDistribution: Object.freeze([4952688, 5602204, 6262722, 6251076, 4958643, 3405941, 2444196, 1253078, 427127])
  }),
  'Mali': Object.freeze({
    fertility: 5.51,
    lifeExpectancy: 60.7,
    femaleShare: 0.4954,
    years: 80,
    ageDistribution: Object.freeze([7994718, 6078534, 3940397, 2654041, 1863872, 1039440, 568234, 276845, 62511])
  }),
  'Mauritania': Object.freeze({
    fertility: 4.63,
    lifeExpectancy: 68.7,
    femaleShare: 0.5095,
    years: 80,
    ageDistribution: Object.freeze([1548995, 1220057, 849168, 602671, 410785, 275701, 164939, 74656, 22426])
  }),
  'Mexico': Object.freeze({
    fertility: 1.89,
    lifeExpectancy: 75.3,
    femaleShare: 0.5151,
    years: 80,
    ageDistribution: Object.freeze([20812539, 22406656, 21679964, 19823234, 16586516, 13598680, 9109785, 4791306, 2052325])
  }),
  'Moldova': Object.freeze({
    fertility: 1.73,
    lifeExpectancy: 71.3,
    femaleShare: 0.5399,
    years: 80,
    ageDistribution: Object.freeze([386630, 399472, 307930, 466484, 415136, 360693, 397900, 223740, 76976])
  }),
  'Mongolia': Object.freeze({
    fertility: 2.63,
    lifeExpectancy: 72.0,
    femaleShare: 0.5014,
    years: 80,
    ageDistribution: Object.freeze([739925, 650610, 449701, 551878, 444453, 334870, 209138, 69271, 25693])
  }),
  'Montenegro': Object.freeze({
    fertility: 1.80,
    lifeExpectancy: 77.3,
    femaleShare: 0.5187,
    years: 80,
    ageDistribution: Object.freeze([75268, 79943, 78350, 80688, 88397, 81045, 79380, 50873, 24532])
  }),
  'Morocco': Object.freeze({
    fertility: 2.21,
    lifeExpectancy: 75.5,
    femaleShare: 0.4958,
    years: 80,
    ageDistribution: Object.freeze([6400913, 6550809, 5794060, 5761922, 4999647, 3872840, 2897173, 1394711, 409097])
  }),
  'Mozambique': Object.freeze({
    fertility: 4.69,
    lifeExpectancy: 63.8,
    femaleShare: 0.5148,
    years: 80,
    ageDistribution: Object.freeze([10877092, 8294282, 5935537, 4027315, 2528352, 1538450, 881772, 455577, 93393])
  }),
  'Myanmar': Object.freeze({
    fertility: 2.10,
    lifeExpectancy: 67.1,
    femaleShare: 0.5022,
    years: 80,
    ageDistribution: Object.freeze([8870052, 8768810, 8896310, 8386535, 7461132, 5896611, 3959417, 1807688, 453532])
  }),
  'Namibia': Object.freeze({
    fertility: 3.21,
    lifeExpectancy: 67.5,
    femaleShare: 0.5116,
    years: 80,
    ageDistribution: Object.freeze([788673, 615683, 517685, 442401, 298486, 188325, 113503, 48856, 16517])
  }),
  'Nepal': Object.freeze({
    fertility: 1.96,
    lifeExpectancy: 70.6,
    femaleShare: 0.5211,
    years: 80,
    ageDistribution: Object.freeze([5561989, 5810085, 5552153, 4220094, 3256044, 2406872, 1663752, 924777, 255290])
  }),
  'Netherlands': Object.freeze({
    fertility: 1.43,
    lifeExpectancy: 82.3,
    femaleShare: 0.5032,
    years: 80,
    ageDistribution: Object.freeze([1796024, 1957631, 2411665, 2417384, 2148713, 2520588, 2312720, 1745471, 918545])
  }),
  'New Caledonia': Object.freeze({
    fertility: 1.96,
    lifeExpectancy: 78.9,
    femaleShare: 0.5067,
    years: 80,
    ageDistribution: Object.freeze([41323, 42348, 40654, 42652, 40055, 37520, 25991, 15299, 6798])
  }),
  'New Zealand': Object.freeze({
    fertility: 1.66,
    lifeExpectancy: 82.2,
    femaleShare: 0.5031,
    years: 80,
    ageDistribution: Object.freeze([610580, 665171, 679105, 756297, 637721, 652354, 588885, 409476, 214355])
  }),
  'Nicaragua': Object.freeze({
    fertility: 2.21,
    lifeExpectancy: 75.1,
    femaleShare: 0.5081,
    years: 80,
    ageDistribution: Object.freeze([1320224, 1320488, 1224597, 1088910, 823766, 563813, 335748, 177079, 61511])
  }),
  'Niger': Object.freeze({
    fertility: 5.94,
    lifeExpectancy: 61.4,
    femaleShare: 0.4923,
    years: 80,
    ageDistribution: Object.freeze([8948028, 6715749, 4433916, 2751676, 1848984, 1204977, 740807, 322828, 65444])
  }),
  'Nigeria': Object.freeze({
    fertility: 4.38,
    lifeExpectancy: 54.6,
    femaleShare: 0.4943,
    years: 80,
    ageDistribution: Object.freeze([65629607, 55868182, 39595548, 27514895, 20264063, 12512414, 7278354, 3231010, 785406])
  }),
  'North Korea': Object.freeze({
    fertility: 1.78,
    lifeExpectancy: 73.7,
    femaleShare: 0.5053,
    years: 80,
    ageDistribution: Object.freeze([3396586, 3264888, 3756877, 3813178, 3346172, 4121919, 2757290, 1384889, 657023])
  }),
  'Norway': Object.freeze({
    fertility: 1.41,
    lifeExpectancy: 83.5,
    femaleShare: 0.4960,
    years: 80,
    ageDistribution: Object.freeze([576779, 663609, 714524, 784166, 719426, 746669, 619407, 489823, 262258])
  }),
  'Oman': Object.freeze({
    fertility: 2.51,
    lifeExpectancy: 80.2,
    femaleShare: 0.3779,
    years: 80,
    ageDistribution: Object.freeze([905837, 696577, 978062, 1313735, 825208, 334596, 141030, 62105, 24389])
  }),
  'Pakistan': Object.freeze({
    fertility: 3.55,
    lifeExpectancy: 67.8,
    femaleShare: 0.4928,
    years: 80,
    ageDistribution: Object.freeze([62322521, 56370007, 43701688, 33013216, 23112310, 15901867, 10654759, 4813598, 1379197])
  }),
  'Palestine': Object.freeze({
    fertility: 3.25,
    lifeExpectancy: 69.2,
    femaleShare: 0.5036,
    years: 80,
    ageDistribution: Object.freeze([1432356, 1223429, 937172, 771862, 486238, 318523, 199522, 96095, 30245])
  }),
  'Panama': Object.freeze({
    fertility: 2.11,
    lifeExpectancy: 79.8,
    femaleShare: 0.5000,
    years: 80,
    ageDistribution: Object.freeze([741452, 749133, 704176, 655252, 571714, 483802, 332978, 186148, 90922])
  }),
  'Papua New Guinea': Object.freeze({
    fertility: 3.07,
    lifeExpectancy: 66.3,
    femaleShare: 0.4857,
    years: 80,
    ageDistribution: Object.freeze([2417125, 2169439, 1865550, 1552591, 1156362, 788016, 432300, 158865, 36254])
  }),
  'Paraguay': Object.freeze({
    fertility: 2.42,
    lifeExpectancy: 74.0,
    femaleShare: 0.4986,
    years: 80,
    ageDistribution: Object.freeze([1352834, 1214995, 1176858, 1106397, 797969, 593229, 405685, 204567, 76619])
  }),
  'Peru': Object.freeze({
    fertility: 1.96,
    lifeExpectancy: 77.9,
    femaleShare: 0.5027,
    years: 80,
    ageDistribution: Object.freeze([5394639, 5702983, 5558804, 5313304, 4382865, 3418749, 2339206, 1413518, 693780])
  }),
  'Philippines': Object.freeze({
    fertility: 1.89,
    lifeExpectancy: 69.9,
    femaleShare: 0.5012,
    years: 80,
    ageDistribution: Object.freeze([20525572, 23053498, 20989150, 17620323, 13434737, 10045470, 6675255, 2848443, 651224])
  }),
  'Poland': Object.freeze({
    fertility: 1.30,
    lifeExpectancy: 78.8,
    femaleShare: 0.5155,
    years: 80,
    ageDistribution: Object.freeze([3631894, 4076176, 3985772, 5692081, 6284283, 4746668, 4882436, 3596055, 1643838])
  }),
  'Portugal': Object.freeze({
    fertility: 1.51,
    lifeExpectancy: 82.6,
    femaleShare: 0.5237,
    years: 80,
    ageDistribution: Object.freeze([865877, 986900, 1114299, 1148740, 1496927, 1526001, 1407292, 1138729, 740526])
  }),
  'Puerto Rico': Object.freeze({
    fertility: 0.94,
    lifeExpectancy: 81.9,
    femaleShare: 0.5292,
    years: 80,
    ageDistribution: Object.freeze([219286, 344476, 419173, 376438, 409425, 442949, 446225, 360200, 224030])
  }),
  'Qatar': Object.freeze({
    fertility: 1.72,
    lifeExpectancy: 82.5,
    femaleShare: 0.2872,
    years: 80,
    ageDistribution: Object.freeze([318318, 261991, 510227, 971381, 624812, 256254, 81879, 19008, 4555])
  }),
  'Romania': Object.freeze({
    fertility: 1.71,
    lifeExpectancy: 76.1,
    femaleShare: 0.5157,
    years: 80,
    ageDistribution: Object.freeze([1955296, 2126505, 2002552, 2460262, 2783762, 2867917, 2216966, 1761710, 840118])
  }),
  'Russia': Object.freeze({
    fertility: 1.46,
    lifeExpectancy: 73.3,
    femaleShare: 0.5359,
    years: 80,
    ageDistribution: Object.freeze([15833827, 17132174, 14544983, 22728809, 21994674, 17872372, 18752064, 10921418, 5040103])
  }),
  'Rwanda': Object.freeze({
    fertility: 3.64,
    lifeExpectancy: 68.0,
    femaleShare: 0.5122,
    years: 80,
    ageDistribution: Object.freeze([3685805, 3233521, 2447124, 1912385, 1361106, 750040, 552281, 249231, 65071])
  }),
  'S. Sudan': Object.freeze({
    fertility: 3.79,
    lifeExpectancy: 57.7,
    femaleShare: 0.5082,
    years: 80,
    ageDistribution: Object.freeze([2980721, 3181904, 2001667, 1166738, 1215752, 800868, 401291, 157316, 37150])
  }),
  'Saudi Arabia': Object.freeze({
    fertility: 2.31,
    lifeExpectancy: 79.0,
    femaleShare: 0.3946,
    years: 80,
    ageDistribution: Object.freeze([5412005, 5113188, 6014863, 7796783, 5180071, 2679157, 1202776, 416889, 147024])
  }),
  'Senegal': Object.freeze({
    fertility: 3.77,
    lifeExpectancy: 68.9,
    femaleShare: 0.4917,
    years: 80,
    ageDistribution: Object.freeze([4821122, 4292946, 3346737, 2354963, 1611320, 1043085, 643657, 304183, 83970])
  }),
  'Serbia': Object.freeze({
    fertility: 1.50,
    lifeExpectancy: 76.9,
    femaleShare: 0.5256,
    years: 80,
    ageDistribution: Object.freeze([635759, 665432, 726588, 850714, 964686, 906135, 932010, 741837, 313056])
  }),
  'Sierra Leone': Object.freeze({
    fertility: 3.70,
    lifeExpectancy: 62.0,
    femaleShare: 0.5013,
    years: 80,
    ageDistribution: Object.freeze([2258539, 1974944, 1563106, 1117495, 771738, 504478, 293585, 126307, 31831])
  }),
  'Slovakia': Object.freeze({
    fertility: 1.56,
    lifeExpectancy: 78.5,
    femaleShare: 0.5118,
    years: 80,
    ageDistribution: Object.freeze([571875, 576102, 565100, 798001, 899143, 731928, 682756, 480092, 201760])
  }),
  'Slovenia': Object.freeze({
    fertility: 1.58,
    lifeExpectancy: 81.8,
    femaleShare: 0.4975,
    years: 80,
    ageDistribution: Object.freeze([198480, 219113, 210264, 264760, 318732, 300579, 282826, 205009, 118934])
  }),
  'Solomon Is.': Object.freeze({
    fertility: 3.51,
    lifeExpectancy: 70.7,
    femaleShare: 0.4887,
    years: 80,
    ageDistribution: Object.freeze([206905, 179399, 140686, 106094, 83850, 55377, 28922, 13540, 4426])
  }),
  'Somalia': Object.freeze({
    fertility: 6.01,
    lifeExpectancy: 59.0,
    femaleShare: 0.4990,
    years: 80,
    ageDistribution: Object.freeze([6460012, 4445061, 3177774, 1972663, 1338998, 832959, 505615, 225778, 50291])
  }),
  'South Africa': Object.freeze({
    fertility: 2.21,
    lifeExpectancy: 66.3,
    femaleShare: 0.5133,
    years: 80,
    ageDistribution: Object.freeze([11254237, 10669405, 10684736, 11134116, 8278932, 5480864, 3947106, 1817556, 740237])
  }),
  'South Korea': Object.freeze({
    fertility: 0.73,
    lifeExpectancy: 84.4,
    femaleShare: 0.5009,
    years: 80,
    ageDistribution: Object.freeze([3178452, 4589219, 6373983, 6898679, 7858816, 8639266, 7705065, 4030934, 2443177])
  }),
  'Spain': Object.freeze({
    fertility: 1.22,
    lifeExpectancy: 83.8,
    femaleShare: 0.5090,
    years: 80,
    ageDistribution: Object.freeze([3812479, 4937951, 4946731, 5670663, 7510998, 7566820, 6126554, 4303917, 3034413])
  }),
  'Sri Lanka': Object.freeze({
    fertility: 1.95,
    lifeExpectancy: 77.7,
    femaleShare: 0.5162,
    years: 80,
    ageDistribution: Object.freeze([3308809, 3589650, 3344974, 3138172, 3146897, 2609065, 2175378, 1341359, 449261])
  }),
  'Sudan': Object.freeze({
    fertility: 4.26,
    lifeExpectancy: 66.5,
    femaleShare: 0.5042,
    years: 80,
    ageDistribution: Object.freeze([14407873, 11447049, 8965456, 6172777, 4005389, 2780717, 1762430, 729414, 177859])
  }),
  'Suriname': Object.freeze({
    fertility: 2.23,
    lifeExpectancy: 73.8,
    femaleShare: 0.5005,
    years: 80,
    ageDistribution: Object.freeze([107411, 109668, 106267, 87720, 77002, 68706, 47174, 21548, 8937])
  }),
  'Sweden': Object.freeze({
    fertility: 1.43,
    lifeExpectancy: 83.4,
    femaleShare: 0.4963,
    years: 80,
    ageDistribution: Object.freeze([1166695, 1255334, 1226424, 1504617, 1304634, 1348068, 1149165, 1020021, 632041])
  }),
  'Switzerland': Object.freeze({
    fertility: 1.44,
    lifeExpectancy: 84.1,
    femaleShare: 0.5032,
    years: 80,
    ageDistribution: Object.freeze([885349, 884944, 974197, 1251274, 1236314, 1294112, 1099071, 773368, 523354])
  }),
  'Syria': Object.freeze({
    fertility: 2.70,
    lifeExpectancy: 72.6,
    femaleShare: 0.4998,
    years: 80,
    ageDistribution: Object.freeze([4467599, 5651238, 5214202, 3096902, 2553318, 1865923, 1137957, 533645, 151977])
  }),
  'Taiwan': Object.freeze({
    fertility: 0.87,
    lifeExpectancy: 81.1,
    femaleShare: 0.5015,
    years: 80,
    ageDistribution: Object.freeze([1528857, 2035884, 2494151, 3069059, 3778471, 3504601, 3408087, 2231570, 960812])
  }),
  'Tajikistan': Object.freeze({
    fertility: 3.04,
    lifeExpectancy: 71.9,
    femaleShare: 0.5086,
    years: 80,
    ageDistribution: Object.freeze([2653575, 2116638, 1749973, 1577858, 1027804, 753725, 503890, 162119, 45346])
  }),
  'Tanzania': Object.freeze({
    fertility: 4.54,
    lifeExpectancy: 67.2,
    femaleShare: 0.5043,
    years: 80,
    ageDistribution: Object.freeze([20775861, 15859640, 11766273, 8154686, 5596974, 3324291, 1798461, 977183, 306788])
  }),
  'Thailand': Object.freeze({
    fertility: 1.20,
    lifeExpectancy: 76.6,
    femaleShare: 0.5131,
    years: 80,
    ageDistribution: Object.freeze([6544109, 8318151, 9715506, 10101070, 10582799, 10667448, 8602623, 4798911, 2337396])
  }),
  'Timor-Leste': Object.freeze({
    fertility: 2.63,
    lifeExpectancy: 67.9,
    femaleShare: 0.4959,
    years: 80,
    ageDistribution: Object.freeze([318922, 309842, 268369, 187842, 116412, 93921, 54314, 39312, 11702])
  }),
  'Togo': Object.freeze({
    fertility: 4.12,
    lifeExpectancy: 62.9,
    femaleShare: 0.4967,
    years: 80,
    ageDistribution: Object.freeze([2607736, 2161411, 1570765, 1197779, 892560, 586035, 332110, 141334, 25504])
  }),
  'Trinidad and Tobago': Object.freeze({
    fertility: 1.54,
    lifeExpectancy: 73.6,
    femaleShare: 0.5057,
    years: 80,
    ageDistribution: Object.freeze([173035, 189363, 193955, 246569, 240512, 184252, 168379, 89048, 22671])
  }),
  'Tunisia': Object.freeze({
    fertility: 1.82,
    lifeExpectancy: 76.7,
    femaleShare: 0.5057,
    years: 80,
    ageDistribution: Object.freeze([1909893, 1924891, 1641408, 1890220, 1741072, 1398819, 1081029, 518137, 171639])
  }),
  'Turkey': Object.freeze({
    fertility: 1.62,
    lifeExpectancy: 77.4,
    femaleShare: 0.5009,
    years: 80,
    ageDistribution: Object.freeze([12053423, 12990588, 13453800, 13020009, 12948103, 9881762, 7374290, 4147184, 1604647])
  }),
  'Turkmenistan': Object.freeze({
    fertility: 2.66,
    lifeExpectancy: 70.2,
    femaleShare: 0.5092,
    years: 80,
    ageDistribution: Object.freeze([1620016, 1285748, 1171744, 1223668, 887062, 712833, 423405, 132902, 37118])
  }),
  'Uganda': Object.freeze({
    fertility: 4.16,
    lifeExpectancy: 68.5,
    femaleShare: 0.5040,
    years: 80,
    ageDistribution: Object.freeze([15250765, 12333916, 9269326, 5978249, 3345171, 2099659, 1092387, 474144, 171476])
  }),
  'Ukraine': Object.freeze({
    fertility: 0.99,
    lifeExpectancy: 74.7,
    femaleShare: 0.5352,
    years: 80,
    ageDistribution: Object.freeze([3050468, 4261367, 3736770, 5895234, 5850154, 5123040, 5181608, 3004718, 1756861])
  }),
  'United Arab Emirates': Object.freeze({
    fertility: 1.21,
    lifeExpectancy: 83.1,
    femaleShare: 0.3610,
    years: 80,
    ageDistribution: Object.freeze([1197271, 1082083, 2375866, 3191528, 1848467, 918425, 309311, 84147, 20032])
  }),
  'United Kingdom': Object.freeze({
    fertility: 1.55,
    lifeExpectancy: 81.4,
    femaleShare: 0.5076,
    years: 80,
    ageDistribution: Object.freeze([7587725, 8399149, 8429955, 9271225, 8701118, 9105300, 7827823, 6157079, 3658817])
  }),
  'United States of America': Object.freeze({
    fertility: 1.62,
    lifeExpectancy: 79.5,
    femaleShare: 0.4976,
    years: 80,
    ageDistribution: Object.freeze([38633297, 43978301, 45236901, 48202835, 44087309, 41665765, 41440593, 28122470, 14059099])
  }),
  'Uruguay': Object.freeze({
    fertility: 1.40,
    lifeExpectancy: 78.3,
    femaleShare: 0.5150,
    years: 80,
    ageDistribution: Object.freeze([387272, 466731, 494224, 474733, 439849, 397482, 339952, 225491, 160852])
  }),
  'Uzbekistan': Object.freeze({
    fertility: 3.49,
    lifeExpectancy: 72.5,
    femaleShare: 0.4955,
    years: 80,
    ageDistribution: Object.freeze([8132173, 5960751, 5293390, 5986159, 4326285, 3210782, 2246409, 899613, 306298])
  }),
  'Vanuatu': Object.freeze({
    fertility: 3.57,
    lifeExpectancy: 71.7,
    femaleShare: 0.4952,
    years: 80,
    ageDistribution: Object.freeze([86973, 70330, 50744, 46073, 29484, 22146, 13972, 6272, 1785])
  }),
  'Venezuela': Object.freeze({
    fertility: 2.08,
    lifeExpectancy: 72.7,
    femaleShare: 0.5059,
    years: 80,
    ageDistribution: Object.freeze([4528463, 5455928, 4143977, 3570141, 3547107, 3109773, 2357622, 1244528, 448005])
  }),
  'Vietnam': Object.freeze({
    fertility: 1.90,
    lifeExpectancy: 74.7,
    femaleShare: 0.5102,
    years: 80,
    ageDistribution: Object.freeze([14945753, 15818641, 13179659, 17018571, 14348536, 11610525, 8680346, 3850669, 1534984])
  }),
  'W. Sahara': Object.freeze({
    fertility: 2.18,
    lifeExpectancy: 71.6,
    femaleShare: 0.4489,
    years: 80,
    ageDistribution: Object.freeze([91862, 86076, 85048, 105927, 100296, 61388, 38299, 17811, 3802])
  }),
  'Yemen': Object.freeze({
    fertility: 4.50,
    lifeExpectancy: 69.4,
    femaleShare: 0.4934,
    years: 80,
    ageDistribution: Object.freeze([12016156, 8858522, 6932291, 5619098, 3529909, 1992952, 1029677, 461704, 142856])
  }),
  'Zambia': Object.freeze({
    fertility: 4.04,
    lifeExpectancy: 66.5,
    femaleShare: 0.5050,
    years: 80,
    ageDistribution: Object.freeze([6124351, 5113843, 3722226, 2732075, 1876155, 1033877, 494274, 179288, 38867])
  }),
  'Zimbabwe': Object.freeze({
    fertility: 3.67,
    lifeExpectancy: 63.1,
    femaleShare: 0.5233,
    years: 80,
    ageDistribution: Object.freeze([4538791, 4147979, 2743861, 1958553, 1687284, 718842, 474866, 286986, 77211])
  })
});

// Territories without reliable population data — render in gray on the map.
const NO_DATA_TERRITORIES = new Set([
  'Antarctica',
  'Fr. S. Antarctic Lands',
  'N. Cyprus',
  'Somaliland'
]);
const NO_DATA_PROFILE = Object.freeze({
  fertility: 0,
  lifeExpectancy: 0,
  femaleShare: 0.5,
  years: 80,
  ageDistribution: Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0])
});

const CRIMEA_BOUNDS = Object.freeze({
  minLon: 32.0,
  maxLon: 37.8,
  minLat: 44.0,
  maxLat: 46.8
});
const CRIMEA_REFERENCE_POINT = Object.freeze([34.2, 45.3]);
const CRIMEA_OVERLAY_POLYGON = Object.freeze([
  [32.45, 45.32],
  [32.74, 46.15],
  [34.2, 46.28],
  [35.95, 46.2],
  [36.65, 45.45],
  [36.35, 44.55],
  [35.3, 44.22],
  [34.1, 44.34],
  [33.2, 44.55],
  [32.62, 45.01],
  [32.45, 45.32]
]);
const numberFormatter = new Intl.NumberFormat('en-US');
const simulationLogic = window.SimulationLogic;

if (!simulationLogic) {
  throw new Error('simulation-logic.js failed to load before app.js.');
}

const { makeYearLabels, simulatePopulation, totalPopulation } = simulationLogic;

const elements = {
  mapContainer: document.getElementById('world-map'),
  mapStatus: document.getElementById('map-status'),
  selectedCountry: document.getElementById('selected-country'),
  fertilityInput: document.getElementById('fertility-input'),
  lifeInput: document.getElementById('life-input'),
  femaleShareInput: document.getElementById('female-share-input'),
  yearsInput: document.getElementById('years-input'),
  totalPopulationInput: document.getElementById('total-population-input'),
  ageInputs: document.getElementById('age-inputs'),
  runButton: document.getElementById('run-button'),
  runStatus: document.getElementById('run-status'),
  ageCanvas: document.getElementById('age-chart'),
  resultCanvas: document.getElementById('result-chart')
};

const state = {
  selectedCountryId: null,
  selectedCountryName: null,
  countryProfiles: new Map(),
  countries: [],
  countryPaths: null,
  crimeaOverlayPath: null,
  shouldRenderCrimeaOverlay: false,
  crimeaGeometry: {
    type: 'Polygon',
    coordinates: [CRIMEA_OVERLAY_POLYGON]
  },
  ageChart: null,
  resultChart: null,
  ageInputs: []
};

initialize();

function initialize() {
  buildAgeInputGrid();
  initializeCharts();
  wireControls();
  loadWorldMap();
}

function buildAgeInputGrid() {
  elements.ageInputs.innerHTML = '';
  state.ageInputs = [];

  AGE_GROUPS.forEach((label, index) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'age-item';

    const title = document.createElement('span');
    title.textContent = label;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '1000';
    input.value = String(WORLD_DEFAULT_PROFILE.ageDistribution[index]);
    input.dataset.index = String(index);
    input.addEventListener('input', () => {
      if (!state.selectedCountryId) {
        return;
      }

      const value = sanitizePopulation(input.value);
      updateAgeBucket(index, value, { from: 'input' });
    });

    wrapper.append(title, input);
    elements.ageInputs.appendChild(wrapper);
    state.ageInputs.push(input);
  });
}

function initializeCharts() {
  state.ageChart = new Chart(elements.ageCanvas, {
    type: 'bar',
    data: {
      labels: AGE_GROUPS,
      datasets: [
        {
          label: 'People',
          data: [...WORLD_DEFAULT_PROFILE.ageDistribution],
          backgroundColor: '#137177',
          borderColor: '#0c5666',
          borderWidth: 1
        }
      ]
    },
    options: {
      animation: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context) {
              return ` ${numberFormatter.format(Math.round(context.raw))} people`;
            }
          }
        },
        dragData: {
          round: 0,
          dragY: true,
          showTooltip: true,
          onDragEnd(event, datasetIndex, index, value) {
            if (!state.selectedCountryId) {
              return;
            }

            updateAgeBucket(index, sanitizePopulation(value), { from: 'chart' });
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Age group'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Population'
          },
          ticks: {
            callback(value) {
              return compactNumber(value);
            }
          }
        }
      }
    }
  });

  state.resultChart = new Chart(elements.resultCanvas, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Total population',
          data: [],
          borderColor: '#ef6351',
          backgroundColor: 'rgba(239, 99, 81, 0.18)',
          tension: 0.22,
          fill: true,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total population'
          },
          ticks: {
            callback(value) {
              return compactNumber(value);
            }
          }
        }
      }
    }
  });
}

function wireControls() {
  elements.fertilityInput.addEventListener('input', () => {
    const current = getCurrentProfile();
    updateCurrentProfile({
      fertility: clampNumber(parseFloat(elements.fertilityInput.value), 0, 10, current ? current.fertility : WORLD_DEFAULT_PROFILE.fertility)
    });
  });

  elements.lifeInput.addEventListener('input', () => {
    const current = getCurrentProfile();
    updateCurrentProfile({
      lifeExpectancy: clampNumber(
        parseFloat(elements.lifeInput.value),
        20,
        120,
        current ? current.lifeExpectancy : WORLD_DEFAULT_PROFILE.lifeExpectancy
      )
    });
  });

  elements.femaleShareInput.addEventListener('input', () => {
    const current = getCurrentProfile();
    updateCurrentProfile({
      femaleShare: clampNumber(parseFloat(elements.femaleShareInput.value), 0, 1, current ? current.femaleShare : 0.5)
    });
  });

  elements.yearsInput.addEventListener('input', () => {
    updateCurrentProfile({
      years: Math.round(clampNumber(parseFloat(elements.yearsInput.value), 1, 300, 80))
    });
  });

  elements.runButton.addEventListener('click', () => {
    if (!state.selectedCountryId) {
      elements.runStatus.textContent = 'Select a country or click ocean for World Total first.';
      return;
    }

    runSimulationForCurrentCountry();
  });
}

function loadWorldMap() {
  elements.mapStatus.textContent = 'Loading local world boundaries...';

  try {
    const world = window.COUNTRIES_110M;
    const countriesObject = world && world.objects && world.objects.countries ? world.objects.countries : null;

    if (!countriesObject) {
      throw new Error('Invalid local map topology format.');
    }

    state.countries = topojson
      .feature(world, countriesObject)
      .features.filter((feature) => feature && feature.geometry)
      .map((feature, index) => {
        const rawId = feature.id !== undefined && feature.id !== null ? feature.id : `country-${index}`;
        const rawName =
          (feature.properties && (feature.properties.name || feature.properties.NAME || feature.properties.admin)) ||
          `Country ${rawId}`;

        return {
          ...feature,
          id: String(rawId),
          properties: {
            ...feature.properties,
            name: rawName
          }
        };
      });

    state.crimeaGeometry = {
      type: 'Polygon',
      coordinates: [CRIMEA_OVERLAY_POLYGON]
    };
    reassignCrimeaToUkraine(state.countries);
    preloadCountryProfiles();
    drawMap();
    selectWorldTotal();
  } catch (error) {
    console.error(error);
    elements.mapStatus.textContent = 'Map failed to load local data. Reload this page.';
  }
}

function drawMap() {
  elements.mapContainer.innerHTML = '';

  const width = Math.max(620, elements.mapContainer.clientWidth);
  const height = Math.max(340, Math.round(width * 0.55));

  const svg = d3
    .select(elements.mapContainer)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('role', 'img')
    .attr('aria-label', 'Political map of the world');

  const defs = svg.append('defs');
  const pattern = defs.append('pattern')
    .attr('id', 'no-data-pattern')
    .attr('width', 6)
    .attr('height', 6)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('patternTransform', 'rotate(45)');
  pattern.append('rect').attr('width', 6).attr('height', 6).attr('fill', '#d0d5da');
  pattern.append('line')
    .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 6)
    .attr('stroke', '#9aa3ab').attr('stroke-width', 2);

  svg.on('click', () => {
    selectWorldTotal();
  });

  const projection = d3.geoNaturalEarth1().fitSize(
    [width, height],
    {
      type: 'FeatureCollection',
      features: state.countries
    }
  );

  const path = d3.geoPath(projection);

  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', '#e6f3f6');

  state.countryPaths = svg
    .append('g')
    .selectAll('path')
    .data(state.countries)
    .join('path')
    .attr('class', 'map-country')
    .attr('d', path)
    .on('click', (event, feature) => {
      event.stopPropagation();
      selectCountry(feature);
    });

  state.countryPaths.append('title');

  const ukraine = findCountryByName('Ukraine');
  if (ukraine && state.shouldRenderCrimeaOverlay) {
    state.crimeaOverlayPath = svg
      .append('path')
      .datum({
        type: 'Feature',
        properties: {
          name: 'Crimea (Ukraine)'
        },
        geometry: state.crimeaGeometry
      })
      .attr('class', 'crimea-overlay')
      .attr('d', path)
      .on('click', (event) => {
        event.stopPropagation();
        selectCountry(ukraine);
      });

    state.crimeaOverlayPath.append('title');
  } else {
    state.crimeaOverlayPath = null;
  }

  updateMapColors();
  elements.mapStatus.textContent = 'Click a country, or click ocean for World Total.';
}

function normalizeCountryName(name) {
  return String(name || '')
    .trim()
    .toLowerCase();
}

function findCountryByName(name) {
  const normalizedTarget = normalizeCountryName(name);
  return state.countries.find((country) => normalizeCountryName(country.properties && country.properties.name) === normalizedTarget) || null;
}

function featurePolygons(feature) {
  if (!feature || !feature.geometry) {
    return [];
  }

  if (feature.geometry.type === 'Polygon') {
    return [feature.geometry.coordinates];
  }

  if (feature.geometry.type === 'MultiPolygon') {
    return [...feature.geometry.coordinates];
  }

  return [];
}

function setFeaturePolygons(feature, polygons) {
  if (!feature || polygons.length === 0) {
    return;
  }

  if (polygons.length === 1) {
    feature.geometry = {
      type: 'Polygon',
      coordinates: polygons[0]
    };
    return;
  }

  feature.geometry = {
    type: 'MultiPolygon',
    coordinates: polygons
  };
}

function isInCrimeaBounds(point) {
  if (!Array.isArray(point) || point.length < 2) {
    return false;
  }

  const [lon, lat] = point;
  return lon >= CRIMEA_BOUNDS.minLon && lon <= CRIMEA_BOUNDS.maxLon && lat >= CRIMEA_BOUNDS.minLat && lat <= CRIMEA_BOUNDS.maxLat;
}

function reassignCrimeaToUkraine(features) {
  const russia = features.find((country) => normalizeCountryName(country.properties && country.properties.name) === 'russia');
  const ukraine = features.find((country) => normalizeCountryName(country.properties && country.properties.name) === 'ukraine');

  if (!ukraine) {
    state.shouldRenderCrimeaOverlay = false;
    return;
  }

  const ukrainePolygons = featurePolygons(ukraine);
  if (ukrainePolygons.length === 0) {
    state.shouldRenderCrimeaOverlay = false;
    return;
  }

  const movedToUkraine = [];
  if (russia) {
    const russiaPolygons = featurePolygons(russia);
    const keepInRussia = [];

    russiaPolygons.forEach((polygon) => {
      const centroid = d3.geoCentroid({
        type: 'Polygon',
        coordinates: polygon
      });

      if (isInCrimeaBounds(centroid)) {
        movedToUkraine.push(polygon);
      } else {
        keepInRussia.push(polygon);
      }
    });

    if (movedToUkraine.length > 0 && keepInRussia.length > 0) {
      setFeaturePolygons(russia, keepInRussia);
      setFeaturePolygons(ukraine, ukrainePolygons.concat(movedToUkraine));
    }
  }

  const crimeaGeometryFromSource =
    movedToUkraine.length === 1
      ? {
          type: 'Polygon',
          coordinates: movedToUkraine[0]
        }
      : movedToUkraine.length > 1
        ? {
            type: 'MultiPolygon',
            coordinates: movedToUkraine
          }
        : null;

  state.crimeaGeometry = crimeaGeometryFromSource || {
    type: 'Polygon',
    coordinates: [CRIMEA_OVERLAY_POLYGON]
  };

  const ukraineHasCrimea = featureContainsPoint(ukraine, CRIMEA_REFERENCE_POINT);
  if (!ukraineHasCrimea) {
    const refreshedUkrainePolygons = featurePolygons(ukraine);
    const injectedCrimeaPolygons =
      state.crimeaGeometry.type === 'MultiPolygon'
        ? [...state.crimeaGeometry.coordinates]
        : [state.crimeaGeometry.coordinates];
    setFeaturePolygons(ukraine, refreshedUkrainePolygons.concat(injectedCrimeaPolygons));
  }

  state.shouldRenderCrimeaOverlay = Boolean(russia && featureContainsPoint(russia, CRIMEA_REFERENCE_POINT));
}

function featureContainsPoint(feature, point) {
  return featurePolygons(feature).some((polygon) =>
    d3.geoContains(
      {
        type: 'Polygon',
        coordinates: polygon
      },
      point
    )
  );
}

function createProfileFromDefaults(defaults) {
  return {
    fertility: defaults.fertility,
    lifeExpectancy: defaults.lifeExpectancy,
    femaleShare: defaults.femaleShare != null ? defaults.femaleShare : 0.5,
    years: defaults.years,
    ageDistribution: [...defaults.ageDistribution],
    result: null
  };
}

function defaultsForScenario(scenarioId, scenarioName) {
  if (scenarioId === WORLD_TOTAL_ID) {
    return WORLD_DEFAULT_PROFILE;
  }

  if (scenarioName && NO_DATA_TERRITORIES.has(scenarioName)) {
    return NO_DATA_PROFILE;
  }

  if (scenarioName && PRELOADED_COUNTRY_DEFAULTS_BY_NAME[scenarioName]) {
    return PRELOADED_COUNTRY_DEFAULTS_BY_NAME[scenarioName];
  }

  return FALLBACK_DEFAULT_PROFILE;
}

function preloadCountryProfiles() {
  state.countries.forEach((country) => {
    if (state.countryProfiles.has(country.id)) {
      return;
    }

    const countryName = country && country.properties ? country.properties.name : null;

    if (countryName && NO_DATA_TERRITORIES.has(countryName)) {
      state.countryProfiles.set(country.id, createProfileFromDefaults(NO_DATA_PROFILE));
      return;
    }

    const defaults = countryName ? PRELOADED_COUNTRY_DEFAULTS_BY_NAME[countryName] : null;
    if (defaults) {
      state.countryProfiles.set(country.id, createProfileFromDefaults(defaults));
    }
  });
}

function selectCountry(feature) {
  selectScenario(feature.id, feature.properties.name);
}

function selectWorldTotal() {
  selectScenario(WORLD_TOTAL_ID, WORLD_TOTAL_NAME);
}

function selectScenario(scenarioId, scenarioName) {
  state.selectedCountryId = scenarioId;
  state.selectedCountryName = scenarioName;

  const profile = getOrCreateProfile(scenarioId, scenarioName);

  elements.selectedCountry.textContent = state.selectedCountryName;
  elements.fertilityInput.value = String(profile.fertility);
  elements.lifeInput.value = String(profile.lifeExpectancy);
  elements.femaleShareInput.value = String(profile.femaleShare != null ? profile.femaleShare : 0.5);
  elements.yearsInput.value = String(profile.years);

  renderAgeControls(profile.ageDistribution);
  updateMapColors();
  updateMapStatus();

  if (profile.result) {
    const labels = makeYearLabels(profile.result.startYear, profile.result.totals.length);
    renderResultChart(labels, profile.result.totals, state.selectedCountryName);
    elements.runStatus.textContent = `Loaded previous simulation for ${state.selectedCountryName}.`;
  } else {
    clearResultChart();
    elements.runStatus.textContent = '';
  }
}

function getOrCreateProfile(countryId, countryName = null) {
  const existing = state.countryProfiles.get(countryId);
  if (existing) {
    return existing;
  }

  const defaults = defaultsForScenario(countryId, countryName);
  const profile = createProfileFromDefaults(defaults);

  state.countryProfiles.set(countryId, profile);
  return profile;
}

function getCurrentProfile() {
  if (!state.selectedCountryId) {
    return null;
  }

  return getOrCreateProfile(state.selectedCountryId, state.selectedCountryName);
}

function updateCurrentProfile(partial) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  Object.assign(profile, partial);
  profile.result = null;
  elements.runStatus.textContent = '';
  updateMapStatus();
}

function renderAgeControls(distribution) {
  distribution.forEach((value, index) => {
    if (state.ageInputs[index]) {
      state.ageInputs[index].value = String(Math.round(value));
    }
  });

  state.ageChart.data.datasets[0].data = [...distribution];
  state.ageChart.update();
  renderTotalPopulation(distribution);
}

function updateAgeBucket(index, value, meta) {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  profile.ageDistribution[index] = value;
  profile.result = null;

  if (meta.from !== 'input' && state.ageInputs[index]) {
    state.ageInputs[index].value = String(Math.round(value));
  }

  state.ageChart.data.datasets[0].data = [...profile.ageDistribution];
  state.ageChart.update();
  renderTotalPopulation(profile.ageDistribution);

  elements.runStatus.textContent = '';
  updateMapColors();
  updateMapStatus();
}

function renderTotalPopulation(distribution) {
  if (!elements.totalPopulationInput) {
    return;
  }

  elements.totalPopulationInput.value = numberFormatter.format(totalPopulation(distribution));
}

function updateMapColors() {
  if (!state.countryPaths) {
    return;
  }

  const totals = state.countries
    .map((country) => {
      const profile = state.countryProfiles.get(country.id);
      return profile ? totalPopulation(profile.ageDistribution) : null;
    })
    .filter((value) => value !== null);

  const maxKnownPopulation = totals.length > 0 ? Math.max(...totals) : 1;
  const colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, maxKnownPopulation]);
  const fillColorForCountry = (country) => {
    if (country.id === state.selectedCountryId) {
      return '#ef6351';
    }

    const countryName = country.properties && country.properties.name;
    if (countryName && NO_DATA_TERRITORIES.has(countryName)) {
      return 'url(#no-data-pattern)';
    }

    const profile = state.countryProfiles.get(country.id);
    if (!profile) {
      return '#cfd8de';
    }

    return colorScale(totalPopulation(profile.ageDistribution));
  };

  state.countryPaths
    .attr('fill', (country) => fillColorForCountry(country))
    .select('title')
    .text((country) => {
      const countryName = country.properties && country.properties.name;
      if (countryName && NO_DATA_TERRITORIES.has(countryName)) {
        return `${countryName}: no data available`;
      }
      const profile = state.countryProfiles.get(country.id);
      const total = profile ? numberFormatter.format(totalPopulation(profile.ageDistribution)) : 'no scenario yet';
      return `${countryName}: ${total}`;
    });

  const ukraine = findCountryByName('Ukraine');
  if (state.crimeaOverlayPath && ukraine) {
    state.crimeaOverlayPath
      .attr('fill', fillColorForCountry(ukraine))
      .classed('selected', ukraine.id === state.selectedCountryId)
      .select('title')
      .text('Crimea: Ukraine');
  }
}

function updateMapStatus() {
  const profile = getCurrentProfile();
  if (!profile || !state.selectedCountryName) {
    elements.mapStatus.textContent = 'Click a country, or click ocean for World Total.';
    return;
  }

  elements.mapStatus.textContent = `${state.selectedCountryName}: ${numberFormatter.format(totalPopulation(profile.ageDistribution))} people today.`;
}

function runSimulationForCurrentCountry() {
  const profile = getCurrentProfile();
  if (!profile) {
    return;
  }

  const years = Math.max(1, Math.round(profile.years));
  const currentYear = new Date().getFullYear();
  const totals = simulatePopulation(profile.ageDistribution, profile.fertility, profile.lifeExpectancy, years, profile.femaleShare);

  profile.result = {
    startYear: currentYear,
    totals
  };

  renderResultChart(makeYearLabels(currentYear, totals.length), totals, state.selectedCountryName);

  const start = numberFormatter.format(totals[0]);
  const end = numberFormatter.format(totals[totals.length - 1]);

  elements.runStatus.textContent = `Simulation complete for ${state.selectedCountryName}. ${start} -> ${end} over ${years} years.`;
}

function renderResultChart(labels, values, countryName) {
  state.resultChart.data.labels = labels;
  state.resultChart.data.datasets[0].data = values;
  state.resultChart.data.datasets[0].label = `${countryName} total population`;
  state.resultChart.update();
}

function clearResultChart() {
  state.resultChart.data.labels = [];
  state.resultChart.data.datasets[0].data = [];
  state.resultChart.data.datasets[0].label = 'Total population';
  state.resultChart.update();
}

function sanitizePopulation(value) {
  if (!Number.isFinite(Number(value))) {
    return 0;
  }

  return Math.max(0, Math.round(Number(value)));
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function compactNumber(value) {
  const abs = Math.abs(Number(value));

  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }

  return `${Math.round(value)}`;
}
