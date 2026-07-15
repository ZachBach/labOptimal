"""Dossier library tests: schema coverage and wiring into recommendations."""

from __future__ import annotations

from laboptimal_engine.dossiers import DOSSIERS, dossier_for
from laboptimal_engine.pipeline import analyze_text


def test_every_dossier_has_dose_and_citations():
    assert DOSSIERS
    for nutrient, dossier in DOSSIERS.items():
        assert dossier.nutrient == nutrient
        assert dossier.supplement_dose
        assert dossier.citations
        assert dossier.license == "CC BY 4.0"


def test_supplement_dose_comes_from_dossier():
    protocol = analyze_text(
        "Ferritin 18 ng/mL 30-400\nHemoglobin 12.9 g/dL 13.5-17.5"
    )
    iron = next(s for s in protocol.supplement_suggestions if s.nutrient == "iron")
    assert iron.suggested_dose == dossier_for("iron").supplement_dose
    assert iron.suggested_dose is not None


def test_dossier_citations_are_folded_into_protocol():
    protocol = analyze_text("Ferritin 18 ng/mL 30-400\nHemoglobin 12.9 g/dL 13.5-17.5")
    assert any("Iron fact sheet" in c for c in protocol.citations)
