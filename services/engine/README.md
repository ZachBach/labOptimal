# LabOptimal engine

The analytical core. Takes a lab-report image (or already-extracted text) and
returns a structured `Protocol`: findings, food suggestions, supplement
suggestions, and citations.

```
OCR text -> parse -> normalize -> detect -> recommend -> Protocol
```

## Layout

```
src/laboptimal_engine/
  models.py                 Pydantic contract (Protocol, Finding, ...)
  pipeline.py               Orchestrator + CLI (analyze / analyze_text)
  ocr/base.py               Pluggable OCR providers (Tesseract, static, cloud stub)
  parsing/lab_parser.py     OCR text -> raw readings
  normalize/normalizer.py   Canonical units + reference ranges
  deficiency/detector.py    Reference-range classification + interaction rules (numpy/pandas)
  recommend/recommender.py  Nutrients -> foods + supplements
  recommend/usda_client.py  USDA FoodData Central client (offline fallback)
  data/reference_ranges.py  Canonical analytes and ranges (source of truth)
tests/                      pytest suite
```

## Run

```bash
py -m venv .venv
source .venv/Scripts/activate       # Windows Git Bash
pip install -r requirements.txt

# Demo on the bundled sample panel
PYTHONPATH=src python -m laboptimal_engine.pipeline --demo

# On a real image (needs the tesseract binary installed)
PYTHONPATH=src python -m laboptimal_engine.pipeline --image path/to/labs.jpg

# Tests
PYTHONPATH=src pytest -q
```

## Notes

- OCR is pluggable. `TesseractProvider` is the local default and needs the
  tesseract binary on PATH; `StaticTextProvider` powers the demo and tests with
  no binary. A cloud provider (Textract/Vision) can be added behind the same
  `OCRProvider` interface without touching the rest of the pipeline.
- The `Protocol` shape is the API contract. Keep `models.py` and
  `docs/api-contract.md` in sync.
- Adding an analyte is usually one entry in `data/reference_ranges.py`. See
  `docs/reference-ranges.md`.
