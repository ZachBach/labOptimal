# LabOptimal mobile (Copilot / GPT-5 lane)

React Native app: capture a lab photo, upload it, and render the returned
protocol. Owned by the Copilot lane. Integrate through the API in
`../api` and the shapes in `docs/api-contract.md`.

## What to build

See the checklist in `../../TASKS.md` under "Copilot / GPT-5 lane".

Summary:
- App scaffold (Expo recommended) + navigation
- Camera / image picker screen
- Upload flow with processing state (poll `GET /scans/:id` until `complete`)
- Results screen rendering `Protocol`:
  - Findings as cards, colored by `status` (deficient/suboptimal/optimal/elevated/high)
  - Food suggestions grouped by `nutrient`
  - Supplement list with `form` and `notes`
  - Citations footer
- History screen (`GET /scans`)
- Auth screens

## Rendering the protocol

Key off the exact field names in `docs/api-contract.md`. `status` drives color;
`severity` (0.0-1.0) can drive sort order or a magnitude bar; `confidence` can
be shown as a secondary signal. Only `deficient` and `suboptimal` findings carry
`target_nutrients` and map to food/supplement suggestions.
