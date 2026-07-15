# LabOptimal build plan: two-agent task split

Two AI agents work this repo in parallel: Claude (me) and GPT-5 via Copilot. The
split is by **file and module boundary**, not just by difficulty, so we never
edit the same file at the same time and never generate merge conflicts. The
shared integration surface is the two contract docs in `docs/`.

## Status snapshot

- **Engine MVP + Phase 1 depth are complete and tested.** 29 pytest tests pass.
  The full pipeline runs end to end: `cd services/engine && pip install -e ".[dev]" && python -m laboptimal_engine.pipeline --demo`.
  USDA amounts + density ranking, the expanded cited analyte panel, the added
  interaction rules, the confidence model, and the dossier library are all in.
- **Contracts are frozen** in `docs/api-contract.md` and `docs/reference-ranges.md`
  (dossier schema in `docs/nutrient-dossiers.md`).
- **Mobile is wired to the Node API.** Auth (login/signup/guest), the
  POST /scans + poll flow, and scan history are built; the app typechecks clean
  and component tests pass.

## Why this split

Claude takes the analytical core, the domain data model, the algorithms, and the
contracts, where correctness and medical-domain reasoning dominate and a wrong
call is expensive. GPT-5/Copilot takes the surrounding application scaffolding:
Node API, React Native UI, tests, migrations, and CI, where patterns are well
established and throughput matters more than novel reasoning.

Rule of the road: if you need to change something in the other lane's files,
change the contract doc instead and let that lane pick it up.

---

## Claude lane

Owns: `services/engine/**`, `docs/**`, `README.md`, `TASKS.md`

### Phase 0 — engine MVP (done)

- [x] Monorepo layout and architecture
- [x] README with mermaid architecture, sequence, and detection diagrams
- [x] Python engine scaffold with numpy/pandas wired in
- [x] `requirements.txt` and `pyproject.toml` (editable install + console script)
- [x] `docs/api-contract.md`: the protocol JSON schema (engine output = API response body)
- [x] `docs/reference-ranges.md`: canonical analyte list + reference-range schema
- [x] OCR provider interface (`ocr/base.py`): Tesseract default, static (demo/test), cloud stub
- [x] Lab parser: extract analyte, value, unit, reference range from OCR text
- [x] Normalizer: canonical units, canonical analyte mapping, unit-mismatch warnings
- [x] Deficiency detector: reference-range comparison + interaction rules (iron-deficiency pattern, ferritin-as-acute-phase-reactant, magnesium-as-vitamin-D-cofactor)
- [x] Nutrient-to-food recommender using USDA FoodData Central (offline fallback)
- [x] Severity + confidence ranking (findings sorted most-actionable first)
- [x] Engine unit tests (parser, normalizer, detector, interaction rules)
- [x] Golden-file test: `sample_panel.txt` in, `expected_protocol.json` out

### Phase 1 — depth (next)

Ordered by leverage. Items 1-3 close gaps between the README's promise and what
the engine does today; 4-5 raise output quality; 6 is the integration option.

1. [x] **Meal-plan generation.** `mealplan/generator.py` assembles the food
   suggestions into a 7-day plan (breakfast/lunch/dinner), distributing slots in
   proportion to nutrient need (deficient outweighs suboptimal, scaled by
   severity) via largest-remainder allocation + smooth weighted round robin.
   Deterministic (golden-file safe). `Protocol.meal_plan` added; contract
   documented in `api-contract.md`; mobile types + mapper consume `focus` and
   `notes`. 7 unit tests; verified over the live service.
2. [x] **Real nutrient amounts from USDA.** `FoodSuggestion.amount_per_100g` now
   carries the per-food amount of the target nutrient (read from the FDC search
   response by nutrient number, curated table offline), and foods are ranked by
   nutrient density. `amount_unit` reports µg/mg. Golden file + tests updated.
3. [x] **Expand the analyte panel with cited ranges.** `ReferenceRange` gained a
   `source` field; every range is cited and the citations flow into the protocol.
   Added TSH/free T4, lipid panel (total/LDL/HDL/triglycerides), HbA1c, CBC
   context (hematocrit, MCV), zinc, copper, calcium, and hs-CRP.
4. [x] **More interaction rules.** Calcium↔vitamin D absorption, zinc↔copper
   competition, B12↔folate masking (with MCV corroboration), and ferritin
   interpreted with CRP (both masking and low-despite-inflammation cases).
5. [x] **Confidence model.** Confidence starts at 1.0 and is docked for assumed
   units and missing printed ranges; interaction rules raise it on corroboration.
   Every adjustment appends a `confidence_drivers` string so the app can explain
   the number. Surfaced on both `AnalyteReading` and `Finding`.
6. [x] **Engine HTTP service (FastAPI).** `services/engine/service.py` exposes
   `POST /analyze` (image / text / demo) over `pipeline.analyze`, returning the
   `Protocol`. Run with `laboptimal-engine-serve` (`pip install -e ".[service]"`).
   The mobile app calls it directly today; the Node API can proxy it later.

   **Phase B is wired**: the mobile `ScanContext.startScan` uploads the picked
   image to this service and maps the returned `Protocol` onto the UI view models
   (`services/mobile/src/api/`), with a graceful fallback to sample data when the
   engine is unreachable. Verified end to end against the live service (real
   findings, real USDA foods). The supplement `suggested_dose` gap is now closed
   by the dossier library (below).

### Nutrient dossier library (spans initiatives)

