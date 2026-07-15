"""Meal-plan generator: allocation, determinism, and edge cases."""

from __future__ import annotations

from collections import Counter

from laboptimal_engine.mealplan.generator import DAYS, SLOTS, MealPlanGenerator
from laboptimal_engine.models import AnalyteStatus, Finding, FoodSuggestion


def _finding(analyte: str, status: AnalyteStatus, severity: float, nutrients: list[str]) -> Finding:
    return Finding(
        analyte=analyte,
        display_name=analyte,
        value=1.0,
        unit="x",
        status=status,
        severity=severity,
        confidence=0.9,
        target_nutrients=nutrients,
    )


def _foods(nutrient: str, names: list[str]) -> list[FoodSuggestion]:
    return [FoodSuggestion(nutrient=nutrient, food_name=n) for n in names]


FINDINGS = [
    _finding("ferritin", AnalyteStatus.DEFICIENT, 0.8, ["iron"]),
    _finding("magnesium", AnalyteStatus.SUBOPTIMAL, 0.3, ["magnesium"]),
]
FOODS = _foods("iron", ["Beef liver", "Lentils, cooked", "Spinach, cooked"]) + _foods(
    "magnesium", ["Pumpkin seeds", "Almonds"]
)


def test_full_week_with_all_slots_filled():
    plan = MealPlanGenerator().generate(FINDINGS, FOODS)
    assert plan is not None
    assert len(plan.days) == DAYS
    assert all(len(d.meals) == len(SLOTS) for d in plan.days)
    assert [d.day for d in plan.days] == list(range(1, DAYS + 1))


def test_deficient_nutrient_gets_more_slots_than_suboptimal():
    plan = MealPlanGenerator().generate(FINDINGS, FOODS)
    counts = Counter(m.target_nutrients[0] for d in plan.days for m in d.meals)
    assert counts["iron"] > counts["magnesium"]
    assert sum(counts.values()) == DAYS * len(SLOTS)


def test_deterministic():
    a = MealPlanGenerator().generate(FINDINGS, FOODS)
    b = MealPlanGenerator().generate(FINDINGS, FOODS)
    assert a.model_dump() == b.model_dump()


def test_meals_only_use_suggested_foods():
    plan = MealPlanGenerator().generate(FINDINGS, FOODS)
    suggested = {f.food_name for f in FOODS}
    for day in plan.days:
        for meal in day.meals:
            assert set(meal.foods) <= suggested


def test_focus_chips_are_unique_and_capped():
    plan = MealPlanGenerator().generate(FINDINGS, FOODS)
    assert 1 <= len(plan.focus) <= 3
    assert len(plan.focus) == len(set(plan.focus))


def test_no_actionable_findings_returns_none():
    optimal = [_finding("vitamin_d", AnalyteStatus.OPTIMAL, 0.0, [])]
    assert MealPlanGenerator().generate(optimal, FOODS) is None


def test_no_foods_returns_none():
    assert MealPlanGenerator().generate(FINDINGS, []) is None
