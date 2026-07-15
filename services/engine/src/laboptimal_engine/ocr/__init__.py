"""OCR providers (pluggable local / cloud backends)."""

from .base import (
    CloudOCRProvider,
    OCRProvider,
    StaticTextProvider,
    TesseractProvider,
)

__all__ = [
    "OCRProvider",
    "StaticTextProvider",
    "TesseractProvider",
    "CloudOCRProvider",
]
