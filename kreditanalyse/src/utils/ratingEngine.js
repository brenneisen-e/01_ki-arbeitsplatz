import { branchBenchmarks } from '../data/branchBenchmarks';

// Map company branch names to benchmark keys
const branchMapping = {
  'Maschinenbau': 'Maschinenbau',
  'IT-Dienstleistungen': 'IT-Dienstleister',
  'Gastronomie': 'Gastronomie',
  'Logistik/Transport': 'Logistik',
  'Medizintechnik': 'Medizintechnik',
  'Handwerk (Elektroinstallation)': 'Handwerk',
  'Immobilienwirtschaft': 'Immobilien',
  'E-Commerce / Online-Handel': 'E-Commerce',
};

const resolveBranche = (branche) => branchMapping[branche] || branche;

// Score a single metric (1=very good, 6=very bad)
// For "higher is better" metrics (EK-Quote, Renditen, Liquidität, Deckungsgrade, Zinsdeckung)
// For "lower is better" metrics (Verschuldungsgrad, dyn. Verschuldungsgrad, Tilgungsdauer, Aufwandsquoten)
const scoreHigherIsBetter = (value, benchmarks) => {
  if (value == null) return 4;
  if (value >= benchmarks.gut) return 1;
  if (value >= (benchmarks.gut + benchmarks.mittel) / 2) return 2;
  if (value >= benchmarks.mittel) return 3;
  if (value >= (benchmarks.mittel + benchmarks.schlecht) / 2) return 4;
  if (value >= benchmarks.schlecht) return 5;
  return 6;
};

const scoreLowerIsBetter = (value, benchmarks) => {
  if (value == null) return 4;
  if (value <= benchmarks.gut) return 1;
  if (value <= (benchmarks.gut + benchmarks.mittel) / 2) return 2;
  if (value <= benchmarks.mittel) return 3;
  if (value <= (benchmarks.mittel + benchmarks.schlecht) / 2) return 4;
  if (value <= benchmarks.schlecht) return 5;
  return 6;
};

// Map of which metrics are "lower is better"
const lowerIsBetterMetrics = ['verschuldungsgrad', 'dynamischer_verschuldungsgrad', 'schuldentilgungsdauer', 'personalaufwandsquote', 'materialaufwandsquote'];

export const scoreMetric = (metricName, value, branche) => {
  const bm = branchBenchmarks[resolveBranche(branche)];
  if (!bm || !bm[metricName]) return 3;
  const benchmarks = bm[metricName];
  if (lowerIsBetterMetrics.includes(metricName)) {
    return scoreLowerIsBetter(value, benchmarks);
  }
  return scoreHigherIsBetter(value, benchmarks);
};

// Traffic light color from score
export const scoreToTrafficLight = (score) => {
  if (score <= 2) return 'green';
  if (score <= 4) return 'yellow';
  return 'red';
};

// Quantitative rating weights
export const quantitativeWeights = {
  eigenkapitalquote: 0.15,
  verschuldungsgrad: 0.10,
  gesamtkapitalrentabilitaet: 0.10,
  ebitda_marge: 0.15,
  dynamischer_verschuldungsgrad: 0.15,
  zinsdeckungsgrad: 0.10,
  cashflow_rate: 0.10,
  liquiditaet3: 0.15
};

// Calculate quantitative rating
export const calculateQuantitativeRating = (ratios, branche) => {
  let totalScore = 0;
  const details = {};

  for (const [metric, weight] of Object.entries(quantitativeWeights)) {
    const value = ratios[metric];
    const score = scoreMetric(metric, value, branche);
    details[metric] = { value, score, weight, weightedScore: score * weight };
    totalScore += score * weight;
  }

  return { score: Math.round(totalScore * 100) / 100, details };
};

// Qualitative rating from answers (object with keys and scores 1-5)
export const calculateQualitativeRating = (answers) => {
  const scores = Object.values(answers).filter(v => v != null && !isNaN(v));
  if (scores.length === 0) return 3;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
};

