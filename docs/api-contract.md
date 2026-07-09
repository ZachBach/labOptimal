# API contract

This is the integration surface between the three services. The Python engine
emits a **Protocol** object; the Node API persists it and returns it as the
body of a completed scan; the React Native app renders it. Change this doc when
the shape changes, and both build lanes pick it up here rather than reading each
other's code.

The authoritative definition lives in `services/engine/src/laboptimal_engine/models.py`.
Regenerate a live example any time with:

```bash
cd services/engine && PYTHONPATH=src python -m laboptimal_engine.pipeline --demo
```

## REST endpoints (Node API, Copilot lane)

| Method | Path          | Body                | Returns                                  |
|--------|---------------|---------------------|------------------------------------------|
| POST   | `/scans`      | multipart image     | `{ id, status: "processing" }`           |
| GET    | `/scans/:id`  | -                   | `{ id, status, protocol? }`              |
| GET    | `/scans`      | -                   | `{ scans: [{ id, status, created_at }] }`|

`status` is one of `processing`, `complete`, `failed`. When `complete`, the
`protocol` field holds the object below verbatim from the engine.

## Protocol object

```jsonc
{
  "generated_at": "2026-07-09T02:25:40.136093Z",  // ISO 8601 UTC
  "engine_version": "0.1.0",
  "findings": [ /* Finding[] */ ],
  "food_suggestions": [ /* FoodSuggestion[] */ ],
  "supplement_suggestions": [ /* SupplementSuggestion[] */ ],
  "citations": [ "string" ],
  "warnings": [ "string" ]
}
```

### Finding

```jsonc
{
  "analyte": "vitamin_d_25oh",          // canonical key (see reference-ranges.md)
  "display_name": "Vitamin D, 25-Hydroxy",
  "value": 22.0,
  "unit": "ng/mL",
  "status": "deficient",                // deficient | suboptimal | optimal | elevated | high
  "severity": 0.267,                    // 0.0 at range boundary, 1.0 far outside
  "confidence": 0.8,                    // parser + rule confidence, 0.0-1.0
  "target_nutrients": ["vitamin_d"],    // populated only for actionable statuses
  "notes": "Magnesium is a cofactor for vitamin D activation; ..."  // or null
}
```

### FoodSuggestion

```jsonc
{
  "nutrient": "iron",
  "food_name": "Beef liver",
  "fdc_id": 168601,          // USDA FoodData Central id, or null when from offline fallback
  "amount_per_100g": null,   // populated when nutrient amounts are fetched
  "amount_unit": null
}
```

### SupplementSuggestion

```jsonc
{
  "nutrient": "iron",
  "form": "Ferrous bisglycinate",
  "suggested_dose": null,    // left null until the dossier library lands
  "notes": "Better tolerated than sulfate; pair with vitamin C."
}
```

## Status semantics

- `deficient` / `high`: outside the reference interval. Always actionable.
- `suboptimal` / `elevated`: inside the reference interval but outside the
  functional optimal band. Actionable at the user's discretion; drives most of
  LabOptimal's value over a plain lab report.
- `optimal`: inside the optimal band. Not actionable.

`target_nutrients` is only populated for `deficient` and `suboptimal` findings,
which is what the recommender consumes.

## Notes for the API lane

- Treat the protocol as opaque and pass it through unchanged. Do not reshape
  field names; the mobile app keys off exactly these.
- The engine can be invoked two ways (pick one in integration checkpoint 2):
  1. Subprocess: `python -m laboptimal_engine.pipeline --image <path>`, read
     the protocol JSON from stdout.
  2. Python sidecar: import `laboptimal_engine.pipeline.analyze(image_bytes)`.
- `warnings` is non-fatal (e.g. an unrecognized analyte was skipped). Surface it
  but still return `status: complete`.
