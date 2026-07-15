/**
 * Maps the engine's `Protocol` (docs/api-contract.md) onto the app's view models.
 *
 * The engine gives a status and severity per finding but not the raw reference
 * bounds, so the range-bar position is derived from status + severity here. This
 * is the one place that translates the analytical contract into UI shapes.
 */

import type { MarkerVM, SupplementVM } from '@/data/sample';
import type { Results } from '@/state/ScanContext';
import { bucketForStatus, type AnalyteStatus, type Finding, type Protocol } from '@/types/protocol';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function today(): string {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function formatValue(v: number): string {
  return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
}

/** 0..100 dot position along the deficient / optimal / high bar. */
function markerPos(status: AnalyteStatus, severity: number): number {
  const s = Math.max(0, Math.min(1, severity));
  switch (status) {
    case 'deficient':
      return Math.round(6 + (1 - s) * 18); // 6..24, more severe = further left
    case 'suboptimal':
      return Math.round(26 + (1 - s) * 10); // 26..36
    case 'optimal':
      return 50;
    case 'elevated':
      return Math.round(64 + s * 8); // 64..72
    case 'high':
      return Math.round(76 + s * 16); // 76..92
  }
}

function toMarker(f: Finding): MarkerVM {
  return {
    name: f.display_name,
    value: `${formatValue(f.value)} ${f.unit}`,
    markerPos: markerPos(f.status, f.severity),
    bucket: bucketForStatus(f.status),
    category: 'Nutrients',
  };
}

const NEUTRAL: MarkerVM = { name: 'All clear', value: '', markerPos: 50, bucket: 'in_range' };

export function protocolToResults(p: Protocol): Results {
  const findings = p.findings;
  const inRange = findings.filter((f) => bucketForStatus(f.status) === 'in_range').length;
  const watch = findings.filter((f) => bucketForStatus(f.status) === 'watch').length;
  const low = findings.filter((f) => bucketForStatus(f.status) === 'low').length;

  // Engine already returns findings ranked most-actionable-first.
  const actionable = findings.filter((f) => bucketForStatus(f.status) !== 'in_range').map(toMarker);
  const priorityMarker = actionable[0] ?? (findings[0] ? toMarker(findings[0]) : NEUTRAL);

  const supplements: SupplementVM[] = p.supplement_suggestions.map((s) => ({
    name: s.form,
    dose: s.suggested_dose ?? 'As directed',
    timing: 'Daily',
  }));

  // Prefer the engine's assembled meal plan; fall back to raw food names for
  // older engine versions that predate meal_plan.
  const mealFocus = p.meal_plan?.focus?.length
    ? p.meal_plan.focus
    : Array.from(new Set(p.food_suggestions.map((f) => f.food_name))).slice(0, 3);
  const planTags = supplements.slice(0, 2).map((s) => s.name);

  return {
    summary: {
      markersTracked: findings.length,
      inRange,
      watch,
      low,
      labDate: today(),
    },
    needsAttention: actionable.slice(0, 4),
    priorityMarker,
    rankedFindings: actionable.slice(1),
    supplements,
    mealFocus,
    mealNote:
      p.meal_plan?.notes ?? 'Meals chosen from foods rich in your target nutrients.',
    planTags,
  };
}
