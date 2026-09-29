# Proposal

## Why

The dashboard is currently a static table in file order with no way to compare models; users cannot answer "which model is fastest / cheapest" nor narrow the list by name or modality without scanning all rows manually.

## What Changes

- Make every leaf table header clickable to sort ascending on first click and descending on second click (2-state toggle), with a simple arrow indicator on the active column.
- Sort by underlying values: numeric comparison for Cost In, Cost Out, TTFT, Daily usage, Weekly usage; case-insensitive string comparison for Model, Input modality, Output modality.
- Add a live model-name text filter (case-insensitive substring) and a single modality select (`All | Text | Text+Image`) that keeps a row when `inputModality == X OR outputModality == X`; combine both filters with AND and re-apply the active sort to the filtered view.
- Split the `Content` column into `Input` and `Output` sub-columns under a `Content` group (**BREAKING**: leaf column count goes 7 -> 8; column order becomes Model, Cost In, Cost Out, TTFT, Input, Output, Daily usage, Weekly usage).
- Update the status line to `Showing X of N models` and show a visible "no models match" message on empty filter results (existing load-error behavior unchanged).
- Remove the `Data: mock-data.json.` snippet from the subtitle and the `Serve over HTTP...` hint paragraph.
- No external libraries, frameworks, fonts, or CDN assets; vanilla HTML/CSS/JS only, no tests (per user constraint).

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `token-dashboard`: table shape changes from 7 to 8 columns with visible output modality; adds sortable headers, name + modality filtering, filtered/empty status messaging, and removal of helper copy.

## Impact

- Affected files: `index.html` (header structure, filter controls, copy removal), `app.js` (sort/filter state, render from memory, comparators), `styles.css` (sortable header affordance, arrow, filter layout, empty-state styling).
- No API, backend, dependency, or data-format changes; `mock-data.json` is read as-is via the existing relative path.
- Existing 6 requirements stay valid except the 7-column requirement, which is superseded by the 8-column delta in this change.
