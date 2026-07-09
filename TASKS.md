# LabOptimal build plan: two-agent task split

Two AI agents work this repo in parallel: Claude (me) and GPT-5 via Copilot. The
split is by **file and module boundary**, not just by difficulty, so we never
edit the same file at the same time and never generate merge conflicts. The
shared integration surface is the two contract docs in `docs/`.

## Status snapshot

- **Engine MVP is complete and tested.** 9 pytest tests pass. The full pipeline
  runs end to end: `cd services/engine && pip install -e ".[dev]" && python -m laboptimal_engine.pipeline --demo`.
- **Contracts are frozen** in `docs/api-contract.md` and `docs/reference-ranges.md`.
- **The Copilot lane is unblocked.** It can build the API and mobile app against
  the frozen contract today; the engine already emits exactly that shape.

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

1. [ ] **Meal-plan generation.** The product promises meal plans; the engine only
   emits per-nutrient food suggestions. Add a `mealplan/` module that assembles
   food suggestions into daily meals biased toward the deficient nutrients, and
   add `meal_plan` to the `Protocol` (contract change -> update `api-contract.md`).
2. [ ] **Real nutrient amounts from USDA.** `FoodSuggestion.amount_per_100g` is
   null today. Fetch per-food nutrient amounts so foods can be ranked by nutrient
   density, not just membership.
3. [ ] **Expand the analyte panel with cited ranges.** Add a `source` field to
   `ReferenceRange`, cite every range, and add high-value analytes (TSH/free T4,
   lipid panel, HbA1c, CBC differentials, zinc, copper, ferritin+CRP pairing).
4. [ ] **More interaction rules.** Calcium vs vitamin D, zinc vs copper ratio,
   B12 masking of folate deficiency, ferritin interpreted with CRP.
5. [ ] **Confidence model.** Down-weight assumed units and missing printed ranges;
   surface confidence drivers so the app can explain them.
6. [ ] **Engine HTTP service (FastAPI).** A thin `POST /analyze` wrapper over
   `pipeline.analyze` for the sidecar integration option (see checkpoint 2). Lives
   in `services/engine/` because it wraps engine internals.

### Nutrient dossier library (spans initiatives)

- [ ] Curated nutrient dossiers (CC BY 4.0) that back recommendations with
   citations. Shared with the Mental Health x Microbiome research agent. Design
   the dossier schema first, then populate.

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

1. [ ] `services/api` scaffold: `package.json`, `tsconfig`, ESLint/Prettier, `src/` layout
2. [ ] App bootstrap (Fastify), `GET /health`, structured logging, config via env
3. [ ] `docker-compose.yml` for local Postgres; `.env.example` for the API
4. [ ] Prisma schema + first migration: `users`, `scans`, `results`, `foods_cache`
5. [ ] Auth: signup/login, password hashing (argon2), JWT sessions, auth middleware

### Phase 2 — scan flow (depends on Phase 1 + the frozen contract)

Build against a **mocked** protocol response first; wire the real engine at
integration checkpoint 2.

6. [ ] `POST /scans`: accept multipart image, store the file, create a `scan` row (status `processing`)
7. [ ] Engine integration: call the engine and map its JSON to the response per `api-contract.md`
   (subprocess `python -m laboptimal_engine.pipeline --image <path>`, or HTTP to the FastAPI sidecar)
8. [ ] Persist the protocol to `results`; set status `complete` / `failed`
9. [ ] `GET /scans/:id` (protocol + status) and `GET /scans` (user's scans)
10. [ ] Request validation (schema), rate limiting, consistent error envelope
11. [ ] API integration tests (Vitest + supertest) against a mocked engine

### Phase 3 — mobile (depends on Phase 2 endpoints)

12. [ ] Expo app scaffold + navigation + auth screens
13. [ ] Camera / image picker screen
14. [ ] Upload flow: submit, then poll `GET /scans/:id` until `complete`
15. [ ] Results screen rendering `Protocol`: findings as cards colored by `status`,
    sorted by the order the engine returns (already ranked); foods grouped by
    `nutrient`; supplements with `form` + `notes`; citations footer; `warnings` banner
16. [ ] History screen (`GET /scans`)
17. [ ] Component tests

### Phase 4 — infra / CI (can start any time)

18. [ ] `.github/workflows/ci.yml`: engine `pytest` + API tests + lint on PR
19. [ ] Dockerfiles for `engine` and `api`

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

- **Claude**: (1) meal-plan module + contract update, (2) real USDA nutrient
  amounts, (3) cited range expansion with a `source` field.
- **Copilot**: (1) `services/api` scaffold + Fastify `GET /health`, (2)
  docker-compose Postgres + Prisma schema/migration, (3) auth. Build the scan
  flow against a mocked protocol; wire the real engine at checkpoint 2.

## References

- USDA FoodData Central API: https://fdc.nal.usda.gov/api-guide.html (free key)
- Live contract example: `cd services/engine && python -m laboptimal_engine.pipeline --demo`
- Engine invocation: `python -m laboptimal_engine.pipeline --image <path>` prints
  protocol JSON to stdout; or import `laboptimal_engine.pipeline.analyze(image_bytes)`.
