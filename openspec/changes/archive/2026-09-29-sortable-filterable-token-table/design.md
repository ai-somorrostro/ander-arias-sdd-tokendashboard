# Design

## Context

See proposal.md Why for motivation. Current state: `index.html` has a 2-row `thead` (group row + leaf row, 7 leaves) and an empty `tbody`; `app.js` fetches `./mock-data.json`, builds rows once via `buildRow()`, and appends in file order with no retained model state; `styles.css` is plain system-font styling with a horizontal-scroll wrapper. Constraints: vanilla HTML/CSS/JS only, no external assets, relative data path, no tests (user constraint); existing cost/TTFT/token formatting and load-error behavior must not regress.

## Goals / Non-Goals

**Goals:**
- Sortable leaf headers with predictable 2-state behavior and correct numeric vs. string ordering.
- Twofilter controls (name + single modality) with AND/OR semantics from the spec, applied live with sort preserved.
- 8-column table with Input/Output under Content, plus honest status/empty messaging and removal of helper copy.

**Non-Goals:**
- Multi-column sort, pagination, URL persistence of sort/filter state, or new data fields.
- Visual redesign beyond sort affordance, filter layout, and empty-state styling.
- Any change to `mock-data.json` shape or fetch path.

## Decisions

- **Retain models in memory and re-render on state change (over in-place DOM row sorting).** Keep the fetched array plus derived per-row values (costs, daily/weekly totals); `render()` = filter -> sort -> rebuild `tbody`. Rationale: 10 rows make rebuild trivially cheap; guarantees filter+sort composition and status count stay consistent. Alternative (sort existing `tr` nodes by cell text) rejected: it sorts formatted strings (`$2.19`, `5.30M`) and decouples filter state from row order.
- **Sort state `{ key, dir } | null`; click toggles, column switch resets to asc.** Keys map to raw fields: `name`, `costIn`, `costOut`, `ttft`, `inputModality`, `outputModality`, `daily`, `weekly`. Comparators: `Number` subtraction for the five numeric keys; `String.localeCompare` (or lowercased `<`/`>`) for the three text keys. Rationale: matches the agreed 2-state toggle exactly and avoids lexicographic bugs on money/token strings.
- **Leaf `th` becomes the control via a full-cell `<button>` with `aria-sort` on the `th` and an arrow `<span aria-hidden>`.** Only leaf `th`s are interactive; group `th`s (`Usage cost`, `Content`, `Usage`) stay inert. Rationale: resolves the two-row-header ambiguity, keeps keyboard/screen-reader behavior sane with native buttons. Alternative (click handler on `th` alone) rejected for a11y and focus styling.
- **Header restructure: `Content` becomes a `colspan=2` group over new `Input`/`Output` leaves; group row gains one cell, leaf row gains one cell.** Order: Model, Cost In, Cost Out, TTFT, Input, Output, Daily, Weekly. Rationale: mirrors the existing group pattern, gives each modality its own sortable column while keeping one shared filter.
- **Filter pipeline `models -> nameMatch AND modalityMatch -> sort -> render`.** Name: `name.toLowerCase().includes(query.trim().toLowerCase())`. Modality: `value === 'All' || input === value || output === value`. Events: `input` on text, `change` on select; controls in a `<div>` above `.table-wrapper` (outside horizontal scroll) with `<label>`s. Rationale: implements B-OR + AND from exploration; live events suit 10 rows without debounce.
- **Status + empty state reuse existing nodes plus one addition.** Update `#status` to `Showing X of N models` on every render; add a `<p id="empty" hidden>` or a single full-width `tr` for "no models match" (hidden when rows exist). Load-error path (`#error` + `Could not load`) untouched. Copy removal deletes the `Data:` code snippet node and the `.hint` paragraph only.
- **Styling stays additive.** Reuse `.numeric` alignment for the new Output/cost/TTFT/usage cells; add minimal rules for sort buttons (inherit font, left/right align per column), arrow spacing, filter row layout/wrapping, and empty message. No new fonts or assets.

## Risks / Trade-offs

- [Risk] Sorting formatted text instead of raw values (e.g. `$10` < `$2`) → Mitigation: comparators read numeric fields/totals computed before formatting; spec scenarios pin Phi-4-before-R1 ordering.
- [Risk] Single-modality OR confuses users expecting strict Input match (`Text` shows all 10 rows) → Mitigation: label the select `Modality (input or output)` and keep `All` default; accepted as more useful per exploration.
- [Risk] `Text+Image` under AND-with-name yields zero rows often → Mitigation: explicit empty-state message + `Showing 0 of N` so it reads as a result, not a bug.
- [Risk] Two-row header click targets unclear on touch/keyboard → Mitigation: full-cell buttons with visible focus and `aria-sort`; group headers non-interactive.
- [Trade-off] 2-state toggle has no one-click reset to file order → Accepted per user choice; clearing sort requires choosing an equivalent order manually (documented non-goal).

## Migration Plan

- Static front-end only: ship `index.html`/`app.js`/`styles.css` together; no data migration, no rollback beyond reverting the three files. `mock-data.json` untouched. Verify by loading over `python3 -m http.server`, exercising each header twice, each filter, the combined case, and the 404-missing-file error path.

## Open Questions

- None that would change specs, approach, or tasks. Minor polish (exact arrow glyph, exact empty-state wording, filter placeholder text) is left to implementation within the spec constraints.