// Account rating from konto data
export const calculateAccountRating = (konto) => {
  let score = 1;
  if (konto.auslastung_avg > 90) score += 2;
  else if (konto.auslastung_avg > 75) score += 1;

  if (konto.ueberziehungen_12m > 6) score += 2;
  else if (konto.ueberziehungen_12m > 3) score += 1;

  if (konto.ruecklastschriften_12m > 3) score += 2;
  else if (konto.ruecklastschriften_12m > 0) score += 1;

  if (konto.pfaendungen) score += 3;

  return Math.min(6, score);
};

// Owner rating from Schufa and Creditreform
export const calculateOwnerRating = (schufa, creditreformIndex) => {
  let schufaScore;
  if (schufa >= 97.5) schufaScore = 1;
  else if (schufa >= 95) schufaScore = 2;
  else if (schufa >= 90) schufaScore = 3;
  else if (schufa >= 85) schufaScore = 4;
  else schufaScore = 5;

  let crScore;
  if (creditreformIndex <= 200) crScore = 1;
  else if (creditreformIndex <= 250) crScore = 2;
  else if (creditreformIndex <= 300) crScore = 3;
  else if (creditreformIndex <= 350) crScore = 4;
  else crScore = 5;

  return Math.round(((schufaScore + crScore) / 2) * 10) / 10;
};

// Overall rating combining all components
export const calculateOverallRating = ({ quantitativeScore, qualitativeScore, accountScore, ownerAdjustment = 0 }) => {
  // Weights: Quantitative 65%, Qualitative 25%, Account 10%
  const baseScore = quantitativeScore * 0.65 + qualitativeScore * 0.25 + accountScore * 0.10;
  const adjusted = Math.max(1, Math.min(6, baseScore + ownerAdjustment));
  return Math.round(adjusted * 100) / 100;
};

// Map overall score to rating class (1-15 scale for Sparkassen)
export const scoreToRatingClass = (score) => {
  if (score <= 1.0) return { klasse: "1", pd: 0.01 };
  if (score <= 1.3) return { klasse: "1a", pd: 0.02 };
  if (score <= 1.5) return { klasse: "1b", pd: 0.03 };
  if (score <= 1.7) return { klasse: "1c", pd: 0.04 };
  if (score <= 1.9) return { klasse: "2a", pd: 0.05 };
  if (score <= 2.1) return { klasse: "2b", pd: 0.07 };
  if (score <= 2.3) return { klasse: "2c", pd: 0.10 };
  if (score <= 2.5) return { klasse: "3a", pd: 0.15 };
  if (score <= 2.7) return { klasse: "3b", pd: 0.23 };
  if (score <= 2.9) return { klasse: "3c", pd: 0.35 };
  if (score <= 3.1) return { klasse: "4a", pd: 0.50 };
  if (score <= 3.3) return { klasse: "4b", pd: 0.75 };
  if (score <= 3.5) return { klasse: "5a", pd: 1.10 };
  if (score <= 3.7) return { klasse: "5b", pd: 1.70 };
  if (score <= 3.9) return { klasse: "6", pd: 2.60 };
  if (score <= 4.2) return { klasse: "7", pd: 4.00 };
  if (score <= 4.5) return { klasse: "8", pd: 6.00 };
  if (score <= 4.8) return { klasse: "9", pd: 8.50 };
  if (score <= 5.1) return { klasse: "10", pd: 12.00 };
  if (score <= 5.4) return { klasse: "11", pd: 17.00 };
  if (score <= 5.7) return { klasse: "12", pd: 25.00 };
  return { klasse: "13", pd: 40.00 };
};

// Rating class color
export const ratingColor = (klasse) => {
  const num = parseInt(klasse) || parseInt(klasse.replace(/[a-c]/, ''));
  if (num <= 3) return '#00875A';
  if (num <= 5) return '#84cc16';
  if (num <= 7) return '#D97706';
  if (num <= 9) return '#ea580c';
  return '#DC2626';
};
