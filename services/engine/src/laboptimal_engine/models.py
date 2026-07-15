"""Pydantic models that define the engine's data contract.

These types are the single source of truth for the JSON the engine emits.
`Protocol` is the top-level object; its JSON shape must stay in sync with
`docs/api-contract.md`, which the Node API and mobile app build against.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class AnalyteStatus(str, Enum):
    """Status of a single lab analyte relative to its reference and optimal ranges."""

    DEFICIENT = "deficient"      # below the reference range
    SUBOPTIMAL = "suboptimal"    # within reference range but outside optimal band
    OPTIMAL = "optimal"          # within the optimal band
    ELEVATED = "elevated"        # within reference range near the top
    HIGH = "high"                # above the reference range


class AnalyteReading(BaseModel):
    """A single normalized analyte value extracted from a lab report."""

    canonical: str = Field(..., description="Canonical analyte key, e.g. 'vitamin_d_25oh'")
    display_name: str = Field(..., description="Human-readable analyte name")
    value: float
    unit: str = Field(..., description="Canonical unit after normalization")
    reference_low: float | None = None
    reference_high: float | None = None
    optimal_low: float | None = None
    optimal_high: float | None = None
    source_text: str | None = Field(
        default=None, description="Raw OCR snippet this reading was parsed from"
    )


class Finding(BaseModel):
    """The engine's assessment of one analyte, with severity and confidence."""

    analyte: str = Field(..., description="Canonical analyte key")
    display_name: str
    value: float
    unit: str
    status: AnalyteStatus
    severity: float = Field(
        ..., ge=0.0, le=1.0,
        description="0 = at range boundary, 1 = far outside range",
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0,
        description="Parser + rule confidence for this finding",
    )
    target_nutrients: list[str] = Field(default_factory=list)
    notes: str | None = None


class FoodSuggestion(BaseModel):
    """A food that is rich in a target nutrient, sourced from USDA FoodData Central."""

    nutrient: str
    food_name: str
    fdc_id: int | None = None
    amount_per_100g: float | None = None
    amount_unit: str | None = None


class SupplementSuggestion(BaseModel):
    """A supplement option for a target nutrient."""

    nutrient: str
    form: str
    suggested_dose: str | None = None
    notes: str | None = None


class MealIdea(BaseModel):
    """One meal in the plan: a slot, the foods it uses, and why."""

    slot: str = Field(..., description="'breakfast' | 'lunch' | 'dinner'")
    title: str = Field(..., description="Human-readable meal line, e.g. 'Lentils, cooked'")
    foods: list[str] = Field(default_factory=list, description="Food names from food_suggestions")
    target_nutrients: list[str] = Field(default_factory=list)


class MealPlanDay(BaseModel):
    day: int = Field(..., ge=1, description="1-based day index within the plan")
    meals: list[MealIdea] = Field(default_factory=list)


class MealPlan(BaseModel):
    """A week of meals assembled from the food suggestions, biased toward the
    most deficient nutrients. `focus` is the chip-sized weekly summary the UI
    shows ('Salmon 3x', 'Lentils daily')."""

    focus: list[str] = Field(default_factory=list)
    days: list[MealPlanDay] = Field(default_factory=list)
    notes: str | None = None


class Protocol(BaseModel):
    """Top-level engine output. This is the API response body for a completed scan."""

    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    engine_version: str = "0.1.0"
    findings: list[Finding] = Field(default_factory=list)
    food_suggestions: list[FoodSuggestion] = Field(default_factory=list)
    supplement_suggestions: list[SupplementSuggestion] = Field(default_factory=list)
    meal_plan: MealPlan | None = None
    citations: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)

    def deficiencies(self) -> list[Finding]:
        """Findings that represent a shortfall worth acting on."""
        actionable = {AnalyteStatus.DEFICIENT, AnalyteStatus.SUBOPTIMAL}
        return [f for f in self.findings if f.status in actionable]
