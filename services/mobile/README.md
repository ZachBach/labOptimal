# LabOptimal mobile

The LabOptimal flagship app, Expo + React Native + TypeScript. The screens and
components here implement zone 03 of the Direction Board (`docs/brand/direction-board.html`)
using the LabOptimal design tokens (`docs/brand/tokens.css`, ported to
`src/theme/tokens.ts`).

## Run

```bash
cd services/mobile
npm install
npx expo start        # then press i / a / w for iOS, Android, or web
```

The three brand fonts (Newsreader, Public Sans, IBM Plex Mono) load at runtime
via `@expo-google-fonts`; the app holds rendering until they are ready.

## What is here, and the lane split

This is the **presentational layer**, built by the Claude lane because it owns
design fidelity. Everything renders the design faithfully, is typed against the
engine's `Protocol` contract, and runs on sample data.

The **Copilot lane** wires it to reality. The boundary:

| Built here (presentational) | Wired by the app lane |
|-----------------------------|-----------------------|
| Screens and components matching the board | Real navigation (react-navigation) replacing the preview shell in `App.tsx` |
| `Protocol` types mirroring `docs/api-contract.md` | Fetching a real protocol from the API and polling scan status |
| Sample view-model data (`src/data/sample.ts`) | Camera / file upload (`expo-camera`, `expo-document-picker`) behind the Upload screen |
| Design tokens, fonts, range/trend/status widgets | Auth, secure storage, and the results/history plumbing |

`App.tsx` contains a deliberately minimal tab-plus-overlay shell so the screens
can be exercised as a running app. It is a placeholder, not the intended
navigation architecture. Replace it, do not build on it.

## Structure

```
App.tsx                 preview shell: loads fonts, tabs, pushable detail screens
src/
  theme/
    tokens.ts            colors, type, radius, spacing, shadow (from tokens.css)
    useAppFonts.ts       @expo-google-fonts loader hook
  types/
    protocol.ts          Protocol / Finding / etc. mirror of the engine contract
  data/
    sample.ts            sample view models mirroring the board
  components/
    Text.tsx             Display / Heading / Body / Label / Mono primitives
    Card.tsx             cream and green surface cards
    Icon.tsx             feather-style icon set (react-native-svg)
    RangeBar.tsx         deficient / optimal / high bar with a status dot
    MarkerRow.tsx        marker line: name, value, range bar, status pill
    StatusPill.tsx       low / watch / in range / priority chip
    SummaryBar.tsx       home overall segmented bar + legend
    TrendBars.tsx        12-month trend chart
    Chip.tsx             category / plan / timing chips
    Button.tsx           primary (green) and secondary (outline) buttons
    ScreenHeader.tsx     back chevron + serif title + subtitle
    Avatar.tsx           initials circle
    TabBar.tsx           bottom tab bar (presentational)
  screens/
    HomeScreen.tsx       status at a glance, scan CTA, needs-attention list
    UploadScreen.tsx     capture / import, privacy note, parse progress
    DeficiencyScreen.tsx priority finding, ranked list, plan card
    PlanScreen.tsx       supplements and this week's meals
    MarkerScreen.tsx     one marker: current, trend, effects, dossier link
    LibraryScreen.tsx    nutrient dossier library
```

## The real engine (wired)

Scanning calls the engine over HTTP. The flow: Upload picks an image
(`expo-image-picker`) → `ScanContext.startScan(uri)` POSTs it to the engine
service (`services/engine/service.py`, `POST /analyze`) → `src/api/mapProtocol.ts`
maps the returned `Protocol` onto the screen view models. If the engine is
unreachable, it falls back to `src/data/sample.ts` so the app still completes.

Run both sides:

```bash
# 1. Engine service (in services/engine, with the venv active)
pip install -e ".[service]" && laboptimal-engine-serve      # :8000

# 2. Mobile, pointed at your machine's LAN IP so a phone can reach it
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:8000 npm start
```

On web dev the default `http://localhost:8000` works. `src/api/` holds the client,
config, and the `protocolToResults` mapper; `bucketForStatus` (in
`src/types/protocol.ts`) collapses the engine's five-way `Finding.status` into the
UI's in-range / watch / low. Keep the token hex values in `src/theme/tokens.ts`
identical to `docs/brand/tokens.css`.
