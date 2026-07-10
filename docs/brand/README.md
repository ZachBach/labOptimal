# Brand and direction

This folder holds the implementation of `Direction Board.dc.html`, the Claude
Design working session that sets the visual direction for the open research
initiative and its flagship app, LabOptimal.

## Files

- `direction-board.html` — the board itself, implemented as a self-contained web
  page. It renders without the Claude Design runtime: the `<x-dc>` template
  wrapper and `support.js` are gone, the `<helmet>` block (fonts and base CSS) is
  lifted into `<head>`, and the `style-hover` attributes are compiled into real
  `:hover` rules. Open it in any browser. It pulls the three OFL fonts from
  Google Fonts, so it needs a network connection for exact type; without one it
  falls back to Georgia / system sans / system mono.
- `tokens.css` — the design system extracted as CSS custom properties: the
  umbrella palette and type scale, plus the LabOptimal sub-brand and its result
  status colors. This is the canonical token source for the site and app.

## What the board decides, and what is still open

The board puts four things on the table. Two are systems that are effectively
settled, and two are calls that are still yours to make.

Settled enough to build on:

- **Type.** Newsreader (editorial serif) over Public Sans (interface) with IBM
  Plex Mono for anything measured. All OFL, all contrast-checked.
- **Neutral system.** Warm archival paper and ink, with an accent that shifts by
  brand (ember for the umbrella, clinical green for LabOptimal).

Still open, and flagged for your decision:

- **Naming (n1..n6).** Six candidates for the umbrella name, which sits on top of
  Aurelius Dynamic as the parent company. The board marks **Groundwork (n1)** as
  the recommended lead, with Baseline (n2) as the strong alternate; Commons,
  First Kind, Provenance, and Assay round out the set. Nothing is locked. Name a
  tile in Claude Design to push, cut, or combine.
- **Identity temperature (v1..v3).** One system, three temperatures: **Field
  Notes (v1, recommended base)**, Instrument (v2, cooler and more schematic), and
  Almanac (v3, warmer and more public). `tokens.css` uses v1 as `:root`; the v2
  and v3 accent and neutral hues are recorded at the bottom of that file so a
  switch is a small change, not a rewrite.

LabOptimal keeps the umbrella family and dials it up: same neutrals and type,
ember swapped for a confident clinical green, data carrying the color.

## How this ties to the engine

The LabOptimal screens on the board are not arbitrary mockups. They render the
exact analytes and semantics the engine already produces: Vitamin D 18 ng/mL and
Ferritin 22 ng/mL flagged low, Magnesium on watch, and a plan of D3 + K2,
magnesium glycinate, and omega-3. The board's result status colors map one to one
to `Finding.status` in `services/engine`:

| Board label | Token             | Engine status            |
|-------------|-------------------|--------------------------|
| In range    | `--status-in-range` | `optimal`              |
| Watch       | `--status-watch`    | `suboptimal` / `elevated` |
| Low         | `--status-low`      | `deficient` / `high`   |

So the design and the analytical core already speak the same language.

## Consuming the tokens

- **Web (umbrella site, z4 on the board).** Link `tokens.css` and read the custom
  properties directly.
- **LabOptimal screens.** Add `data-brand="laboptimal"` on a wrapper (or `:root`
  of the app) to switch the accent and pull in the status tokens.
- **React Native (mobile lane).** CSS custom properties do not cross into RN, so
  derive a `tokens.ts` object from these values as the single source; keep the
  hex values identical to this file. That derivation is a Copilot-lane task.

## Regenerating the board

`direction-board.html` was generated from the source `.dc.html` by a mechanical
transform (lift the helmet, compile `style-hover`, strip the runtime wrapper). If
the source board changes in Claude Design, re-export it and re-run that transform
rather than hand-editing the HTML, so the two stay in sync.
