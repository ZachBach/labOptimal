"""Canonical analytes, their units, and reference / optimal ranges.

This is a seed table for the scaffold. Ranges here are conventional adult
reference intervals for orientation and are not medical advice. The schema
(the columns) is the contract; the values will be reviewed and expanded, with
sourcing tracked in `docs/reference-ranges.md`.

Each entry:
    canonical:      stable key used across the whole system
    display_name:   human-readable label
    unit:           canonical unit the normalizer converts everything to
    reference_low:  lower bound of the standard reference interval
    reference_high: upper bound of the standard reference interval
    optimal_low:    lower bound of the functional / optimal band (optional)
    optimal_high:   upper bound of the functional / optimal band (optional)
    aliases:        strings the parser may see for this analyte
    nutrients:      target nutrients a shortfall maps to
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ReferenceRange:
    canonical: str
    display_name: str
    unit: str
    reference_low: float | None
    reference_high: float | None
    optimal_low: float | None = None
    optimal_high: float | None = None
    aliases: tuple[str, ...] = ()
    nutrients: tuple[str, ...] = ()


REFERENCE_RANGES: dict[str, ReferenceRange] = {
    r.canonical: r
    for r in [
        ReferenceRange(
            canonical="vitamin_d_25oh",
            display_name="Vitamin D, 25-Hydroxy",
            unit="ng/mL",
            reference_low=30.0,
            reference_high=100.0,
            optimal_low=50.0,
            optimal_high=80.0,
            aliases=("vitamin d", "25-oh vitamin d", "25(oh)d", "vit d, 25-hydroxy"),
            nutrients=("vitamin_d",),
        ),
        ReferenceRange(
            canonical="ferritin",
            display_name="Ferritin",
            unit="ng/mL",
            reference_low=30.0,
            reference_high=400.0,
            optimal_low=50.0,
            optimal_high=150.0,
            aliases=("ferritin", "serum ferritin"),
            nutrients=("iron",),
        ),
        ReferenceRange(
            canonical="vitamin_b12",
            display_name="Vitamin B12",
            unit="pg/mL",
            reference_low=200.0,
            reference_high=900.0,
            optimal_low=500.0,
            optimal_high=900.0,
            aliases=("b12", "vitamin b12", "cobalamin"),
            nutrients=("vitamin_b12",),
        ),
        ReferenceRange(
            canonical="folate_serum",
            display_name="Folate, Serum",
            unit="ng/mL",
            reference_low=3.0,
            reference_high=20.0,
            optimal_low=10.0,
            optimal_high=20.0,
            aliases=("folate", "serum folate", "folic acid"),
            nutrients=("folate",),
        ),
        ReferenceRange(
            canonical="magnesium",
            display_name="Magnesium",
            unit="mg/dL",
            reference_low=1.7,
            reference_high=2.2,
            optimal_low=1.9,
            optimal_high=2.2,
            aliases=("magnesium", "mg", "serum magnesium"),
            nutrients=("magnesium",),
        ),
        ReferenceRange(
            canonical="hemoglobin",
            display_name="Hemoglobin",
            unit="g/dL",
            reference_low=13.5,
            reference_high=17.5,
            optimal_low=14.0,
            optimal_high=16.0,
            aliases=("hemoglobin", "hgb", "hb"),
            nutrients=("iron", "vitamin_b12", "folate"),
        ),
    ]
}


def build_alias_index() -> dict[str, str]:
    """Map every alias (lowercased) to its canonical analyte key."""
    index: dict[str, str] = {}
    for rng in REFERENCE_RANGES.values():
        index[rng.canonical.lower()] = rng.canonical
        index[rng.display_name.lower()] = rng.canonical
        for alias in rng.aliases:
            index[alias.lower()] = rng.canonical
    return index
