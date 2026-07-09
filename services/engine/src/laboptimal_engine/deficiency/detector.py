"""Deficiency detection over normalized analyte readings.

The core comparison is vectorized with pandas/numpy: readings become a
DataFrame, status and severity are computed column-wise, and the result is
turned back into `Finding` objects. Interaction rules run afterward on the set
of findings, where cross-analyte reasoning (e.g. iron-deficiency anemia
signals) lives.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from ..data.reference_ranges import REFERENCE_RANGES
from ..models import AnalyteReading, AnalyteStatus, Finding


def _classify_row(row: pd.Series) -> tuple[str, float]:
    """Return (status, severity) for one analyte row."""
    value = row["value"]
    ref_low = row["reference_low"]
    ref_high = row["reference_high"]
    opt_low = row["optimal_low"]
    opt_high = row["optimal_high"]

    if pd.notna(ref_low) and value < ref_low:
        severity = np.clip((ref_low - value) / ref_low, 0.0, 1.0)
        return AnalyteStatus.DEFICIENT.value, float(severity)

    if pd.notna(ref_high) and value > ref_high:
        severity = np.clip((value - ref_high) / ref_high, 0.0, 1.0)
        return AnalyteStatus.HIGH.value, float(severity)

    # Inside the reference range: grade against the optimal band if defined.
    if pd.notna(opt_low) and value < opt_low:
        span = opt_low - (ref_low if pd.notna(ref_low) else opt_low * 0.5)
        severity = np.clip((opt_low - value) / span, 0.0, 1.0) if span > 0 else 0.3
        return AnalyteStatus.SUBOPTIMAL.value, float(severity)

    if pd.notna(opt_high) and value > opt_high:
        span = (ref_high if pd.notna(ref_high) else opt_high * 1.5) - opt_high
        severity = np.clip((value - opt_high) / span, 0.0, 1.0) if span > 0 else 0.3
        return AnalyteStatus.ELEVATED.value, float(severity)

    return AnalyteStatus.OPTIMAL.value, 0.0


class DeficiencyDetector:
    def detect(
        self,
        readings: list[AnalyteReading],
        confidences: dict[str, float] | None = None,
    ) -> list[Finding]:
        if not readings:
            return []

        confidences = confidences or {}
        frame = pd.DataFrame([r.model_dump() for r in readings])

        classified = frame.apply(_classify_row, axis=1, result_type="expand")
        frame["status"] = classified[0]
        frame["severity"] = classified[1].round(3)

        findings: list[Finding] = []
        for _, row in frame.iterrows():
            canonical = row["canonical"]
            rng = REFERENCE_RANGES.get(canonical)
            nutrients = list(rng.nutrients) if rng else []
            status = AnalyteStatus(row["status"])

            findings.append(
                Finding(
                    analyte=canonical,
                    display_name=row["display_name"],
                    value=row["value"],
                    unit=row["unit"],
                    status=status,
                    severity=float(row["severity"]),
                    confidence=round(float(confidences.get(canonical, 0.6)), 2),
                    target_nutrients=nutrients if status in _ACTIONABLE else [],
                )
            )

        return _rank_findings(_apply_interaction_rules(findings))


_ACTIONABLE = {AnalyteStatus.DEFICIENT, AnalyteStatus.SUBOPTIMAL}

# Ordering priority: outside-reference first, then outside-optimal, then optimal.
_STATUS_PRIORITY = {
    AnalyteStatus.DEFICIENT: 0,
    AnalyteStatus.HIGH: 0,
    AnalyteStatus.SUBOPTIMAL: 1,
    AnalyteStatus.ELEVATED: 1,
    AnalyteStatus.OPTIMAL: 2,
}


def _rank_findings(findings: list[Finding]) -> list[Finding]:
    """Rank findings most-actionable first.

    Sort by status priority, then higher severity, then higher confidence, so
    the API and app receive findings in the order a user should attend to them.
    """
    return sorted(
        findings,
        key=lambda f: (_STATUS_PRIORITY[f.status], -f.severity, -f.confidence),
    )


def _apply_interaction_rules(findings: list[Finding]) -> list[Finding]:
    """Cross-analyte adjustments and clinical caveats.

    These are intentionally explicit and few. Each rule states its reasoning in
    the finding's notes so the output stays auditable.
    """
    by_analyte = {f.analyte: f for f in findings}

    hemoglobin = by_analyte.get("hemoglobin")
    ferritin = by_analyte.get("ferritin")

    # Iron-deficiency anemia pattern: low hemoglobin with low ferritin raises
    # confidence that iron is the driver.
    if (
        hemoglobin is not None
        and ferritin is not None
        and hemoglobin.status == AnalyteStatus.DEFICIENT
        and ferritin.status in _ACTIONABLE
    ):
        ferritin.confidence = min(1.0, ferritin.confidence + 0.15)
        ferritin.notes = (
            "Low ferritin alongside low hemoglobin is consistent with "
            "iron-deficiency anemia; iron is the likely driver."
        )

    # Ferritin is an acute-phase reactant: a normal/high value can mask iron
    # deficiency during inflammation. Flag the caveat when ferritin is not low.
    if ferritin is not None and ferritin.status not in _ACTIONABLE:
        ferritin.notes = (
            "Ferritin is an acute-phase reactant and can read normal-to-high "
            "during inflammation; interpret alongside CRP if available."
        )

    # Magnesium is a cofactor for vitamin D activation.
    vitd = by_analyte.get("vitamin_d_25oh")
    magnesium = by_analyte.get("magnesium")
    if (
        vitd is not None
        and magnesium is not None
        and vitd.status in _ACTIONABLE
        and magnesium.status in _ACTIONABLE
    ):
        vitd.notes = (
            "Magnesium is a cofactor for vitamin D activation; repleting "
            "magnesium supports the response to vitamin D supplementation."
        )

    return findings
