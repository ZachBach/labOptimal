"""HTTP service exposing the engine over ``POST /analyze``.

This is the thin FastAPI wrapper the mobile app (and, later, the Node API) calls
to run a real scan. It accepts either an uploaded image (OCR'd via the configured
provider) or already-extracted ``text``, runs the real pipeline, and returns the
``Protocol`` JSON defined in ``models.py`` / ``docs/api-contract.md``.

Run it:

    pip install -e ".[service]"
    laboptimal-engine-serve            # uvicorn on 0.0.0.0:8000
    # or: uvicorn laboptimal_engine.service:app --reload
"""

from __future__ import annotations

import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .pipeline import DEMO_REPORT, analyze, analyze_text
from .ocr.base import StaticTextProvider

app = FastAPI(title="LabOptimal Engine", version="0.1.0")

# Dev-open CORS so the Expo app (web on :8081, or a device on the LAN) can call
# this directly. Tighten allow_origins before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "engine_version": "0.1.0"}


@app.post("/analyze")
async def analyze_endpoint(
    image: UploadFile | None = File(default=None),
    text: str | None = Form(default=None),
    demo: bool = Form(default=False),
) -> JSONResponse:
    """Analyze a lab report.

    Send one of:
      - ``image``: a multipart file. Runs OCR (needs the Tesseract binary) then
        the pipeline.
      - ``text``: already-extracted report text. Skips OCR.
      - ``demo=true``: analyze the bundled sample panel (handy for smoke tests
        and offline demos).
    """
    if demo:
        protocol = analyze(b"", ocr=StaticTextProvider(DEMO_REPORT))
    elif text:
        protocol = analyze_text(text)
    elif image is not None:
        data = await image.read()
        try:
            protocol = analyze(data)
        except Exception as exc:  # OCR backend missing or unreadable image
            raise HTTPException(
                status_code=422,
                detail=(
                    "Could not read the image. Ensure the Tesseract OCR binary is "
                    f"installed on the server, or post extracted text instead. ({exc})"
                ),
            ) from exc
    else:
        raise HTTPException(
            status_code=400, detail="Provide an 'image' file, 'text', or 'demo=true'."
        )

    return JSONResponse(protocol.model_dump(mode="json"))


def run() -> None:
    """Console-script entry point: start uvicorn."""
    import uvicorn

    host = os.environ.get("ENGINE_HOST", "0.0.0.0")
    port = int(os.environ.get("ENGINE_PORT", "8000"))
    uvicorn.run("laboptimal_engine.service:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    run()
