# LabOptimal API (Copilot / GPT-5 lane)

Node.js REST API: auth, scan orchestration, persistence, and engine
integration. This service is owned by the Copilot lane. Do not edit
`services/engine/**`; integrate through `docs/api-contract.md`.

## What to build

See the checklist in `../../TASKS.md` under "Copilot / GPT-5 lane".

Summary:
- Express or Fastify app, TypeScript
- PostgreSQL with migrations (`users`, `scans`, `results`, `foods_cache`)
- Auth (JWT), password hashing
- `POST /scans` (multipart image) -> persist -> call engine -> store protocol
- `GET /scans/:id`, `GET /scans`
- Return the engine's `Protocol` verbatim per `docs/api-contract.md`

## Engine integration

Two options, decide at integration checkpoint 2 in TASKS.md:

1. Subprocess: `python -m laboptimal_engine.pipeline --image <path>` and read
   the protocol JSON from stdout.
2. Python sidecar service that exposes `analyze(image_bytes)` over HTTP.

## Contract

`docs/api-contract.md` is authoritative for request/response shapes. Build
against a mocked protocol response first; the real engine emits exactly that
shape (verify with `python -m laboptimal_engine.pipeline --demo`).
