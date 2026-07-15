"""Nutrient dossier schema and seed library.

Doses and intake reference points are conventional adult orientation values, not
medical advice; they exist to give the app something concrete to show and to
carry citations. Every dossier is licensed CC BY 4.0 so it can be reused and
extended outside this repo.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Dossier:
    """One curated nutrient dossier.

    nutrient:         canonical nutrient key (matches reference_ranges.nutrients)
    name:             human-readable nutrient name
    summary:          one-line role of the nutrient
    rda:              recommended daily allowance (adult, orientation)
    upper_limit:      tolerable upper intake level, or None if not established
    supplement_dose:  typical repletion dose -> SupplementSuggestion.suggested_dose
    food_sources:     representative dietary sources
    interactions:     notable nutrient/drug interactions
    citations:        sources backing the dossier
    license:          content license
    """

    nutrient: str
    name: str
    summary: str
    rda: str
    upper_limit: str | None
    supplement_dose: str
    food_sources: tuple[str, ...] = ()
    interactions: tuple[str, ...] = ()
    citations: tuple[str, ...] = ()
    license: str = "CC BY 4.0"


DOSSIERS: dict[str, Dossier] = {
    d.nutrient: d
    for d in [
        Dossier(
            nutrient="iron",
            name="Iron",
            summary="Oxygen transport (hemoglobin) and energy metabolism.",
            rda="8 mg/day (adult men), 18 mg/day (menstruating women).",
            upper_limit="45 mg/day (elemental).",
            supplement_dose="18–65 mg elemental iron daily; recheck ferritin in 8–12 weeks.",
            food_sources=("Beef liver", "Lentils", "Spinach", "Pumpkin seeds"),
            interactions=(
                "Vitamin C boosts non-heme iron absorption.",
                "Calcium, coffee, and tea reduce absorption; separate by 2 hours.",
            ),
            citations=("NIH Office of Dietary Supplements, Iron fact sheet (2023).",),
        ),
        Dossier(
            nutrient="vitamin_d",
            name="Vitamin D",
            summary="Calcium absorption, bone health, and immune modulation.",
            rda="600 IU/day (adults <70), 800 IU/day (70+).",
            upper_limit="4,000 IU/day.",
            supplement_dose="1,000–2,000 IU (25–50 µg) daily maintenance, with a fat-containing meal.",
            food_sources=("Salmon", "Sardines", "Egg yolk", "Fortified milk"),
            interactions=(
                "Magnesium is a cofactor for activation.",
                "Improves calcium absorption.",
            ),
            citations=(
                "NIH Office of Dietary Supplements, Vitamin D fact sheet (2023).",
            ),
        ),
        Dossier(
            nutrient="vitamin_b12",
            name="Vitamin B12",
            summary="Red blood cell formation, nerve function, DNA synthesis.",
            rda="2.4 µg/day.",
            upper_limit="Not established.",
            supplement_dose="500–1,000 µg daily (oral or sublingual); more if malabsorption.",
            food_sources=("Clams", "Beef liver", "Sardines", "Fortified nutritional yeast"),
            interactions=(
                "Folate can mask B12-deficiency anemia; replete B12 first.",
                "Metformin and PPIs lower B12 over time.",
            ),
            citations=("NIH Office of Dietary Supplements, Vitamin B12 fact sheet (2024).",),
        ),
        Dossier(
            nutrient="folate",
            name="Folate",
            summary="DNA synthesis and red blood cell formation.",
            rda="400 µg DFE/day.",
            upper_limit="1,000 µg/day (from supplements/fortification).",
            supplement_dose="400–800 µg daily (L-methylfolate preferred).",
            food_sources=("Lentils", "Chickpeas", "Asparagus", "Spinach"),
            interactions=(
                "High folate can mask B12 deficiency.",
                "Methotrexate and some antiepileptics deplete folate.",
            ),
            citations=("NIH Office of Dietary Supplements, Folate fact sheet (2024).",),
        ),
        Dossier(
            nutrient="magnesium",
            name="Magnesium",
            summary="300+ enzymatic reactions, muscle and nerve function.",
            rda="400–420 mg/day (men), 310–320 mg/day (women).",
            upper_limit="350 mg/day from supplements (excludes food).",
            supplement_dose="200–400 mg elemental daily (glycinate or citrate).",
            food_sources=("Pumpkin seeds", "Almonds", "Black beans", "Dark chocolate"),
            interactions=(
                "Cofactor for vitamin D activation.",
                "High doses can reduce absorption of some antibiotics.",
            ),
            citations=("NIH Office of Dietary Supplements, Magnesium fact sheet (2022).",),
        ),
        Dossier(
            nutrient="zinc",
            name="Zinc",
            summary="Immune function, wound healing, protein synthesis.",
            rda="11 mg/day (men), 8 mg/day (women).",
            upper_limit="40 mg/day.",
            supplement_dose="15–30 mg daily short-term; add 1–2 mg copper if prolonged.",
            food_sources=("Oysters", "Beef", "Pumpkin seeds", "Cashews"),
            interactions=(
                "Competes with copper; sustained high zinc causes copper deficiency.",
                "Take apart from iron and calcium supplements.",
            ),
            citations=("NIH Office of Dietary Supplements, Zinc fact sheet (2022).",),
        ),
        Dossier(
            nutrient="copper",
            name="Copper",
            summary="Iron metabolism, connective tissue, antioxidant defense.",
            rda="900 µg/day.",
            upper_limit="10 mg/day.",
            supplement_dose="1–2 mg daily, typically only to offset high-dose zinc.",
            food_sources=("Beef liver", "Oysters", "Cashews", "Dark chocolate"),
            interactions=("High zinc intake is the most common cause of deficiency.",),
            citations=("NIH Office of Dietary Supplements, Copper fact sheet (2022).",),
        ),
        Dossier(
            nutrient="calcium",
            name="Calcium",
            summary="Bone structure, muscle contraction, nerve signaling.",
            rda="1,000 mg/day (adults), 1,200 mg/day (women 51+).",
            upper_limit="2,500 mg/day (adults ≤50).",
            supplement_dose="500–1,000 mg daily in divided doses, paired with vitamin D.",
            food_sources=("Yogurt", "Sardines with bones", "Fortified plant milk", "Kale"),
            interactions=(
                "Needs vitamin D for absorption.",
                "Reduces iron and zinc absorption; separate doses.",
            ),
            citations=("NIH Office of Dietary Supplements, Calcium fact sheet (2024).",),
        ),
    ]
}


def dossier_for(nutrient: str) -> Dossier | None:
    """Return the dossier for a nutrient key, or None if not yet curated."""
    return DOSSIERS.get(nutrient)
