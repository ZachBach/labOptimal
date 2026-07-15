"""Turn actionable findings into food and supplement suggestions.

For each target nutrient across the deficient/suboptimal findings, the
recommender pulls food sources (USDA FoodData Central, with offline fallback)
and attaches a conventional supplement form. Supplement guidance here is
orientation only and is meant to be reviewed against the curated dossiers.
"""

from __future__ import annotations

from ..dossiers import dossier_for
from ..models import Finding, FoodSuggestion, SupplementSuggestion
from .usda_client import USDAClient

# Conventional supplement forms per nutrient. Doses are placeholders pending
# the dossier library and are intentionally left as ranges/notes, not fixed.
_SUPPLEMENT_FORMS: dict[str, dict[str, str]] = {
    "vitamin_d": {"form": "Vitamin D3 (cholecalciferol)", "notes": "Take with a fat-containing meal."},
    "iron": {"form": "Ferrous bisglycinate", "notes": "Better tolerated than sulfate; pair with vitamin C."},
    "vitamin_b12": {"form": "Methylcobalamin", "notes": "Sublingual absorbs well if intrinsic factor is limiting."},
    "folate": {"form": "L-methylfolate", "notes": "Preferred over folic acid for MTHFR variants."},
    "magnesium": {"form": "Magnesium glycinate", "notes": "Glycinate is gentle on the gut."},
    "calcium": {"form": "Calcium citrate", "notes": "Citrate absorbs without stomach acid; split doses above 500 mg."},
    "zinc": {"form": "Zinc picolinate", "notes": "Take away from iron and calcium; long-term use needs copper to balance."},
    "copper": {"form": "Copper bisglycinate", "notes": "Usually only needed to offset high-dose zinc."},
}


class Recommender:
    def __init__(self, usda_client: USDAClient | None = None) -> None:
        self.usda = usda_client or USDAClient()

    def recommend(
        self, findings: list[Finding]
    ) -> tuple[list[FoodSuggestion], list[SupplementSuggestion]]:
        target_nutrients: list[str] = []
        for finding in findings:
            for nutrient in finding.target_nutrients:
                if nutrient not in target_nutrients:
                    target_nutrients.append(nutrient)

        foods: list[FoodSuggestion] = []
        supplements: list[SupplementSuggestion] = []

        for nutrient in target_nutrients:
            for row in self.usda.foods_for_nutrient(nutrient):
                foods.append(
                    FoodSuggestion(
                        nutrient=nutrient,
                        food_name=row.food_name,
                        fdc_id=row.fdc_id,
                        amount_per_100g=row.amount_per_100g,
                        amount_unit=row.amount_unit,
                    )
                )

            form = _SUPPLEMENT_FORMS.get(nutrient)
            if form is not None:
                # The dossier, when present, supplies a concrete repletion dose;
                # otherwise the dose stays null and the app shows "As directed".
                dossier = dossier_for(nutrient)
                supplements.append(
                    SupplementSuggestion(
                        nutrient=nutrient,
                        form=form["form"],
                        suggested_dose=dossier.supplement_dose if dossier else None,
                        notes=form.get("notes"),
                    )
                )

        return foods, supplements
