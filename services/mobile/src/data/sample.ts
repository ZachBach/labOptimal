/**
 * Sample view-model data mirroring the design board's LabOptimal screens. This
 * stands in for API responses until the Copilot lane wires real data. The
 * `markerPos` field is a 0..100 percentage for where the dot sits on the range
 * bar (deficient .. optimal .. high), which the engine's severity will drive
 * for real.
 */

import type { StatusBucket } from '@/types/protocol';

export interface MarkerVM {
  name: string;
  value: string; // formatted, e.g. "18 ng/mL"
  markerPos: number; // 0..100 along the range bar
  bucket: StatusBucket;
  category?: string; // e.g. "Nutrients" — drives the home filter
}

export interface SupplementVM {
  name: string;
  dose: string;
  timing: string;
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

export const needsAttention: MarkerVM[] = [
  { name: 'Vitamin D', value: '18 ng/mL', markerPos: 13, bucket: 'low', category: 'Nutrients' },
  { name: 'Magnesium', value: '1.6 mg/dL', markerPos: 24, bucket: 'watch', category: 'Nutrients' },
];

export const priorityMarker: MarkerVM = {
  name: 'Vitamin D',
  value: '18 ng/mL',
  markerPos: 12,
  bucket: 'low',
};

export const rankedFindings: MarkerVM[] = [
  { name: 'Magnesium', value: '1.6 mg/dL', markerPos: 22, bucket: 'low' },
  { name: 'Ferritin', value: '22 ng/mL', markerPos: 26, bucket: 'low' },
  { name: 'Omega-3 index', value: '4.1%', markerPos: 30, bucket: 'watch' },
];

export const supplements: SupplementVM[] = [
  { name: 'D3 + K2', dose: '5,000 IU', timing: 'Morning' },
  { name: 'Magnesium glycinate', dose: '300 mg', timing: 'Evening' },
  { name: 'Omega-3 (EPA/DHA)', dose: '2 g', timing: 'With a meal' },
];

export const mealFocus = ['Oily fish 2x', 'Leafy greens daily', 'Fortified foods'];

export const mealNote = 'Chosen to raise vitamin D, magnesium, and omega-3 over the next month.';

export const planTags = ['D3 + K2', 'Magnesium glycinate'];

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
