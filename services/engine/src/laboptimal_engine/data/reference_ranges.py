"""Canonical analytes, their units, and reference / optimal ranges.

Ranges here are conventional adult reference intervals for orientation and are
not medical advice. Every entry carries a `source` citing where its interval
comes from; the pipeline aggregates these into the protocol's `citations` so the
provenance travels with the result. The schema (the columns) is the contract;
values are reviewed and expanded, with sourcing tracked in
`docs/reference-ranges.md`.

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
    source:         citation for the reference interval
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
    source: str = "Conventional adult reference interval (pending citation)."


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
            source=(
                "NIH Office of Dietary Supplements, Vitamin D fact sheet (2023); "
                "Endocrine Society Clinical Practice Guideline (2011)."
            ),
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
            source="WHO, Serum ferritin concentrations for iron status (2020).",
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
            source="NIH Office of Dietary Supplements, Vitamin B12 fact sheet (2024).",
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
            source="NIH Office of Dietary Supplements, Folate fact sheet (2024).",
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
            source="NIH Office of Dietary Supplements, Magnesium fact sheet (2022).",
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
            source="WHO, Haemoglobin concentrations for the diagnosis of anaemia (2011).",
        ),
        # --- CBC context (markers; interpreted with hemoglobin) --------------
        ReferenceRange(
            canonical="hematocrit",
            display_name="Hematocrit",
            unit="%",
            reference_low=38.3,
            reference_high=48.6,
            optimal_low=40.0,
            optimal_high=48.0,
            aliases=("hematocrit", "hct"),
            nutrients=("iron", "vitamin_b12", "folate"),
            source="Mayo Clinic Laboratories, adult male hematocrit reference interval.",
        ),
        ReferenceRange(
            canonical="mcv",
            display_name="Mean Corpuscular Volume",
            unit="fL",
            reference_low=80.0,
            reference_high=100.0,
            aliases=("mcv", "mean corpuscular volume"),
            nutrients=(),
            source="Mayo Clinic Laboratories, MCV reference interval.",
        ),
        # --- Minerals with cross-nutrient interactions -----------------------
        ReferenceRange(
            canonical="calcium",
            display_name="Calcium",
            unit="mg/dL",
            reference_low=8.6,
            reference_high=10.3,
            optimal_low=9.0,
            optimal_high=10.0,
            aliases=("calcium", "serum calcium"),
            nutrients=("calcium",),
            source="Mayo Clinic Laboratories, total calcium reference interval.",
        ),
        ReferenceRange(
            canonical="zinc",
            display_name="Zinc",
            unit="µg/dL",
            reference_low=60.0,
            reference_high=120.0,
            optimal_low=80.0,
            optimal_high=120.0,
            aliases=("zinc", "serum zinc", "plasma zinc"),
            nutrients=("zinc",),
            source="NIH Office of Dietary Supplements, Zinc fact sheet (2022).",
        ),
        ReferenceRange(
            canonical="copper",
            display_name="Copper",
            unit="µg/dL",
            reference_low=70.0,
            reference_high=140.0,
            optimal_low=80.0,
            optimal_high=130.0,
            aliases=("copper", "serum copper"),
            nutrients=("copper",),
            source="NIH Office of Dietary Supplements, Copper fact sheet (2022).",
        ),
        # --- Inflammation ----------------------------------------------------
        ReferenceRange(
            canonical="crp",
            display_name="C-Reactive Protein (hs)",
            unit="mg/L",
            reference_low=0.0,
            reference_high=3.0,
            optimal_low=None,
            optimal_high=1.0,
            aliases=("crp", "c-reactive protein", "hs-crp", "high-sensitivity crp"),
            nutrients=(),
            source="AHA/CDC Scientific Statement on hs-CRP and cardiovascular risk (2003).",
        ),
        # --- Thyroid ---------------------------------------------------------
        ReferenceRange(
            canonical="tsh",
            display_name="Thyroid-Stimulating Hormone",
            unit="mIU/L",
            reference_low=0.4,
            reference_high=4.0,
            optimal_low=0.5,
            optimal_high=2.5,
            aliases=("tsh", "thyroid stimulating hormone", "thyrotropin"),
            nutrients=(),
            source="American Thyroid Association reference interval for TSH.",
        ),
        ReferenceRange(
            canonical="free_t4",
            display_name="Free T4",
            unit="ng/dL",
            reference_low=0.8,
            reference_high=1.8,
            aliases=("free t4", "ft4", "free thyroxine"),
            nutrients=(),
            source="Mayo Clinic Laboratories, free thyroxine reference interval.",
        ),
        # --- Glycemic control ------------------------------------------------
        ReferenceRange(
            canonical="hba1c",
            display_name="Hemoglobin A1c",
            unit="%",
            reference_low=4.0,
            reference_high=5.6,
            optimal_low=None,
            optimal_high=5.4,
            aliases=("hba1c", "a1c", "hemoglobin a1c", "glycated hemoglobin"),
            nutrients=(),
            source="American Diabetes Association, Standards of Care in Diabetes (2024).",
        ),
        # --- Lipid panel -----------------------------------------------------
        ReferenceRange(
            canonical="total_cholesterol",
            display_name="Total Cholesterol",
            unit="mg/dL",
            reference_low=125.0,
            reference_high=200.0,
            aliases=("total cholesterol", "cholesterol, total"),
            nutrients=(),
            source="NCEP ATP III / AHA desirable total cholesterol < 200 mg/dL.",
        ),
        ReferenceRange(
            canonical="ldl_cholesterol",
            display_name="LDL Cholesterol",
            unit="mg/dL",
            reference_low=0.0,
            reference_high=130.0,
            optimal_low=None,
            optimal_high=100.0,
            aliases=("ldl", "ldl cholesterol", "ldl-c"),
            nutrients=(),
            source="NCEP ATP III optimal LDL < 100 mg/dL.",
        ),
        ReferenceRange(
            canonical="hdl_cholesterol",
            display_name="HDL Cholesterol",
            unit="mg/dL",
            reference_low=40.0,
            reference_high=None,
            optimal_low=60.0,
            optimal_high=None,
            aliases=("hdl", "hdl cholesterol", "hdl-c"),
            nutrients=(),
            source="NCEP ATP III: HDL < 40 mg/dL is a major risk factor; ≥ 60 protective.",
        ),
        ReferenceRange(
            canonical="triglycerides",
            display_name="Triglycerides",
            unit="mg/dL",
            reference_low=0.0,
            reference_high=150.0,
            optimal_low=None,
            optimal_high=100.0,
            aliases=("triglycerides", "trig"),
            nutrients=(),
            source="NCEP ATP III normal triglycerides < 150 mg/dL.",
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
