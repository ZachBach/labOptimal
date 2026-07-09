"""OCR provider interface.

OCR is pluggable so the local default (Tesseract) can be swapped for a cloud
provider (AWS Textract, Google Vision) without touching the rest of the
pipeline. Providers take image bytes and return raw text.
"""

from __future__ import annotations

from abc import ABC, abstractmethod


class OCRProvider(ABC):
    """Base class for OCR backends."""

    name: str = "base"

    @abstractmethod
    def extract_text(self, image_bytes: bytes) -> str:
        """Return the raw text content of a lab-report image."""
        raise NotImplementedError


class TesseractProvider(OCRProvider):
    """Local OCR via Tesseract (requires the tesseract binary on PATH).

    Import of pytesseract/PIL is deferred so the rest of the engine and its
    tests run even when the tesseract binary is not installed.
    """

    name = "tesseract"

    def extract_text(self, image_bytes: bytes) -> str:
        import io
        import os

        import pytesseract
        from PIL import Image

        # Allow pointing at a non-PATH tesseract binary via env (see .env.example).
        tesseract_cmd = os.getenv("TESSERACT_CMD")
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

        image = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(image)


class CloudOCRProvider(OCRProvider):
    """Plug point for a cloud OCR backend (AWS Textract, Google Vision).

    Cloud OCR is markedly more accurate on structured documents than local
    Tesseract. This is an explicit, typed stub so the integration point is
    visible; implement `extract_text` against the chosen provider's SDK.
    """

    name = "cloud"

    def __init__(self, provider: str = "textract") -> None:
        self.provider = provider

    def extract_text(self, image_bytes: bytes) -> str:  # noqa: ARG002 - stub
        raise NotImplementedError(
            f"Cloud OCR provider '{self.provider}' is not implemented yet. "
            "Add the provider SDK call here; the rest of the pipeline is "
            "unchanged because it depends only on OCRProvider.extract_text."
        )


class StaticTextProvider(OCRProvider):
    """Test/demo provider that returns pre-extracted text verbatim.

    Lets the pipeline run end to end without an image or the tesseract binary.
    """

    name = "static"

    def __init__(self, text: str) -> None:
        self._text = text

    def extract_text(self, image_bytes: bytes) -> str:  # noqa: ARG002 - text is fixed
        return self._text
