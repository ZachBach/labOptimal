# LabOptimal

Snap a photo of your lab results, get back deficiency detection, supplement recommendations, and meal plans grounded in the USDA FoodData Central database.

LabOptimal is open source by design. Code is MIT, curated nutrient dossiers are CC BY 4.0. The goal is to make personalized nutritional analysis auditable, reproducible, and free to build on.

## What it does

1. You photograph a lab panel (CBC, CMP, micronutrient panel, etc.).
2. OCR extracts the raw text.
3. The engine parses analytes, values, units, and reference ranges out of that text.
4. Values are normalized to canonical units and mapped to canonical analytes.
5. Deficiency detection compares each value against reference ranges and applies interaction-aware rules.
6. Detected deficiencies are mapped to nutrients, then to foods (USDA FoodData Central) and supplement options.
7. You get a structured protocol: what you are low on, what to eat, what to supplement, and why, with citations.

## Architecture

LabOptimal is a polyglot monorepo with three services that talk over well-defined contracts. The split lets a Python data/science core do the analytical work while a Node service owns orchestration and persistence and a React Native app owns capture and display.

```mermaid
graph TD
    subgraph Client
        RN["React Native App<br/>camera, upload, results UI"]
    end

    subgraph Backend
        API["Node.js API<br/>auth, orchestration, persistence"]
        PG[("PostgreSQL<br/>users, scans, results")]
    end

    subgraph AnalyticalCore["Python Engine (numpy / pandas)"]
        OCR["OCR Provider<br/>Tesseract / cloud pluggable"]
        PARSE["Lab Parser<br/>analyte + value + unit + range"]
        NORM["Normalizer<br/>canonical units & analytes"]
        DEF["Deficiency Detector<br/>reference ranges + interaction rules"]
        REC["Recommender<br/>nutrients to foods & supplements"]
    end

    subgraph External
        USDA["USDA FoodData Central API"]
    end

    RN -->|"POST /scans (image)"| API
    API -->|"analyze(image)"| OCR
    OCR --> PARSE --> NORM --> DEF --> REC
    REC -->|"nutrient lookups"| USDA
    REC -->|"structured protocol"| API
    API --> PG
    API -->|"protocol JSON"| RN
```

### Request lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant RN as React Native
    participant API as Node API
    participant ENG as Python Engine
    participant USDA as USDA FDC

    U->>RN: Snap lab photo
    RN->>API: POST /scans (multipart image)
    API->>API: Persist scan record (status: processing)
    API->>ENG: analyze(image_bytes)
    ENG->>ENG: OCR to text
    ENG->>ENG: Parse analytes + values + ranges
    ENG->>ENG: Normalize units and analytes
    ENG->>ENG: Detect deficiencies (numpy/pandas)
    ENG->>USDA: Query foods for target nutrients
    USDA-->>ENG: Food + nutrient rows
    ENG-->>API: Structured protocol JSON
    API->>API: Persist results (status: complete)
    API-->>RN: Protocol JSON
    RN-->>U: Deficiencies, foods, supplements, citations
```

### Deficiency detection flow

```mermaid
flowchart LR
    A["Normalized analyte value"] --> B{"In reference range?"}
    B -->|"Above"| C["Flag: elevated"]
    B -->|"Within"| D{"In optimal sub-range?"}
    B -->|"Below"| E["Flag: deficient"]
    D -->|"Yes"| F["Status: optimal"]
    D -->|"No"| G["Flag: suboptimal"]
    E --> H["Apply interaction rules<br/>(e.g. ferritin vs inflammation,<br/>calcium vs vitamin D)"]
    G --> H
    H --> I["Map to nutrient targets"]
    I --> J["Rank by severity + confidence"]
```

## Monorepo layout

```
labOptimal/
  services/
    engine/            Python analytical core (OCR, parsing, detection, recommender)
      src/laboptimal_engine/
      tests/
      requirements.txt
      pyproject.toml
    api/               Node.js REST API + PostgreSQL (Copilot lane)
    mobile/            React Native app (Copilot lane)
  docs/
    api-contract.md    Shared contract between engine, api, and mobile
    reference-ranges.md
  TASKS.md             Task split: Claude lane vs Copilot/GPT-5 lane
  README.md
```

## Contracts first

The three services integrate through two documents so the two build lanes can proceed in parallel without stepping on each other:

- `docs/api-contract.md` defines the JSON the engine returns and the API exposes.
- `docs/reference-ranges.md` defines the canonical analytes and reference-range schema the detector consumes.

Change a contract, and both lanes get the update in one place.

## Getting started (engine)

```bash
cd services/engine
py -m venv .venv
source .venv/Scripts/activate      # Windows Git Bash
pip install -e ".[dev]"            # editable install puts the package on the path
python -m laboptimal_engine.pipeline --demo
pytest
```

## License

- Code: MIT
- Nutrient dossiers and curated content: CC BY 4.0
- Hardware designs (elsewhere in the initiative): CERN OHL
