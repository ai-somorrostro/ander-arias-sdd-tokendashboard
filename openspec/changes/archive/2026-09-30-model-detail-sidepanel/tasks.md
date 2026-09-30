# Tasks

## 1. Panel shell and styles

- [x] 1.1 Add sidepanel `<aside>` + backdrop markup to `index.html` (dialog semantics, close button, sections for metrics and graphs) and verify the panel is hidden on load with no layout shift in the table.
- [x] 1.2 Add drawer/backdrop/highlight/responsive styles to `styles.css` (right-docked overlay ~360-400px, full-width under 640px, selected-row highlight, focus-visible states) and verify by opening the page at desktop and 360px widths with no external requests.

## 2. Selection and open/close behavior

- [x] 2.1 Add `selectedName` state, row click + Enter/Space activation, `aria-selected` highlight, and focus-into-panel on open / focus-return on close in `app.js`, and verify clicking `Phi-4` opens its panel and `Escape` closes it returning focus to the row.
- [x] 2.2 Implement close-button, backdrop-click, row-swap (second row updates content), and selection persistence across `render()` re-sorts/filters, and verify row-swap works and selection follows `Kimi K2` after a TTFT sort.

## 3. Derived metrics including spend estimates

- [x] 3.1 Implement panel metrics render (name, modalities, TTFT, Cost In/Out, Out/In ratio, daily/weekly totals with exact titles, daily-avg-from-weekly, day-vs-avg delta, in/out splits, visible shares, est. $/day + $/week with "est." label and formula text/title) reusing `format*` helpers, and verify Llama 3.3 70B shows `$0.23`/`$0.40`, `5.30M`/`36.60M`, and labeled spend estimates.
- [x] 3.2 Handle filtered-out selection (visible "outside current filters" notice, own metrics retained, share/TTFT-context marked unavailable) and load-failure (no panel data, existing error kept), and verify by filtering away the selected model and by blocking `mock-data.json`.

## 4. Per-model native-SVG graphs

- [x] 4.1 Render in/out split bars (day + week) and day-vs-average comparison with `svgEl`/`barWidth` plus text/title values, and verify Phi-4-scale small bars stay labeled and values match the metrics section.
- [x] 4.2 Render TTFT-vs-visible (fastest/median/slowest markers), usage-share-of-visible, and cost-exposure (est. spend day/week) bars with labels and titles, and verify markers recompute after a modality filter change.

## 5. Integration check

- [x] 5.1 Verify end-to-end by serving over HTTP: load with 10 models, open a row, sort, filter to one model, toggle Daily/Weekly, close via all three methods, and confirm no console errors, no external requests, no `mock-data.json` changes, and no test files added.
