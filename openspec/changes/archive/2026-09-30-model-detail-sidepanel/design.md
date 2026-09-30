# Design

## Context

See proposal.md Why. Current state: `index.html` renders filters, an overview `#charts` SVG section, and a sortable 8-column `#models-table`; `app.js` holds module-level state (`allModels`, `sortKey`, `sortDir`, `nameQuery`, `modalityFilter`, `usagePeriod`) with `getVisibleModels()` + `render()` wiping `tbody` and re-rendering charts on every interaction, plus `svgEl`/`barWidth`/`format*` helpers. Constraints: vanilla HTML/CSS/JS only, relative `./mock-data.json`, no schema change, no tests (per spec and user scope).

## Goals / Non-Goals

**Goals:**
- Click/keyboard drill-down into one model without losing comparison context (overlay, row swap).
- Reuse existing helpers and state patterns so the panel feels native to the codebase.
- All panel numbers/graphs derived from current fields; spend shown as labeled estimate.

**Non-Goals:**
- No `mock-data.json` schema or data changes; no timeseries/sparklines (no source data).
- No routing/URL deep-linking, no panel-internal period toggle (panel shows both day and week), no automated tests.
- No virtualized table or chart-library migration.

## Decisions

1. **`<aside>` overlay drawer + backdrop (Layout A) over `<dialog>` or push layout.**
   Rationale: keeps table widths and `min-width: 960px` scroll intact; matches existing card aesthetic; full control over right-dock styling. Alternative `<dialog>` gives free Escape/focus but complicates side-dock styling and backdrop-row-click; push layout (B) would squeeze the table and force reflow. Backdrop click + explicit close button + `Escape` handler replicate dialog behavior with ~10 lines.

2. **Selection keyed by model `name`, stored as `selectedName` alongside existing module state.**
   Rationale: names are unique in current data and survive filter/sort reorder, unlike row index; fits the existing `getVisibleModels()` pattern — panel looks up `allModels.find(name)` for own metrics and `getVisibleModels()` for share/TTFT context. Alternative row-index breaks on any re-sort. Risk of duplicate names is negligible with 10 static entries; guard by first-match.

3. **Panel re-renders inside existing `render()` (table + charts + panel).**
   Rationale: guarantees share/TTFT-context never goes stale when filters/sort/toggle change; panel render is a pure function of `(selectedModel, visibleSet)`. Must preserve panel DOM focus: only update panel content nodes, never rebuild the focused container mid-typing; skip panel focus moves on background re-renders (focus moves only on explicit open/close).

4. **Per-model SVGs reuse `svgEl`, `barWidth`, `formatCostPerM`, `formatTokens`.**
   Rationale: zero new patterns; small single-model bar groups (split, day-vs-avg, TTFT marker strip, share, spend) mirror overview chart code at smaller scale. Each graph gets `<title>` + adjacent text values per accessibility requirement. No axes library — linear widths only, same as overview.

5. **Estimated spend = `inputTokens*inputPrice + outputTokens*outputPrice` per period, always labeled "est." with formula in text/title.**
   Rationale: most valuable new insight available without new data; explicit estimate labeling (per spec) avoids implying billed totals. Computed inline at render; formatted as `$X.XX`. Example Llama 3.3 70B day: `4.2M*0.23/M + 1.1M*0.40/M ≈ $1.41`.

6. **Accessibility: rows become `tabindex="0"` + `aria-selected`, panel uses `role="dialog" aria-modal="false" aria-label="<name>"`, labelled close button.**
   Rationale: `aria-modal="false"` is honest (background stays visible/interactive for row-swap); focus into panel heading/close on open, back to row on close. `Escape` listener active only when open. Alternative full modal trap would block row-swap, defeating the purpose.

7. **Responsive: fixed right drawer ~360-400px on desktop; `@media (max-width: 640px)` full-width sheet.**
   Rationale: mirrors existing `640px` chart scroll breakpoint; avoids unusable sliver on phones.

## Risks / Trade-offs

- [Stale share context] Visible-total denominator changes on every keystroke → Mitigation: panel share/TTFT blocks always read live `getVisibleModels()` inside `render()`.
- [Focus loss on re-render] Rebuilding `tbody` drops row focus while panel open → Mitigation: after `render()`, if `selectedName` still visible, restore highlight; only move focus on explicit open/close, never on filter keystrokes.
- [Spend misread as invoice] Estimate could be mistaken for billed cost → Mitigation: "est." prefix + formula text/title + design non-goal of no invoice language.
- [Long model names overflow narrow drawer] → Mitigation: ellipsis + `title` full name, SVG text truncation consistent with overview `.chart-name`.
- [Backdrop blocks overview chart hover while open] → Accept: backdrop is click-to-close by spec; row-swap clicks pass through rows above backdrop layering (rows remain clickable, backdrop sits below panel but above page with row click handlers still reachable — implement via panel+backdrop sibling ordering and row `click` delegation).

## Migration Plan

None — static page, no deployment steps. Rollback is revert of `index.html`/`styles.css`/`app.js` edits. No data migration (`mock-data.json` untouched).

## Open Questions

None — timeseries and deep-linking explicitly deferred as non-goals; all spec-affecting choices resolved above.