- [x] Curated nutrient dossiers (CC BY 4.0) that back recommendations with
   citations. Shared with the Mental Health x Microbiome research agent. Schema
   is `dossiers/library.py` (documented in `docs/nutrient-dossiers.md`); seeded
   for iron, vitamin D, B12, folate, magnesium, zinc, copper, calcium. The
   recommender reads `supplement_dose` into `SupplementSuggestion.suggested_dose`
   and the pipeline folds dossier citations into the protocol.

---

## Copilot / GPT-5 lane

Owns: `services/api/**`, `services/mobile/**`, `.github/**`, root infra config

Read `docs/api-contract.md` before starting the API. Read `docs/reference-ranges.md`
if you build any results UI that labels analyte status. Do not edit `services/engine/**`.

**Recommended stack** (chosen to minimize decisions; deviate only with reason):
Fastify + TypeScript, Prisma + PostgreSQL, Expo for React Native. Fastify for
built-in schema validation; Prisma for typed migrations; Expo for fast device iteration.

### Phase 1 — API foundation (start here)

Ordered; each depends on the one above. No dependency on the engine yet.

1. [x] `services/api` scaffold: `package.json`, `tsconfig`, ESLint/Prettier, `src/` layout
2. [x] App bootstrap (Fastify), `GET /health`, structured logging, config via env
3. [x] `docker-compose.yml` for local Postgres; `.env.example` for the API
4. [x] Prisma schema + first migration: `users`, `scans`, `results`, `foods_cache`
5. [x] Auth: signup/login, password hashing (argon2), JWT sessions, auth middleware

### Phase 2 — scan flow (depends on Phase 1 + the frozen contract)

Build against a **mocked** protocol response first; wire the real engine at
integration checkpoint 2.

6. [x] `POST /scans`: accept multipart image, store the file, create a `scan` row (status `processing`)
7. [x] Engine integration: call the engine and map its JSON to the response per `api-contract.md`
   (subprocess `python -m laboptimal_engine.pipeline --image <path>`, or HTTP to the FastAPI sidecar)
8. [x] Persist the protocol to `results`; set status `complete` / `failed`
9. [x] `GET /scans/:id` (protocol + status) and `GET /scans` (user's scans)
10. [x] Request validation (schema), rate limiting, consistent error envelope
11. [x] API integration tests (Vitest + supertest) against a mocked engine

### Phase 3 — mobile

The **presentational layer is built** (Claude lane, on request) in
`services/mobile`: Expo + TS, all six board screens (home, upload, deficiency,
plan, marker, library), a component library, design tokens ported from
`docs/brand/tokens.css`, and `Protocol` types mirroring the contract, all on
sample data and typechecking clean. See `services/mobile/README.md` for the
component inventory and the exact handoff boundary.

Copilot wires it to reality (do not rebuild the components; swap sample data for
real data and the preview shell for a real navigator):

12. [x] Expo app scaffold + brand fonts + screens (done, Claude lane)
13. [x] Design-faithful component library on the `Protocol` contract (done, Claude lane)
14. [x] react-navigation + auth screens. `App.tsx` gates on auth state (loading /
    signed out / signed in / guest); `AuthContext` persists a JWT via
    expo-secure-store (localStorage on web) and restores the session on boot.
    `AuthScreen` does login/signup against the Node API, with a guest path.
15. [x] Camera / file import behind the Upload screen (`expo-image-picker` for the
    camera + photo library, `expo-document-picker` for PDF/image files).
16. [x] Upload flow: signed-in users `POST /scans` then poll `GET /scans/:id` until
    `complete` (`api/apiClient.ts` `pollScan`); guests hit the engine directly.
    Falls back to sample data if the backend is unreachable.
17. [x] Map a real API `Protocol` onto the screens' view models (`protocolToResults`).
18. [x] History screen (`GET /scans`) with pull-to-refresh and tap-to-open, plus an
    Account screen (email, history shortcut, sign out) replacing the Profile stub.
19. [x] Component tests

### Phase 4 — infra / CI (can start any time)

18. [x] `.github/workflows/ci.yml`: engine `pytest` + API tests + lint on PR
19. [x] Dockerfiles for `engine` and `api`

---

## Integration checkpoints

1. **Contract freeze** (done): `docs/api-contract.md` is frozen; both lanes build
   to it independently.
2. **Engine invocation decision**: pick subprocess vs FastAPI sidecar when the
   Copilot lane reaches Phase 2 item 7. Recommendation: start with subprocess
   (simplest, zero new services); move to the sidecar (Claude Phase 1 item 6) if
   per-request Python startup cost matters under load.
3. **First end-to-end**: Copilot's `POST /scans` calls the real engine with a
   sample image; both lanes fix integration bugs against the contract, not each
   other's code.

## Your next three moves

The Phase 1 depth work and the mobile API integration are done. What's left to
ship is operational, not feature work:

- **Deploy the backend**: stand up the engine + Node API + Postgres somewhere
  public (Dockerfiles and `docker-compose.yml` exist). Point the mobile app at it
  via `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_ENGINE_URL`.
- **Real OCR**: install the Tesseract binary on the engine host (or implement the
  `CloudOCRProvider`) so photo uploads work, not just text/demo.
- **Store prep**: fill `app.json` (bundle id, package, icon), add a medical
  disclaimer + privacy policy, then build with EAS. See TestFlight / Play
  internal testing before a public release.

## References

- USDA FoodData Central API: https://fdc.nal.usda.gov/api-guide.html (free key)
- Live contract example: `cd services/engine && python -m laboptimal_engine.pipeline --demo`
- Engine invocation: `python -m laboptimal_engine.pipeline --image <path>` prints
  protocol JSON to stdout; or import `laboptimal_engine.pipeline.analyze(image_bytes)`.
