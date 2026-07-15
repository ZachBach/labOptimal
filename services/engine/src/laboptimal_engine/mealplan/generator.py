"""Assemble food suggestions into a week of meals.

The generator distributes meal slots across the target nutrients in proportion
to how badly each is needed (deficient outweighs suboptimal, scaled by finding
severity), then fills the week by rotating through each nutrient's suggested
foods. It is fully deterministic: the same findings and foods always produce
the same plan, which keeps the golden-file test stable.
"""

from __future__ import annotations

from ..models import (
    AnalyteStatus,
    Finding,
    FoodSuggestion,
    MealIdea,
    MealPlan,
    MealPlanDay,
)

DAYS = 7
SLOTS = ("breakfast", "lunch", "dinner")

# Foods that read naturally at breakfast; used to swap one into a breakfast
# slot when the chosen nutrient offers one.
_BREAKFAST_HINTS = ("egg", "yogurt", "milk", "fortified", "cereal", "oat", "almond")

_STATUS_WEIGHT = {
    AnalyteStatus.DEFICIENT: 1.0,
    AnalyteStatus.HIGH: 1.0,
    AnalyteStatus.SUBOPTIMAL: 0.5,
    AnalyteStatus.ELEVATED: 0.5,
}


def _display_nutrient(key: str) -> str:
    """'vitamin_b12' -> 'vitamin B12', 'iron' -> 'iron'."""
    parts = key.split("_")
    return " ".join([parts[0]] + [p.upper() if len(p) <= 3 else p for p in parts[1:]])


def _chip_name(food_name: str) -> str:
    """'Salmon, cooked' -> 'Salmon' for chip-sized focus labels."""
    return food_name.split(",")[0].strip()


class MealPlanGenerator:
    def generate(
        self, findings: list[Finding], foods: list[FoodSuggestion]
    ) -> MealPlan | None:
        weights = self._nutrient_weights(findings)
        foods_by_nutrient: dict[str, list[str]] = {}
        for food in foods:
            if food.nutrient in weights:
                foods_by_nutrient.setdefault(food.nutrient, []).append(food.food_name)

        nutrients = [n for n in weights if foods_by_nutrient.get(n)]
        if not nutrients:
            return None

        total_slots = DAYS * len(SLOTS)
        allocation = self._allocate_slots(nutrients, weights, total_slots)
        order = self._interleave(nutrients, allocation)

        rotation = {n: 0 for n in nutrients}
        used_count: dict[str, int] = {}
        days: list[MealPlanDay] = []
        for day_index in range(DAYS):
            meals: list[MealIdea] = []
            for slot_index, slot in enumerate(SLOTS):
                nutrient = order[day_index * len(SLOTS) + slot_index]
                food = self._pick_food(
                    foods_by_nutrient[nutrient], rotation, nutrient, slot
                )
                used_count[food] = used_count.get(food, 0) + 1
                meals.append(
                    MealIdea(
                        slot=slot,
                        title=food,
                        foods=[food],
                        target_nutrients=[nutrient],
                    )
                )
            days.append(MealPlanDay(day=day_index + 1, meals=meals))

        focus = self._focus_chips(nutrients, foods_by_nutrient, used_count)
        top = [_display_nutrient(n) for n in nutrients[:3]]
        notes = f"Built to raise {', '.join(top)} over the next month."

        return MealPlan(focus=focus, days=days, notes=notes)

    def _nutrient_weights(self, findings: list[Finding]) -> dict[str, float]:
        """Ordered nutrient -> need weight. Findings arrive ranked, so insertion
        order preserves priority; weight only shapes slot counts."""
        weights: dict[str, float] = {}
        for finding in findings:
            base = _STATUS_WEIGHT.get(finding.status)
            if base is None:
                continue
            weight = base + finding.severity / 2
            for nutrient in finding.target_nutrients:
                weights[nutrient] = max(weights.get(nutrient, 0.0), weight)
        return weights

    def _allocate_slots(
        self, nutrients: list[str], weights: dict[str, float], total: int
    ) -> dict[str, int]:
        """Largest-remainder proportional allocation, minimum one slot each."""
        total_weight = sum(weights[n] for n in nutrients)
        exact = {n: total * weights[n] / total_weight for n in nutrients}
        allocation = {n: max(1, int(exact[n])) for n in nutrients}
        while sum(allocation.values()) > total:
            biggest = max(nutrients, key=lambda n: allocation[n])
            allocation[biggest] -= 1
        remainders = sorted(
            nutrients, key=lambda n: exact[n] - int(exact[n]), reverse=True
        )
        index = 0
        while sum(allocation.values()) < total:
            allocation[remainders[index % len(remainders)]] += 1
            index += 1
        return allocation

    def _interleave(self, nutrients: list[str], allocation: dict[str, int]) -> list[str]:
        """Spread each nutrient's slots evenly across the week instead of
        clumping them (smooth weighted round robin)."""
        total = sum(allocation.values())
        remaining = dict(allocation)
        credit = {n: 0.0 for n in nutrients}
        order: list[str] = []
        for _ in range(total):
            active = [n for n in nutrients if remaining[n] > 0]
            for n in active:
                credit[n] += allocation[n]
            pick = max(active, key=lambda n: (credit[n], allocation[n]))
            credit[pick] -= total
            remaining[pick] -= 1
            order.append(pick)
        return order

    def _pick_food(
        self,
        options: list[str],
        rotation: dict[str, int],
        nutrient: str,
        slot: str,
    ) -> str:
        """Next food in this nutrient's rotation, preferring a breakfast-friendly
        option for breakfast slots when one exists."""
        if slot == "breakfast":
            for candidate in options:
                if any(hint in candidate.lower() for hint in _BREAKFAST_HINTS):
                    return candidate
        food = options[rotation[nutrient] % len(options)]
        rotation[nutrient] += 1
        return food

    def _focus_chips(
        self,
        nutrients: list[str],
        foods_by_nutrient: dict[str, list[str]],
        used_count: dict[str, int],
    ) -> list[str]:
        chips: list[str] = []
        claimed: set[str] = set()
        for nutrient in nutrients[:4]:
            candidates = [f for f in foods_by_nutrient[nutrient] if f not in claimed]
            if not candidates:
                continue
            top_food = max(candidates, key=lambda f: used_count.get(f, 0))
            count = used_count.get(top_food, 0)
            if count <= 0:
                continue
            claimed.add(top_food)
            label = "daily" if count >= DAYS else f"{count}x"
            chips.append(f"{_chip_name(top_food)} {label}")
        return chips[:3]
