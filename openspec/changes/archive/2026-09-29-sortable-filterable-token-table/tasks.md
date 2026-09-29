# Tasks

## 1. Table structure and filter controls markup

- [x] 1.1 Restructure `thead` to 8 leaf columns with `Content` as `colspan=2` group over new `Input`/`Output` leaves and add a sort `<button>` plus arrow `<span>` inside each leaf `th`, then verify by loading the page over HTTP and confirming the header order Model, Cost In, Cost Out, TTFT, Input, Output, Daily, Weekly with 8 clickable leaf controls.
- [x] 1.2 Add the name text input and modality select (`All | Text | Text+Image`) with labels above `.table-wrapper`, add the empty-results node, remove the `Data: mock-data.json.` subtitle snippet and the `Serve over HTTP...` hint paragraph, then verify by loading the page and confirming controls are visible outside the scroll area and both helper copy strings are absent.

## 2. Sort, filter, and render behavior

- [x] 2.1 Retain fetched models in memory with derived values and implement `render()` as filter (name substring AND modality OR) then sort then rebuild `tbody`, updating `#status` to `Showing X of N models` and toggling the empty message, then verify by typing `kimi`, selecting `Text+Image`, combining both, and clearing them while watching row counts and the status line update.
- [x] 2.2 Implement 2-state sort state (`{key, dir}`), numeric comparators for Cost In/Out/TTFT/Daily/Weekly and case-insensitive string comparators for Model/Input/Output, header activation wiring (same column toggles, new column starts ascending), whole-row movement, and arrow/`aria-sort` indicator updates, then verify by clicking TTFT twice (Phi-4 first then DeepSeek-R1 first), clicking Model once for case-insensitive A-Z, and Cost Out once for Phi-4 before DeepSeek-R1.
- [x] 2.3 Preserve existing formatting and error behavior (cost/TTFT/token display, `title` totals, `#error` on fetch/parse failure) through the new render path, then verify by comparing a loaded row against current formatting and by blocking `mock-data.json` to confirm the load-error message still appears instead of an empty table.

## 3. Styling and end-to-end check

- [x] 3.1 Extend `styles.css` additively for sort buttons (inherit font, alignment per column, visible focus), arrow spacing, wrapping filter-row layout, and empty-state presentation with no external assets, then verify by tabbing through all headers, resizing to a narrow viewport, and confirming no horizontal breakage of controls and no new network requests beyond origin assets.
- [x] 3.2 Run the full manual pass over `python3 -m http.server` covering each header twice, each modality option, name queries `kimi`/`deep`/empty, the combined `deep`+`Text` case, the zero-match empty message, and the missing-data error path, then verify every spec scenario in `specs/token-dashboard/spec.md` behaves as written.
