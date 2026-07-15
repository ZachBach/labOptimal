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
pip install -e ".[dev]"             # editable install; also exposes the `laboptimal-engine` script

# Demo on the bundled sample panel
python -m laboptimal_engine.pipeline --demo

# On a real image (needs the tesseract binary installed)
python -m laboptimal_engine.pipeline --image path/to/labs.jpg

# Tests
pytest -q
```

`requirements.txt` is kept for pinned installs; `pip install -e ".[dev]"` is the
developer path and is what makes the module and console script importable.

## HTTP service

`service.py` exposes the engine over HTTP so the mobile app (and later the Node
API) can run a real scan. `POST /analyze` accepts a multipart `image` (OCR'd via
the configured provider), an already-extracted `text`, or `demo=true` for the
bundled sample panel, and returns the `Protocol` JSON.

```bash
pip install -e ".[service]"
laboptimal-engine-serve             # uvicorn on 0.0.0.0:8000 (ENGINE_PORT to override)

# Smoke test (no OCR binary needed)
curl -F demo=true http://localhost:8000/analyze
curl -F "text=Vitamin D 22 ng/mL 30-100" http://localhost:8000/analyze
```

CORS is dev-open so the Expo app can call it directly. The mobile client points
at it via `EXPO_PUBLIC_API_URL` (see `services/mobile/src/api/config.ts`).

## Notes

- OCR is pluggable. `TesseractProvider` is the local default and needs the
  tesseract binary on PATH; `StaticTextProvider` powers the demo and tests with
  no binary. A cloud provider (Textract/Vision) can be added behind the same
  `OCRProvider` interface without touching the rest of the pipeline.
- The `Protocol` shape is the API contract. Keep `models.py` and
  `docs/api-contract.md` in sync.
- Adding an analyte is usually one entry in `data/reference_ranges.py`. See
  `docs/reference-ranges.md`.
