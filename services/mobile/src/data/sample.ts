/**
 * Sample view-model data mirroring the design board's LabOptimal screens. This
 * stands in for API responses until the Copilot lane wires real data. The
 * `markerPos` field is a 0..100 percentage for where the dot sits on the range
 * bar (deficient .. optimal .. high), which the engine's severity will drive
 * for real.
 */

import type { StatusBucket } from '@/types/protocol';

/** A food source for a nutrient, with its per-100 g amount when known. */
export interface FoodVM {
  name: string;
  amount?: string; // e.g. "8.8 mg / 100g"
}

export interface MarkerVM {
  name: string;
  value: string; // formatted, e.g. "18 ng/mL"
  markerPos: number; // 0..100 along the range bar
  bucket: StatusBucket;
  category?: string; // e.g. "Nutrients" — drives the home filter
  nutrient?: string; // canonical nutrient this marker maps to
  statusLabel?: string; // "Deficient", "Suboptimal", ...
  confidence?: number; // 0..1 extraction + rule confidence
  confidenceDrivers?: string[]; // why the confidence is what it is
  notes?: string | null; // clinical note / interaction insight from the engine
  foods?: FoodVM[]; // top food sources for this nutrient
}

export interface SupplementVM {
  name: string;
  dose: string;
  timing: string;
}

/** One meal in a plan day. */
export interface MealVM {
  slot: string; // "breakfast" | "lunch" | "dinner"
  title: string;
}

/** One day of the generated meal plan. */
export interface MealDayVM {
  day: number;
  meals: MealVM[];
}

export interface DossierVM {
  name: string;
  sources: number;
  updated: string;
}

export const user = {
  name: 'Ada',
  initials: 'AB',
  weekday: 'Wednesday',
};

export const summary = {
  markersTracked: 42,
  inRange: 36,
  watch: 4,
  low: 2,
  labDate: 'Jun 28',
};

const vitaminDFoods: FoodVM[] = [
  { name: 'Salmon, cooked', amount: '13.1 µg / 100g' },
  { name: 'Egg yolk', amount: '5.4 µg / 100g' },
  { name: 'Sardines, canned', amount: '4.8 µg / 100g' },
];

const magnesiumFoods: FoodVM[] = [
  { name: 'Pumpkin seeds', amount: '592 mg / 100g' },
  { name: 'Almonds', amount: '270 mg / 100g' },
  { name: 'Dark chocolate', amount: '228 mg / 100g' },
];

export const needsAttention: MarkerVM[] = [
  {
    name: 'Vitamin D',
    value: '18 ng/mL',
    markerPos: 13,
    bucket: 'low',
    category: 'Nutrients',
    nutrient: 'vitamin_d',
    statusLabel: 'Deficient',
    confidence: 1,
    confidenceDrivers: ['Unit and reference range printed on the report.'],
    notes: 'Magnesium is a cofactor for vitamin D activation; repleting magnesium supports the response.',
    foods: vitaminDFoods,
  },
  {
    name: 'Magnesium',
    value: '1.6 mg/dL',
    markerPos: 24,
    bucket: 'watch',
    category: 'Nutrients',
    nutrient: 'magnesium',
    statusLabel: 'Suboptimal',
    confidence: 0.8,
    confidenceDrivers: ['Unit printed; reference range not printed, used built-in interval.'],
    foods: magnesiumFoods,
  },
];

export const priorityMarker: MarkerVM = needsAttention[0];

export const rankedFindings: MarkerVM[] = [
  needsAttention[1],
  {
    name: 'Ferritin',
    value: '22 ng/mL',
    markerPos: 26,
    bucket: 'low',
    nutrient: 'iron',
    statusLabel: 'Deficient',
    confidence: 1,
    notes: 'Low ferritin alongside low hemoglobin is consistent with iron-deficiency anemia.',
    foods: [
      { name: 'Pumpkin seeds', amount: '8.8 mg / 100g' },
      { name: 'Beef liver', amount: '6.2 mg / 100g' },
      { name: 'Spinach, cooked', amount: '3.6 mg / 100g' },
    ],
  },
];

export const supplements: SupplementVM[] = [
  { name: 'D3 + K2', dose: '5,000 IU', timing: 'Morning' },
  { name: 'Magnesium glycinate', dose: '300 mg', timing: 'Evening' },
  { name: 'Omega-3 (EPA/DHA)', dose: '2 g', timing: 'With a meal' },
];

export const mealFocus = ['Oily fish 2x', 'Leafy greens daily', 'Fortified foods'];

export const mealNote = 'Chosen to raise vitamin D, magnesium, and omega-3 over the next month.';

export const planTags = ['D3 + K2', 'Magnesium glycinate'];

export const mealDays: MealDayVM[] = [
  { day: 1, meals: [
    { slot: 'breakfast', title: 'Egg yolk' },
    { slot: 'lunch', title: 'Spinach, cooked' },
    { slot: 'dinner', title: 'Salmon, cooked' },
  ] },
  { day: 2, meals: [
    { slot: 'breakfast', title: 'Almonds' },
    { slot: 'lunch', title: 'Pumpkin seeds' },
    { slot: 'dinner', title: 'Sardines, canned' },
  ] },
  { day: 3, meals: [
    { slot: 'breakfast', title: 'Fortified milk' },
    { slot: 'lunch', title: 'Dark chocolate' },
    { slot: 'dinner', title: 'Salmon, cooked' },
  ] },
];

export const citations = [
  'USDA FoodData Central. https://fdc.nal.usda.gov/',
  'NIH Office of Dietary Supplements, Vitamin D fact sheet (2023).',
  'NIH Office of Dietary Supplements, Magnesium fact sheet (2022).',
];

export const categories = ['Nutrients', 'Microbiome', 'Metabolic'];

// Marker detail (Vitamin D)
export const vitaminDTrend = [40, 32, 37, 29, 35, 31, 38, 45]; // relative heights %
export const vitaminDTrendMonths = ['Jul', 'Oct', 'Jan', 'Apr', 'Jun'];
export const vitaminDEffects = [
  'Mood and seasonal energy',
  'Immune response',
  'Bone and muscle strength',
];
export const vitaminDSourceCount = 42;

export const dossiers: DossierVM[] = [
  { name: 'Vitamin D', sources: 42, updated: 'Jun 2026' },
  { name: 'Magnesium', sources: 67, updated: 'May 2026' },
  { name: 'Omega-3 index', sources: 31, updated: 'May 2026' },
  { name: 'Ferritin & iron', sources: 28, updated: 'May 2026' },
];
