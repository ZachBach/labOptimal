"""End-to-end analysis pipeline and CLI entry point.

    OCR text -> parse -> normalize -> detect -> recommend -> Protocol

`analyze` is the public API the Node service calls. Running this module as a
script with `--demo` executes the whole pipeline on a bundled sample panel and
prints the protocol JSON, which is useful for eyeballing the contract shape.
"""

from __future__ import annotations

import argparse
import json
import sys

from .data.reference_ranges import REFERENCE_RANGES
from .deficiency.detector import DeficiencyDetector
from .dossiers import dossier_for
from .mealplan.generator import MealPlanGenerator
from .models import Protocol
from .normalize.normalizer import Normalizer
from .ocr.base import OCRProvider, StaticTextProvider
from .parsing.lab_parser import LabParser
from .recommend.recommender import Recommender

DEMO_REPORT = """
COMPREHENSIVE PANEL
Vitamin D, 25-Hydroxy      22 ng/mL     30-100
Ferritin                   18 ng/mL     30-400
Vitamin B12                310 pg/mL    200-900
Folate, Serum              6.2 ng/mL    3-20
Magnesium                  1.8 mg/dL    1.7-2.2
Hemoglobin                 12.9 g/dL    13.5-17.5
""".strip()

CITATIONS = [
    "USDA FoodData Central. https://fdc.nal.usda.gov/",
]


def analyze_text(text: str) -> Protocol:
    """Run the pipeline on already-extracted OCR text."""
    parser = LabParser()
    normalizer = Normalizer()
    detector = DeficiencyDetector()
    recommender = Recommender()

    raw_readings = parser.parse(text)

    readings = []
    warnings: list[str] = []
    for raw in raw_readings:
        normalized = normalizer.normalize(raw, warnings=warnings)
        if normalized is None:
            warnings.append(f"Unrecognized analyte skipped: {raw.canonical}")
            continue
        readings.append(normalized)

    # Confidence now travels on each normalized reading (unit/range provenance);
    # the detector reads it directly rather than a separate parser dict.
    findings = detector.detect(readings)
    foods, supplements = recommender.recommend(findings)
    meal_plan = MealPlanGenerator().generate(findings, foods)

    citations = _citations_for(readings, supplements)

    return Protocol(
        findings=findings,
        food_suggestions=foods,
        supplement_suggestions=supplements,
        meal_plan=meal_plan,
        citations=citations,
        warnings=warnings,
    )


def _citations_for(readings, supplements) -> list[str]:
    """Sources for this report: reference ranges, nutrient dossiers, plus USDA.

    Provenance travels with the result: every range and dossier cited, deduped
    and sorted for a deterministic protocol.
    """
    sources: set[str] = set()
    for reading in readings:
        rng = REFERENCE_RANGES.get(reading.canonical)
        if rng is not None and rng.source:
            sources.add(rng.source)
    for supplement in supplements:
        dossier = dossier_for(supplement.nutrient)
        if dossier is not None:
            sources.update(dossier.citations)
    return CITATIONS + sorted(sources)


def analyze(image_bytes: bytes, ocr: OCRProvider | None = None) -> Protocol:
    """Run the full pipeline starting from raw image bytes.

    This is the entry point the Node API should call. Supply an OCRProvider to
    override the default (Tesseract) backend.
    """
    if ocr is None:
        from .ocr.base import TesseractProvider

        ocr = TesseractProvider()
    text = ocr.extract_text(image_bytes)
    return analyze_text(text)


def _run_demo() -> Protocol:
    ocr = StaticTextProvider(DEMO_REPORT)
    return analyze(b"", ocr=ocr)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="laboptimal-engine")
    parser.add_argument("--demo", action="store_true", help="Run on the bundled sample panel")
    parser.add_argument("--image", type=str, help="Path to a lab-report image to analyze")
    args = parser.parse_args(argv)

    if args.demo:
        protocol = _run_demo()
    elif args.image:
        with open(args.image, "rb") as handle:
            protocol = analyze(handle.read())
    else:
        parser.print_help()
        return 1

    print(protocol.model_dump_json(indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
