"""USDA FoodData Central client with an offline fallback.

When an API key is configured (FDC_API_KEY), the client queries FoodData
Central for foods rich in a nutrient. Without a key or network, it falls back
to a small curated table so the pipeline still runs end to end in development
and tests. The fallback is clearly marked in results via `fdc_id is None`.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

import requests

FDC_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

# Nutrient -> FoodData Central nutrient search term.
_NUTRIENT_QUERY = {
    "vitamin_d": "vitamin D",
    "iron": "iron",
    "vitamin_b12": "vitamin B-12",
    "folate": "folate",
    "magnesium": "magnesium",
}

# Offline fallback: a few well-known food sources per nutrient.
_FALLBACK_FOODS: dict[str, list[str]] = {
    "vitamin_d": ["Salmon, cooked", "Sardines, canned", "Egg yolk", "Fortified milk"],
    "iron": ["Beef liver", "Lentils, cooked", "Spinach, cooked", "Pumpkin seeds"],
    "vitamin_b12": ["Clams, cooked", "Beef liver", "Sardines", "Nutritional yeast (fortified)"],
    "folate": ["Lentils, cooked", "Chickpeas", "Asparagus", "Spinach, raw"],
    "magnesium": ["Pumpkin seeds", "Almonds", "Black beans", "Dark chocolate"],
}


@dataclass
class FoodRow:
    nutrient: str
    food_name: str
    fdc_id: int | None
    amount_per_100g: float | None
    amount_unit: str | None


class USDAClient:
    def __init__(self, api_key: str | None = None, timeout: float = 8.0) -> None:
        self.api_key = api_key or os.getenv("FDC_API_KEY")
        self.timeout = timeout

    def foods_for_nutrient(self, nutrient: str, limit: int = 4) -> list[FoodRow]:
        if self.api_key:
            try:
                return self._query_api(nutrient, limit)
            except (requests.RequestException, ValueError):
                pass  # fall through to offline table
        return self._fallback(nutrient, limit)

    def _query_api(self, nutrient: str, limit: int) -> list[FoodRow]:
        term = _NUTRIENT_QUERY.get(nutrient, nutrient.replace("_", " "))
        resp = requests.get(
            FDC_SEARCH_URL,
            params={
                "api_key": self.api_key,
                "query": term,
                "pageSize": limit,
                "dataType": "Foundation,SR Legacy",
            },
            timeout=self.timeout,
        )
        resp.raise_for_status()
        payload = resp.json()
        rows: list[FoodRow] = []
        for food in payload.get("foods", [])[:limit]:
            rows.append(
                FoodRow(
                    nutrient=nutrient,
                    food_name=food.get("description", "Unknown"),
                    fdc_id=food.get("fdcId"),
                    amount_per_100g=None,
                    amount_unit=None,
                )
            )
        return rows

    def _fallback(self, nutrient: str, limit: int) -> list[FoodRow]:
        names = _FALLBACK_FOODS.get(nutrient, [])[:limit]
        return [
            FoodRow(
                nutrient=nutrient,
                food_name=name,
                fdc_id=None,
                amount_per_100g=None,
                amount_unit=None,
            )
            for name in names
        ]
