"""Smoke and unit tests for the LabOptimal engine."""

from __future__ import annotations

from laboptimal_engine.deficiency.detector import DeficiencyDetector
from laboptimal_engine.models import AnalyteStatus, Protocol
from laboptimal_engine.normalize.normalizer import Normalizer
from laboptimal_engine.parsing.lab_parser import LabParser
from laboptimal_engine.pipeline import DEMO_REPORT, analyze_text


def test_parser_extracts_all_demo_analytes():
    readings = LabParser().parse(DEMO_REPORT)
    canonicals = {r.canonical for r in readings}
    assert canonicals == {
        "vitamin_d_25oh",
        "ferritin",
        "vitamin_b12",
        "folate_serum",
        "magnesium",
        "hemoglobin",
    }


def test_parser_reads_value_and_range():
    readings = {r.canonical: r for r in LabParser().parse(DEMO_REPORT)}
    vitd = readings["vitamin_d_25oh"]
    assert vitd.value == 22.0
    assert vitd.unit == "ng/mL"
    assert vitd.printed_low == 30.0
    assert vitd.printed_high == 100.0
    # unit + printed range present -> full confidence
    assert vitd.confidence == 1.0


def test_normalizer_converts_vitamin_d_units():
    from laboptimal_engine.parsing.lab_parser import RawReading

    raw = RawReading(
        canonical="vitamin_d_25oh",
        value=75.0,          # nmol/L
        unit="nmol/L",
        printed_low=None,
        printed_high=None,
        source_text="Vitamin D 75 nmol/L",
        confidence=0.8,
    )
    normalized = Normalizer().normalize(raw)
    assert normalized is not None
    assert normalized.unit == "ng/mL"
    # 75 / 2.496 ~= 30.05
    assert abs(normalized.value - 30.05) < 0.1


def test_detector_flags_low_vitamin_d_as_deficient():
    readings = [
        Normalizer().normalize(r) for r in LabParser().parse(DEMO_REPORT)
    ]
    readings = [r for r in readings if r is not None]
    findings = {f.analyte: f for f in DeficiencyDetector().detect(readings)}

    assert findings["vitamin_d_25oh"].status == AnalyteStatus.DEFICIENT
    assert findings["vitamin_d_25oh"].severity > 0
    assert "vitamin_d" in findings["vitamin_d_25oh"].target_nutrients


def test_iron_deficiency_interaction_rule_raises_ferritin_confidence():
    findings = {
        f.analyte: f
        for f in analyze_text(DEMO_REPORT).findings
    }
    ferritin = findings["ferritin"]
    assert ferritin.status == AnalyteStatus.DEFICIENT
    assert ferritin.notes is not None
    assert "iron-deficiency" in ferritin.notes


def test_full_pipeline_returns_protocol_with_recommendations():
    protocol = analyze_text(DEMO_REPORT)
    assert isinstance(protocol, Protocol)
    assert len(protocol.deficiencies()) >= 1
    assert len(protocol.food_suggestions) >= 1
    assert len(protocol.supplement_suggestions) >= 1
    # Contract stays serializable
    assert protocol.model_dump_json()


def test_suboptimal_when_inside_reference_but_below_optimal():
    # B12 310 is within 200-900 reference but below the 500 optimal floor.
    findings = {f.analyte: f for f in analyze_text(DEMO_REPORT).findings}
    assert findings["vitamin_b12"].status == AnalyteStatus.SUBOPTIMAL
