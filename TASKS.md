# LabOptimal build plan: two-agent task split

Two AI agents work this repo in parallel: Claude (me) and GPT-5 via Copilot. The split is by **file and module boundary**, not just by difficulty, so we never edit the same file at the same time and never generate merge conflicts. Each lane has clear inputs and one shared integration surface: the two contract docs in `docs/`.

## Why this split

Claude takes the analytical core, the domain data model, the algorithms, and the contracts. That is where correctness, medical-domain reasoning, and cross-cutting design decisions dominate, and where a wrong call is expensive and hard to catch. GPT-5/Copilot takes the surrounding application scaffolding: Node CRUD, React Native UI, tests, migrations, and CI, where the patterns are well established and throughput matters more than novel reasoning.

Rule of the road: if you need to change something in the other lane's files, change the contract doc instead and let that lane pick it up.

---

## Claude lane (analytical core, contracts, docs)

Owns: `services/engine/**`, `docs/**`, `README.md`, `TASKS.md`

- [x] Monorepo layout and architecture
- [x] README with mermaid architecture, sequence, and detection diagrams
- [x] Python engine scaffold with numpy/pandas wired in
- [x] `requirements.txt` and `pyproject.toml`
- [x] `docs/api-contract.md`: the protocol JSON schema (engine output = API response body)
- [x] `docs/reference-ranges.md`: canonical analyte list + reference-range schema
- [ ] OCR provider interface (`ocr/base.py`) plus a Tesseract default and a cloud stub
- [ ] Lab parser: extract analyte, value, unit, reference range from OCR text
- [ ] Normalizer: canonical units and canonical analyte mapping
- [ ] Deficiency detector: reference-range comparison + interaction rules (ferritin vs inflammation, calcium vs vitamin D, etc.)
- [ ] Nutrient-to-food recommender using USDA FoodData Central
- [ ] Severity + confidence ranking
- [ ] Engine unit tests (pytest) for parser, normalizer, detector
- [ ] Golden-file tests: known lab image text in, expected protocol out

## Copilot / GPT-5 lane (API, mobile, infra)

Owns: `services/api/**`, `services/mobile/**`, `.github/**`, root infra config

Read `docs/api-contract.md` before starting the API. Read `docs/reference-ranges.md` if you build any results UI that labels analyte status. Do not edit `services/engine/**`.

### Node.js API (`services/api/`)
- [ ] `package.json`, TypeScript config, ESLint/Prettier
- [ ] Express (or Fastify) app bootstrap, health check
- [ ] PostgreSQL connection + migration tooling (Knex or Prisma)
- [ ] Migrations: `users`, `scans`, `results`, `foods_cache` tables
- [ ] Auth: signup/login, JWT sessions, password hashing
- [ ] `POST /scans`: accept multipart image, persist scan, enqueue analysis
- [ ] Engine integration: call the Python engine (subprocess or HTTP), map its JSON to the API response per `docs/api-contract.md`
- [ ] `GET /scans/:id`: return protocol JSON + status
- [ ] `GET /scans`: list a user's scans
- [ ] Error handling, request validation, rate limiting
- [ ] API integration tests (Jest/Vitest + supertest)

### React Native app (`services/mobile/`)
- [ ] App scaffold (Expo or bare RN), navigation
- [ ] Camera + image picker screen
- [ ] Upload flow with progress + processing state
- [ ] Results screen: deficiency cards, food suggestions, supplement list, citations
- [ ] History screen (past scans)
- [ ] Auth screens (login/signup)
- [ ] Component tests

### Infra
- [ ] `.github/workflows/ci.yml`: run engine pytest + API tests + lint on PR
- [ ] `docker-compose.yml` for local Postgres
- [ ] `.env.example` for API and engine
- [ ] Dockerfiles for engine and api

---

## Integration checkpoints

1. **Contract freeze**: once `docs/api-contract.md` lands, Copilot can build the API against a mocked engine response and Claude can build the engine to emit exactly that shape. No blocking either way.
2. **First end-to-end**: Copilot's `POST /scans` calls the real engine with a sample image; both lanes fix integration bugs against the contract, not each other's code.
3. **USDA wiring**: Claude owns the FoodData Central client; Copilot's API just passes through the engine's food results. USDA API key lives in the engine's env.

## Handy references for the Copilot lane

- USDA FoodData Central API: https://fdc.nal.usda.gov/api-guide.html (needs a free API key)
- The engine is invoked as `python -m laboptimal_engine.pipeline` and returns the protocol JSON on stdout, or is imported directly if the API runs a Python sidecar. Pick one in checkpoint 2.
