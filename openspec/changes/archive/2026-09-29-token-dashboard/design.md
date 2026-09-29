# Design

## Context

Greenfield static page. Repo root currently contains only `mock-data.json` (array of 10 model objects with `name`, `inputPricePerToken`, `outputPricePerToken`, `ttft_ms`, `inputModality`, `outputModality`, `inputTokensDay/Week`, `outputTokensDay/Week`), plus `openspec/` and `.opencode/`. No build tooling, no dependencies, no server. See `proposal.md` for motivation and `specs/token-dashboard/spec.md` for behavior contract.

## Goals / Non-Goals

**Goals:**
- Render the 7-column table (Model, Cost In, Cost Out, TTFT, Content, Daily, Weekly) from `mock-data.json` with vanilla JS.
- Keep everything dependency-free and viewable via any static HTTP server.

**Non-Goals:**
- Sorting, filtering, search, pagination, or charts (static table only per agreed scope).
- Splitting usage back into input/output sub-columns; combined totals only.
- Showing `outputModality` (all rows are `Text` today) or per-request/per-day cost rollups.
- Build steps, package managers, or test frameworks.

## Decisions

- **File layout: `index.html` + `styles.css` + `app.js` in repo root next to `mock-data.json`.**
  - Rationale: smallest shape that honors "only HTML, CSS and Javascript"; separate files keep concerns clean without tooling.
  - Alternative considered: single `index.html` with inline `<style>`/`<script>` — rejected because separate files are easier to review and still zero-dependency.
- **Load via `fetch('./mock-data.json')` on `DOMContentLoaded`, build rows with DOM APIs (`createElement`/`textContent`), no `innerHTML` templating.**
  - Rationale: relative path works from any static server root; `textContent` avoids HTML-injection issues from model names.
  - Alternative considered: inlining data into JS — rejected because the user owns `mock-data.json` as the data contract and wants the page to read it.
- **Derive in JS: `costPerM = pricePerToken * 1e6` formatted `$X.XX`; `daily = in_day + out_day`, `weekly = in_week + out_week` formatted as `X.XXM` (with `K` fallback under 1M); TTFT as `${ttft_ms} ms`.**
  - Rationale: keeps JSON as raw source of truth; formatting lives in two small pure functions that are trivially verifiable against the spec scenarios.
  - Alternative considered: precomputing in JSON — rejected, duplicates source data.
- **Table semantics: `<table>` with `<thead>` (two-level header grouping Cost + Usage via `colspan`) and `<tbody>`; numeric cells right-aligned via CSS; horizontal scroll wrapper (`overflow-x: auto`) for narrow screens.**
  - Rationale: accessible, semantic, and handles the 7-column width without media-query complexity.
- **Failure path: catch fetch/parse errors and render a visible error row/message region.**
  - Rationale: satisfies the load-failure requirement with no framework.

## Risks / Trade-offs

- [Risk] `fetch` blocked under `file://` (browser CORS) → Mitigation: document `python3 -m http.server` as the run method; keep path relative.
- [Risk] Future `mock-data.json` field renames break rendering → Mitigation: fail visibly (error message) rather than silently rendering zeros; field list pinned in spec.
- [Risk] Wide table on mobile → Mitigation: horizontal scroll wrapper accepted as trade-off for static scope; no responsive column-hiding (would change spec).
- [Risk] Large-number readability (e.g. `34200000` vs `34.20M`) → Mitigation: `M/K` formatter with exact value in `title` attribute.

## Migration Plan

No migration. New files only; nothing existing to move. Rollback = delete the three new files.

## Open Questions

None. All scope decisions (combined daily/weekly usage, 2 cost columns, static-only) were confirmed during exploration.
