"""Tests for the Phase 1 depth work: USDA amounts + density ranking, the
confidence model, and the added interaction rules."""

from __future__ import annotations

from laboptimal_engine.deficiency.detector import DeficiencyDetector
from laboptimal_engine.models import AnalyteReading, AnalyteStatus
from laboptimal_engine.normalize.normalizer import Normalizer
from laboptimal_engine.parsing.lab_parser import RawReading
from laboptimal_engine.recommend.usda_client import USDAClient


# --- USDA amounts + density ranking (offline fallback) ---------------------

def test_fallback_foods_have_amounts_and_rank_by_density():
    rows = USDAClient(api_key=None).foods_for_nutrient("iron", limit=4)
    assert all(r.amount_per_100g is not None for r in rows)
    assert all(r.amount_unit == "mg" for r in rows)
    amounts = [r.amount_per_100g for r in rows]
    assert amounts == sorted(amounts, reverse=True)  # densest first
    assert rows[0].food_name == "Pumpkin seeds"


def test_new_nutrients_have_fallback_foods():
    for nutrient, unit in (("zinc", "mg"), ("copper", "mg"), ("calcium", None)):
        rows = USDAClient(api_key=None).foods_for_nutrient(nutrient)
        if nutrient == "calcium":
            # calcium has no curated food table yet; should simply be empty.
            assert rows == []
        else:
            assert rows and rows[0].amount_unit == unit


# --- Confidence model ------------------------------------------------------

def _reading(canonical: str, value: float, unit: str | None, low, high) -> AnalyteReading:
    raw = RawReading(
        canonical=canonical,
        value=value,
        unit=unit,
        printed_low=low,
        printed_high=high,
        source_text="x",
        confidence=1.0,
    )
    r = Normalizer().normalize(raw)
    assert r is not None
    return r


def test_confidence_full_when_unit_and_range_printed():
    r = _reading("ferritin", 18.0, "ng/mL", 30.0, 400.0)
    assert r.confidence == 1.0
    assert r.confidence_drivers == ["Unit and reference range printed on the report."]


def test_confidence_docked_for_missing_unit_and_range():
    r = _reading("ferritin", 18.0, None, None, None)
    # -0.2 (no unit) -0.2 (no range) => 0.6
    assert r.confidence == 0.6
    assert any("Unit not printed" in d for d in r.confidence_drivers)
    assert any("No printed reference range" in d for d in r.confidence_drivers)


def test_confidence_docked_hardest_for_assumed_unit():
    r = _reading("ferritin", 18.0, "widgets/dL", 30.0, 400.0)
    # -0.25 for an unrecognized, assumed unit
    assert r.confidence == 0.75
    assert any("Unrecognized unit" in d for d in r.confidence_drivers)


# --- Interaction rules -----------------------------------------------------

def _detect(*readings: AnalyteReading):
    return {f.analyte: f for f in DeficiencyDetector().detect(list(readings))}


def test_calcium_vitamin_d_rule():
    findings = _detect(
        _reading("calcium", 8.4, "mg/dL", 8.6, 10.3),
        _reading("vitamin_d_25oh", 22.0, "ng/mL", 30.0, 100.0),
    )
    assert "Vitamin D is required" in (findings["calcium"].notes or "")


def test_zinc_copper_rule_flags_copper_when_zinc_high():
    findings = _detect(
        _reading("zinc", 150.0, "µg/dL", 60.0, 120.0),   # high
        _reading("copper", 55.0, "µg/dL", 70.0, 140.0),  # deficient
    )
    assert findings["zinc"].status == AnalyteStatus.HIGH
    assert "zinc competes with copper" in (findings["copper"].notes or "")


def test_b12_folate_masking_rule():
    findings = _detect(
        _reading("vitamin_b12", 180.0, "pg/mL", 200.0, 900.0),  # deficient
        _reading("folate_serum", 2.0, "ng/mL", 3.0, 20.0),      # deficient
    )
    assert "mask B12 deficiency" in (findings["vitamin_b12"].notes or "")


def test_ferritin_crp_masking_when_ferritin_not_low():
    findings = _detect(
        _reading("ferritin", 120.0, "ng/mL", 30.0, 400.0),  # optimal
        _reading("crp", 8.0, "mg/L", 0.0, 3.0),             # elevated/high
    )
    assert "mask true iron deficiency" in (findings["ferritin"].notes or "")


def test_mcv_macrocytosis_raises_b12_confidence():
    findings = _detect(
        _reading("vitamin_b12", 180.0, "pg/mL", 200.0, 900.0),  # deficient, conf 1.0
        _reading("mcv", 108.0, "fL", 80.0, 100.0),              # high
    )
    b12 = findings["vitamin_b12"]
    assert any("macrocytosis" in d.lower() for d in b12.confidence_drivers)
