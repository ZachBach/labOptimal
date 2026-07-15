# Nutrient dossiers

Curated, citation-backed notes on each nutrient the engine can recommend. They
give the app concrete guidance (a repletion dose, intake reference points, food
sources, interactions) and carry the sources behind it. The machine-readable
source of truth is
`services/engine/src/laboptimal_engine/dossiers/library.py`.

> Content is orientation, not medical advice. Doses are conventional adult
> ranges; a clinician sets the actual plan. Every dossier is licensed **CC BY
> 4.0** so it can be reused and extended outside this repo (including by the
> Mental Health x Microbiome research agent this library is shared with).

## Schema

| Field             | Meaning                                                            |
|-------------------|--------------------------------------------------------------------|
| `nutrient`        | Canonical nutrient key (matches `reference_ranges` nutrients).      |
| `name`            | Human-readable nutrient name.                                       |
| `summary`         | One-line role of the nutrient.                                      |
| `rda`             | Recommended daily allowance (adult, orientation).                   |
| `upper_limit`     | Tolerable upper intake level, or "Not established".                 |
| `supplement_dose` | Typical repletion dose. Fills `SupplementSuggestion.suggested_dose`.|
| `food_sources`    | Representative dietary sources.                                     |
| `interactions`    | Notable nutrient / drug interactions.                              |
| `citations`       | Sources backing the dossier (folded into the protocol `citations`).|
| `license`         | Content license (CC BY 4.0).                                        |

## How it wires into the engine

- The **recommender** looks up a nutrient's dossier and uses `supplement_dose`
  to fill `SupplementSuggestion.suggested_dose`. Before dossiers, this was always
  `null` and the app showed "As directed"; now curated nutrients carry a dose.
- The **pipeline** folds each dossier's `citations` into the protocol's
  `citations`, alongside the reference-range sources, so provenance travels with
  the result.

## Seeded nutrients

`iron`, `vitamin_d`, `vitamin_b12`, `folate`, `magnesium`, `zinc`, `copper`,
`calcium`.

## Adding a dossier

Append a `Dossier(...)` to `DOSSIERS` in `library.py`. If the nutrient is new to
the system, also add its analyte(s) to `reference_ranges.py` and a supplement
form to the recommender. No other code changes: the recommender and pipeline
read the library by nutrient key.
