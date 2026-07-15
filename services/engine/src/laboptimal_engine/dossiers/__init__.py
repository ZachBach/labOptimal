"""Curated nutrient dossiers (CC BY 4.0).

Each dossier backs the engine's recommendations with a repletion dose, intake
reference points, food sources, interactions, and citations. The recommender
reads `supplement_dose` to fill `SupplementSuggestion.suggested_dose`, and the
pipeline folds dossier citations into the protocol.

The schema is deliberately small and stable so it can be shared across
initiatives (e.g. the Mental Health x Microbiome research agent) and populated
independently of the engine code.
"""

from .library import DOSSIERS, Dossier, dossier_for

__all__ = ["DOSSIERS", "Dossier", "dossier_for"]
