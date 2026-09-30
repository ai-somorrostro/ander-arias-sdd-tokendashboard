# Proposal

## Why

The dashboard only offers a cross-model comparison (table + overview charts). Users cannot drill into a single model to see all of its metrics and per-model graphs in one place. A click-to-open extended view makes per-model inspection possible without leaving the comparison context.

## What Changes

- Clicking (or keyboard-activating) a model row opens a right-docked overlay sidepanel with that model's extended detail view; main content stays in place behind it.
- Panel shows all model metrics: name, input/output modalities, TTFT, Cost In/Out ($/M), Out/In ratio, daily total + weekly total, daily-average-from-weekly, input-vs-output splits, share of visible total, and estimated spend ($/day, $/week) labeled as estimates with formula.
- Panel shows per-model native-SVG graphs specific to that model: input-vs-output split (day + week), day-vs-week-average comparison, TTFT vs visible fastest/median/slowest, usage share of visible total, cost-exposure bars — all derived from existing `mock-data.json` fields only.
- Panel supports close via close button, `Escape`, and backdrop click; clicking another row swaps panel content; selected row is visually highlighted and marked `aria-selected`.
- Panel is keyboard accessible (`dialog`-like semantics, focus moves in on open and returns on close), exposes all values as text/titles, and goes full-width on narrow viewports.
- No new fields in `mock-data.json`; no external libraries, fonts, or CDN assets; no automated tests.

## Capabilities

### New Capabilities

None — this extends the existing dashboard capability.

### Modified Capabilities

- `token-dashboard`: add per-model detail sidepanel (open/close/selection, derived metrics incl. estimated spend, per-model native-SVG graphs, accessibility and responsive behavior).

## Impact

- `index.html`: sidepanel container + backdrop markup, row focusability/selection hooks.
- `app.js`: selection state, panel render, per-model SVG graphs, derived math (totals, splits, shares, spend estimates, TTFT context), open/close/focus wiring, re-render integration with existing filters/sort/toggle.
- `styles.css`: drawer layout, backdrop, highlight, responsive full-width fallback.
- No change to `mock-data.json` schema or data; no new dependencies; no test infrastructure.
