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

        # Each reading carries its own confidence and drivers from normalization.
        # `confidences` is an optional override kept for backward compatibility.
        confidences = confidences or {}
        by_canonical = {r.canonical: r for r in readings}
        frame = pd.DataFrame(
            [r.model_dump(exclude={"confidence_drivers"}) for r in readings]
        )

        classified = frame.apply(_classify_row, axis=1, result_type="expand")
        frame["status"] = classified[0]
        frame["severity"] = classified[1].round(3)

        findings: list[Finding] = []
        for _, row in frame.iterrows():
            canonical = row["canonical"]
            rng = REFERENCE_RANGES.get(canonical)
            nutrients = list(rng.nutrients) if rng else []
            status = AnalyteStatus(row["status"])
            reading = by_canonical[canonical]
            confidence = confidences.get(canonical, reading.confidence)

            findings.append(
                Finding(
                    analyte=canonical,
                    display_name=row["display_name"],
                    value=row["value"],
                    unit=row["unit"],
                    status=status,
                    severity=float(row["severity"]),
                    confidence=round(float(confidence), 2),
                    confidence_drivers=list(reading.confidence_drivers),
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


_HIGH = {AnalyteStatus.HIGH, AnalyteStatus.ELEVATED}


def _apply_interaction_rules(findings: list[Finding]) -> list[Finding]:
    """Cross-analyte adjustments and clinical caveats.

    These are intentionally explicit and few. Each rule states its reasoning in
    the finding's notes so the output stays auditable.
    """
    by_analyte = {f.analyte: f for f in findings}

    hemoglobin = by_analyte.get("hemoglobin")
    ferritin = by_analyte.get("ferritin")
    crp = by_analyte.get("crp")

    # Iron-deficiency anemia pattern: low hemoglobin with low ferritin raises
    # confidence that iron is the driver.
    if (
        hemoglobin is not None
        and ferritin is not None
        and hemoglobin.status == AnalyteStatus.DEFICIENT
        and ferritin.status in _ACTIONABLE
    ):
        ferritin.confidence = min(1.0, ferritin.confidence + 0.15)
        ferritin.confidence_drivers.append(
            "Corroborated by low hemoglobin (iron-deficiency pattern)."
        )
        ferritin.notes = (
            "Low ferritin alongside low hemoglobin is consistent with "
            "iron-deficiency anemia; iron is the likely driver."
        )

    # Ferritin is an acute-phase reactant, interpreted with CRP when present.
    if ferritin is not None:
        crp_elevated = crp is not None and crp.status in _HIGH
        if ferritin.status not in _ACTIONABLE:
            # Normal/high ferritin: inflammation can inflate it and mask iron
            # deficiency.
            if crp_elevated:
                ferritin.notes = (
                    "Ferritin is normal-to-high but CRP is elevated: "
                    "inflammation can inflate ferritin and mask true iron "
                    "deficiency. Consider iron studies (transferrin saturation)."
                )
            else:
                ferritin.notes = (
                    "Ferritin is an acute-phase reactant and can read "
                    "normal-to-high during inflammation; interpret alongside "
                    "CRP if available."
                )
        elif crp_elevated:
            # Low ferritin *despite* active inflammation is strong evidence for
            # iron deficiency, since inflammation pushes ferritin up.
            ferritin.confidence = min(1.0, ferritin.confidence + 0.1)
            ferritin.confidence_drivers.append(
                "Low despite elevated CRP, which normally raises ferritin."
            )
            ferritin.notes = (
                "Ferritin is low even with CRP elevated; because inflammation "
                "raises ferritin, a low value here strongly supports iron "
                "deficiency."
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

    # Vitamin D drives intestinal calcium absorption: low calcium with low
    # vitamin D is often a downstream effect worth correcting at the source.
    calcium = by_analyte.get("calcium")
    if (
        calcium is not None
        and vitd is not None
        and calcium.status in _ACTIONABLE
        and vitd.status in _ACTIONABLE
    ):
        calcium.notes = (
            "Vitamin D is required for intestinal calcium absorption; low "
            "vitamin D can drive low calcium, so correct vitamin D alongside "
            "calcium."
        )

    # Zinc and copper compete for absorption. Sustained high zinc depletes
    # copper; flag the pairing so supplementation does not create a new gap.
    zinc = by_analyte.get("zinc")
    copper = by_analyte.get("copper")
    if zinc is not None and copper is not None:
        if zinc.status in _HIGH and copper.status in _ACTIONABLE:
            copper.notes = (
                "Copper is low while zinc is high: excess zinc competes with "
                "copper absorption and can cause copper deficiency. Balance "
                "zinc intake and repletion copper."
            )
        elif zinc.status in _ACTIONABLE:
            zinc.notes = (
                "When supplementing zinc, monitor copper: sustained high zinc "
                "intake lowers copper. Keep a zinc-to-copper balance."
            )

    # B12 deficiency masked by folate: folic acid can correct megaloblastic
    # anemia while B12-driven neurologic damage progresses. Macrocytosis (high
    # MCV) with either low supports megaloblastic anemia.
    b12 = by_analyte.get("vitamin_b12")
    folate = by_analyte.get("folate_serum")
    mcv = by_analyte.get("mcv")
    if b12 is not None and folate is not None:
        if b12.status in _ACTIONABLE and folate.status in _ACTIONABLE:
            b12.notes = (
                "B12 and folate are both low: correcting folate alone can mask "
                "B12 deficiency while neurologic damage progresses. Replete B12 "
                "before or alongside folate."
            )
    if mcv is not None and mcv.status in _HIGH:
        target = b12 if (b12 and b12.status in _ACTIONABLE) else folate
        if target is not None and target.status in _ACTIONABLE:
            target.confidence = min(1.0, target.confidence + 0.1)
            target.confidence_drivers.append(
                "Corroborated by elevated MCV (macrocytosis)."
            )
            note = (
                "Elevated MCV (macrocytosis) alongside this low value is "
                "consistent with megaloblastic anemia from B12/folate deficiency."
            )
            target.notes = f"{target.notes} {note}" if target.notes else note

    return findings
