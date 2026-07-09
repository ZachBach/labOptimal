# Reference ranges and canonical analytes

The detector compares every reading against a **reference interval** (standard
lab range) and, where defined, an **optimal band** (functional range). This doc
is the human-facing view of `services/engine/src/laboptimal_engine/data/reference_ranges.py`,
which is the machine-readable source of truth.

> These ranges are conventional adult intervals seeded for the scaffold. They
> are for orientation, not medical advice, and each will be reviewed with a
> cited source before any public release. Sourcing is tracked in the table's
> `source` column as it is added.

## Schema

Each canonical analyte has:

| Field            | Meaning                                                        |
|------------------|----------------------------------------------------------------|
| `canonical`      | Stable key used across engine, API, and app. Never renamed.     |
| `display_name`   | Human-readable label shown in the UI.                          |
| `unit`           | Canonical unit; the normalizer converts everything to this.    |
| `reference_low`  | Lower bound of the standard reference interval.                |
| `reference_high` | Upper bound of the standard reference interval.                |
| `optimal_low`    | Lower bound of the functional optimal band (optional).         |
| `optimal_high`   | Upper bound of the functional optimal band (optional).         |
| `aliases`        | Strings the parser may encounter for this analyte.             |
| `nutrients`      | Target nutrients a shortfall maps to.                          |

## Seeded analytes

| Canonical         | Display              | Unit   | Reference   | Optimal    | Nutrients            |
|-------------------|----------------------|--------|-------------|------------|----------------------|
| `vitamin_d_25oh`  | Vitamin D, 25-Hydroxy| ng/mL  | 30 - 100    | 50 - 80    | vitamin_d            |
| `ferritin`        | Ferritin             | ng/mL  | 30 - 400    | 50 - 150   | iron                 |
| `vitamin_b12`     | Vitamin B12          | pg/mL  | 200 - 900   | 500 - 900  | vitamin_b12          |
| `folate_serum`    | Folate, Serum        | ng/mL  | 3 - 20      | 10 - 20    | folate               |
| `magnesium`       | Magnesium            | mg/dL  | 1.7 - 2.2   | 1.9 - 2.2  | magnesium            |
| `hemoglobin`      | Hemoglobin           | g/dL   | 13.5 - 17.5 | 14 - 16    | iron, b12, folate    |

## Unit conversions handled

The normalizer converts these variants to the canonical unit:

| Analyte          | From     | To     | Factor        |
|------------------|----------|--------|---------------|
| `vitamin_d_25oh` | nmol/L   | ng/mL  | 1 / 2.496     |
| `folate_serum`   | nmol/L   | ng/mL  | 1 / 2.265     |
| `vitamin_b12`    | pmol/L   | pg/mL  | 1 / 0.7378    |
| `magnesium`      | mmol/L   | mg/dL  | 1 / 0.4114    |

An unrecognized unit is not converted: the reading is assumed already-canonical
and a warning is added to the protocol so the value can be verified rather than
trusted silently.

## Interaction rules (detector)

Cross-analyte reasoning runs after per-analyte classification. Current rules:

1. **Iron-deficiency anemia pattern**: low hemoglobin + low ferritin raises
   ferritin confidence and notes iron as the likely driver.
2. **Ferritin as acute-phase reactant**: normal/high ferritin gets a caveat that
   it can mask iron deficiency during inflammation (interpret with CRP).
3. **Magnesium as vitamin D cofactor**: low vitamin D + low magnesium notes that
   repleting magnesium supports the vitamin D response.

## Expansion plan

Adding an analyte is one entry in `REFERENCE_RANGES` plus its aliases. The
parser, normalizer, detector, and recommender all read from this table, so no
other code changes for a new analyte that reuses an existing nutrient. New
nutrients also need an entry in the recommender's supplement-form table and the
USDA client's query/fallback maps.
