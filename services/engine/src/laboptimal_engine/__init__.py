"""LabOptimal analytical engine.

Pipeline: OCR -> parse -> normalize -> detect deficiencies -> recommend.
The public entry point is `laboptimal_engine.pipeline.analyze`.
"""

from .models import (
    AnalyteReading,
    AnalyteStatus,
    Finding,
    FoodSuggestion,
    Protocol,
    SupplementSuggestion,
)

__version__ = "0.1.0"

__all__ = [
    "AnalyteReading",
    "AnalyteStatus",
    "Finding",
    "FoodSuggestion",
    "Protocol",
    "SupplementSuggestion",
    "__version__",
]
