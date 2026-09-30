# Design

## Context

See `proposal.md` for motivation. Current state (`index.html`, `app.js`, `styles.css`, `mock-data.json` inspected during planning):

- `app.js:111 getVisibleModels()` returns the filtered + sorted set; `app.js:141 render()` wipes `tbody#models-body`, rebuilds rows via `buildRow()`, updates `status` and `empty` messaging.
- Filters (name substring + modality OR) and 2-state column sorts already combine in `getVisibleModels()`; table floor is `min-width: 960px` with `.table-wrapper` horizontal scroll.
- Price derivation (`inputPricePerToken * 1M`, 2 decimals) and usage totals (`inputTokensDay + outputTokensDay`, same for Week) plus `formatTokens()` already exist and are reused by specs in `specs/token-dashboard/spec.md`.
- Constraint: HTML/CSS/vanilla JS + native SVG only, data from `./mock-data.json` unchanged, no new fields, no tests (per explicit request).

## Goals / Non-Goals

**Goals:**
- One combined SVG chart section above the table that mirrors the table's visible set and order with zero new data fetching.
- Readable grouped price bars on a shared linear scale plus usage-share bars switchable Daily/Weekly, all re-rendering on filter/sort/toggle/load.
- Accessible, responsive, dependency-free rendering reusing existing formatters.

**Non-Goals:**
- Time-series sparklines or history synthesis (explicitly dropped in exploration; rank/share only).
- Log scales, axis breaks, or outlier capping; chart-specific sorting or interactions beyond the Daily/Weekly toggle (hover `title` only).
- Automated tests, build tooling, or data-schema migration.

## Decisions

1. **Single SVG, DOM-built, re-rendered per `render()`** — One `<svg id="charts-svg" role="img">` inside a new `<section id="charts">` (header + toggle + legend + svg + chart-empty note) placed between `.filters` and `.table-wrapper`. `render()` computes `visible` once, then calls `renderTable(visible)` (existing logic) and `renderCharts(visible)`. Toggle state lives in a module-level `usagePeriod = 'daily' | 'weekly'` (default `'daily'`) and only triggers re-render.
   - Alternative considered: per-row mini-SVGs or HTML-div bars — rejected: single SVG keeps one scale/legend, aligns rows trivially, and honors the explicit SVG choice; div bars would be easier CSS but abandon vector text/axis semantics the user asked for.
   - Alternative considered: Canvas — rejected during exploration for hand-rolled a11y/hit-testing cost at only ~30 shapes.

2. **Linear price scale keyed to the visible maximum** — `priceMax = max over visible of (costIn, costOut)`; bar length = `value / priceMax`, recomputed each render so filtering out DeepSeek-R1 rescales remaining bars to fill space. Value labels always rendered as SVG `<text>` placed after the bar end (never clipped inside tiny bars), so `$0.07` stays legible next to `$2.19`.
   - Alternative: global-max scale (stable across filters) — rejected: wastes most of the width whenever the outlier is filtered out.

3. **Usage share over the visible total** — `dailyTotal = SUM visible daily`, `share = model / total` (guard divide-by-zero → 0 rows + empty message). Percentage label with one decimal; exact token count via `<title>` and reusing `formatTokens()`. Toggle is a native `radiogroup` (Daily/Weekly), keyboard-operable, placed in the chart header.
   - Alternative: share of grand total — rejected: would show confusing sub-100% sums whenever filters are active, contradicting "charts follow filters".

4. **Mirror-order, no chart-local sort** — iterate the already-sorted `visible` array top-to-bottom for chart rows; no secondary ordering state. Row vertical slots are fixed-height bands (name + two price bars + usage bar), so table sort directly drives chart order.
   - Alternative: independent chart ordering — rejected: extra state + legend explanation for no requested benefit.

5. **Accessibility via native SVG semantics** — each row wrapped in `<g>` with `<title>` summarizing exact values; visible `<text>` for name, `$` values, and `%`; toggle as real radio inputs with `<fieldset>/<legend>`; chart container has `aria-label` and an `aria-live="polite"` count echo. No custom tooltip code.

6. **Responsive fallback** — SVG uses `viewBox` + `width: 100%; height: auto` so it shrinks; below ~640px allow horizontal scroll on the chart section (mirroring `.table-wrapper`) and truncate model names with `<title>` fallback rather than reflowing layout. New CSS variables reuse `--border`, `--header-bg` palette; In/Out/share get three distinct fills with a legend swatch.

## Risks / Trade-offs

- [Risk] `$2.19` outlier compresses all other price bars → Mitigation: labels outside bars + exact values in `<title>`; accepted as truthful per spec (no log scale).
- [Risk] SVG text measurement/overlap on narrow screens or long names (`Mistral Small 3.1`) → Mitigation: fixed left label column with ellipsis + full name in `<title>`; scroll fallback under 640px.
- [Risk] Percentage rounding not summing to exactly 100% → Mitigation: spec allows rounding tolerance; compute display from full-precision shares.
- [Risk] Empty (0 visible) and load-failure states rendering stale shares → Mitigation: `renderCharts()` early-returns on `visible.length === 0` or load error, clears SVG, shows chart-empty note; never divides by zero.
- [Risk] Scope creep toward axes/gridlines/tooltips → Mitigation: out of scope by Non-Goals; legend + value labels are the only annotations.

## Migration Plan

Static page, no deployment steps: ship updated `index.html`, `app.js`, `styles.css`; hard refresh picks it up. Rollback is reverting those three files. No data migration (`mock-data.json` untouched).

## Open Questions

- None blocking specs, approach, or tasks. Visual polish (exact bar hues, row height, label column width) is left to implementation within the existing palette.
