"""Normalize raw readings to canonical units and attach reference ranges.

Responsibilities:
  * convert known unit variants to the canonical unit for each analyte
  * attach reference and optimal bounds, preferring the ranges printed on the
    report when present, falling back to the seed table otherwise
  * drop unit ambiguity so the detector can work on clean, comparable numbers
  * score how trustworthy the reading is and record the reasons why, so the app
    can explain a low-confidence finding rather than just showing a number

Confidence starts at 1.0 and is docked for each source of doubt: a unit that
was not printed (and therefore assumed), a printed unit we did not recognize
(assumed canonical, the riskiest case), or a missing printed reference range
(fell back to the built-in interval). Every deduction adds a driver string.
"""

from __future__ import annotations

from ..data.reference_ranges import REFERENCE_RANGES
from ..models import AnalyteReading
from ..parsing.lab_parser import RawReading

# Multiplicative conversions keyed by (analyte, from_unit) -> (factor, to_unit).
# Only conversions we can do safely and unambiguously are listed.
_CONVERSIONS: dict[tuple[str, str], tuple[float, str]] = {
    # Vitamin D: 1 ng/mL = 2.496 nmol/L
    ("vitamin_d_25oh", "nmol/l"): (1.0 / 2.496, "ng/mL"),
    # Folate: 1 ng/mL = 2.265 nmol/L
    ("folate_serum", "nmol/l"): (1.0 / 2.265, "ng/mL"),
    # B12: 1 pg/mL = 0.7378 pmol/L
    ("vitamin_b12", "pmol/l"): (1.0 / 0.7378, "pg/mL"),
    # Magnesium: 1 mg/dL = 0.4114 mmol/L
    ("magnesium", "mmol/l"): (1.0 / 0.4114, "mg/dL"),
}

# Confidence deductions per source of doubt.
_PENALTY_UNIT_MISSING = 0.2
_PENALTY_UNIT_ASSUMED = 0.25
_PENALTY_RANGE_MISSING = 0.2
_MIN_CONFIDENCE = 0.1


class Normalizer:
    def normalize(
        self, raw: RawReading, warnings: list[str] | None = None
    ) -> AnalyteReading | None:
        rng = REFERENCE_RANGES.get(raw.canonical)
        if rng is None:
            return None

        value = raw.value
        unit = raw.unit

        score = 1.0
        drivers: list[str] = []

        if unit is not None and unit.lower() != rng.unit.lower():
            conversion = _CONVERSIONS.get((raw.canonical, unit.lower()))
            if conversion is not None:
                factor, target_unit = conversion
                value = value * factor
                unit = target_unit
                drivers.append(f"Converted from '{raw.unit}' to canonical '{rng.unit}'.")
            else:
                # Unknown unit with no known conversion. Assuming canonical units
                # here is a real risk (e.g. nmol/L read as ng/mL), so surface it
                # rather than converting silently.
                if warnings is not None:
                    warnings.append(
                        f"{rng.display_name}: unrecognized unit '{raw.unit}', "
                        f"assumed canonical '{rng.unit}'. Verify this reading."
                    )
                unit = rng.unit
                score -= _PENALTY_UNIT_ASSUMED
                drivers.append(
                    f"Unrecognized unit '{raw.unit}'; assumed canonical '{rng.unit}'."
                )
        elif unit is None:
            unit = rng.unit
            score -= _PENALTY_UNIT_MISSING
            drivers.append(f"Unit not printed; assumed canonical '{rng.unit}'.")
        else:
            unit = rng.unit

        printed_range = raw.printed_low is not None and raw.printed_high is not None
        reference_low = raw.printed_low if raw.printed_low is not None else rng.reference_low
        reference_high = raw.printed_high if raw.printed_high is not None else rng.reference_high
        if not printed_range:
            score -= _PENALTY_RANGE_MISSING
            drivers.append("No printed reference range; used the built-in interval.")

        if not drivers:
            drivers.append("Unit and reference range printed on the report.")

        confidence = max(_MIN_CONFIDENCE, min(1.0, score))

        return AnalyteReading(
            canonical=rng.canonical,
            display_name=rng.display_name,
            value=round(value, 3),
            unit=unit,
            reference_low=reference_low,
            reference_high=reference_high,
            optimal_low=rng.optimal_low,
            optimal_high=rng.optimal_high,
            source_text=raw.source_text,
            confidence=round(confidence, 2),
            confidence_drivers=drivers,
        )
