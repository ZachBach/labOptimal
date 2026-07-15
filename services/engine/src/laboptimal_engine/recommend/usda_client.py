"""USDA FoodData Central client with an offline fallback.

When an API key is configured (FDC_API_KEY), the client queries FoodData
Central for foods rich in a nutrient and reads the per-food nutrient amount out
of the search response, so foods can be ranked by nutrient density rather than
by search relevance alone. Without a key or network, it falls back to a small
curated table (with representative per-100 g amounts) so the pipeline still runs
end to end in development and tests. The fallback is clearly marked in results
via `fdc_id is None`.
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
    "zinc": "zinc",
    "copper": "copper",
}

# Nutrient -> FoodData Central nutrient number (stable string id used in the
# `foodNutrients` array of a search result). Lets us read the per-food amount of
# the *target* nutrient specifically, not whatever nutrient the search matched.
_FDC_NUTRIENT_NUMBER = {
    "vitamin_d": "328",   # Vitamin D (D2 + D3), µg
    "iron": "303",        # Iron, Fe, mg
    "vitamin_b12": "418",  # Vitamin B-12, µg
    "folate": "417",      # Folate, total, µg
    "magnesium": "304",   # Magnesium, Mg, mg
    "zinc": "309",        # Zinc, Zn, mg
    "copper": "312",      # Copper, Cu, mg
}

# Canonical unit we report each nutrient's amount in (matches the FDC unit for
# that nutrient number). Used for the offline fallback and to label API values.
_NUTRIENT_UNIT = {
    "vitamin_d": "µg",
    "iron": "mg",
    "vitamin_b12": "µg",
    "folate": "µg",
    "magnesium": "mg",
    "zinc": "mg",
    "copper": "mg",
}

# Offline fallback: well-known food sources per nutrient with representative
# per-100 g amounts (orientation values, not lab-exact). Ranked by density at
# query time so behavior matches the API path.
_FALLBACK_FOODS: dict[str, list[tuple[str, float]]] = {
    "vitamin_d": [
        ("Salmon, cooked", 13.1),
        ("Sardines, canned", 4.8),
        ("Egg yolk", 5.4),
        ("Fortified milk", 1.3),
    ],
    "iron": [
        ("Beef liver", 6.2),
        ("Lentils, cooked", 3.3),
        ("Spinach, cooked", 3.6),
        ("Pumpkin seeds", 8.8),
    ],
    "vitamin_b12": [
        ("Clams, cooked", 98.9),
        ("Beef liver", 70.6),
        ("Sardines", 8.9),
        ("Nutritional yeast (fortified)", 115.0),
    ],
    "folate": [
        ("Lentils, cooked", 181.0),
        ("Chickpeas", 172.0),
        ("Asparagus", 149.0),
        ("Spinach, raw", 194.0),
    ],
    "magnesium": [
        ("Pumpkin seeds", 592.0),
        ("Almonds", 270.0),
        ("Black beans", 70.0),
        ("Dark chocolate", 228.0),
    ],
    "zinc": [
        ("Oysters, cooked", 78.6),
        ("Beef chuck, cooked", 8.4),
        ("Pumpkin seeds", 7.6),
        ("Cashews", 5.6),
    ],
    "copper": [
        ("Beef liver", 14.6),
        ("Oysters, cooked", 4.5),
        ("Cashews", 2.2),
        ("Dark chocolate", 1.8),
    ],
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
                rows = self._query_api(nutrient, limit)
                if rows:
                    return rows
            except (requests.RequestException, ValueError):
                pass  # fall through to offline table
        return self._fallback(nutrient, limit)

    def _query_api(self, nutrient: str, limit: int) -> list[FoodRow]:
        term = _NUTRIENT_QUERY.get(nutrient, nutrient.replace("_", " "))
        # Over-fetch so density ranking has candidates to sort before we trim.
        resp = requests.get(
            FDC_SEARCH_URL,
            params={
                "api_key": self.api_key,
                "query": term,
                "pageSize": max(limit * 5, 25),
                "dataType": "Foundation,SR Legacy",
            },
            timeout=self.timeout,
        )
        resp.raise_for_status()
        payload = resp.json()

        number = _FDC_NUTRIENT_NUMBER.get(nutrient)
        unit = _NUTRIENT_UNIT.get(nutrient)
        rows: list[FoodRow] = []
        for food in payload.get("foods", []):
            amount = _extract_amount(food, number) if number else None
            rows.append(
                FoodRow(
                    nutrient=nutrient,
                    food_name=food.get("description", "Unknown"),
                    fdc_id=food.get("fdcId"),
                    amount_per_100g=round(amount, 2) if amount is not None else None,
                    amount_unit=unit if amount is not None else None,
                )
            )

        # Rank by nutrient density (amount desc); foods with no reported amount
        # sort last but are still available if we are short on candidates.
        rows.sort(key=lambda r: (r.amount_per_100g is None, -(r.amount_per_100g or 0.0)))
        return rows[:limit]

    def _fallback(self, nutrient: str, limit: int) -> list[FoodRow]:
        unit = _NUTRIENT_UNIT.get(nutrient)
        foods = sorted(
            _FALLBACK_FOODS.get(nutrient, []), key=lambda pair: -pair[1]
        )[:limit]
        return [
            FoodRow(
                nutrient=nutrient,
                food_name=name,
                fdc_id=None,
                amount_per_100g=amount,
                amount_unit=unit,
            )
            for name, amount in foods
        ]


def _extract_amount(food: dict, nutrient_number: str) -> float | None:
    """Read the target nutrient's per-100 g amount from a search-result food."""
    for entry in food.get("foodNutrients", []):
        # Search results expose the nutrient number under a few shapes depending
        # on dataType; check the common ones.
        num = (
            entry.get("nutrientNumber")
            or entry.get("number")
            or (entry.get("nutrient") or {}).get("number")
        )
        if str(num) == nutrient_number:
            value = entry.get("value")
            if value is None:
                value = entry.get("amount")
            if value is not None:
                return float(value)
    return None
