/**
 * TypeScript mirror of the engine's Protocol contract
 * (services/engine/src/laboptimal_engine/models.py and docs/api-contract.md).
 *
 * The mobile app consumes exactly this shape from the API. Keep field names in
 * sync with the contract doc; the UI keys off them directly.
 */

export type AnalyteStatus =
  | 'deficient'
  | 'suboptimal'
  | 'optimal'
  | 'elevated'
  | 'high';

export interface Finding {
  analyte: string;
  display_name: string;
  value: number;
  unit: string;
  status: AnalyteStatus;
  severity: number;
  confidence: number;
  confidence_drivers?: string[];
  target_nutrients: string[];
  notes?: string | null;
}

export interface FoodSuggestion {
  nutrient: string;
  food_name: string;
  fdc_id?: number | null;
  amount_per_100g?: number | null;
  amount_unit?: string | null;
}

export interface SupplementSuggestion {
  nutrient: string;
  form: string;
  suggested_dose?: string | null;
  notes?: string | null;
}

export interface MealIdea {
  slot: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  foods: string[];
  target_nutrients: string[];
}

export interface MealPlanDay {
  day: number;
  meals: MealIdea[];
}

export interface MealPlan {
  focus: string[];
  days: MealPlanDay[];
  notes?: string | null;
}

export interface Protocol {
  generated_at: string;
  engine_version: string;
  findings: Finding[];
  food_suggestions: FoodSuggestion[];
  supplement_suggestions: SupplementSuggestion[];
  meal_plan?: MealPlan | null;
  citations: string[];
  warnings: string[];
}

/**
 * The three-way status the UI paints: in range (green), watch (amber), low
 * (rust). Collapses the engine's five-way status the way the design board does.
 */
export type StatusBucket = 'in_range' | 'watch' | 'low';

export function bucketForStatus(status: AnalyteStatus): StatusBucket {
  switch (status) {
    case 'optimal':
      return 'in_range';
    case 'suboptimal':
    case 'elevated':
      return 'watch';
    case 'deficient':
    case 'high':
      return 'low';
  }
}

/** Human label for a status bucket, matching the board's pills. */
export function bucketLabel(bucket: StatusBucket): string {
  return bucket === 'in_range' ? 'In range' : bucket === 'watch' ? 'Watch' : 'Low';
}
