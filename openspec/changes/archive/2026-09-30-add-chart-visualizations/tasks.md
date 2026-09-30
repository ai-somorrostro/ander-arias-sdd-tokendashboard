# Tasks

## 1. Chart section markup and styles

- [x] 1.1 Add chart section skeleton in `index.html` between filters and table (section header with title/count, Daily/Weekly radiogroup defaulting to Daily, legend for In/Out/share, empty-note element, single `<svg>` with `role="img"`) and verify the section renders in order above the table on page load with no console errors.
- [x] 1.2 Add chart styles in `styles.css` reusing existing palette variables (section card, legend swatches, toggle layout, SVG `width:100%;height:auto`, narrow-screen horizontal scroll fallback) and verify layout matches table width on desktop and scrolls without overlap at 640px width by resizing.

## 2. SVG chart rendering

- [x] 2.1 Implement price helpers plus visible-max linear scale in `app.js` (reuse `formatCostPerM`; compute `priceMax` over visible Cost In/Out) and verify DeepSeek-R1 `$2.19` Out bar is longest while Phi-4 `$0.07` label remains visible outside its bar with 10 models loaded.
- [x] 2.2 Implement `renderCharts(visible)` building one grouped row per model (name text, In/Out rects + value labels, usage-share rect + percentage, `<title>` with exact values) in table order and verify 10 labeled rows appear above the table matching table order on initial load.
- [x] 2.3 Implement usage-share computation with `usagePeriod` state (`daily` default; share = model total / visible total, zero-guard) reusing `formatTokens()` for hover titles and verify Daily percentages sum to 100% within rounding and each row shows exact tokens on hover.

## 3. Wiring and behavior parity

- [x] 3.1 Wire Daily/Weekly toggle and `render()` integration (`render()` calls `renderCharts(visible)` after table render; toggle change re-renders charts only from the same visible set) and verify switching to Weekly recomputes all share bars without altering table rows or order.
- [x] 3.2 Wire filter/sort mirroring plus empty and load-error states (charts derive from `getVisibleModels()`; zero-visible clears SVG and shows chart empty message; load failure clears SVG and keeps error message with no shares) and verify typing `kimi` leaves one 100% chart row, sorting Cost Out ascending puts Phi-4 first in both chart and table, an impossible filter shows both empty messages, and blocking `mock-data.json` shows the error with no chart rows.
- [x] 3.3 Final visual and accessibility pass (keyboard reachability of toggle and sort controls, screen-reader text/titles per row, legend accuracy, `Showing X of N` consistency between chart header and status line, no external network requests for chart assets, no test files added) and verify by keyboard-only toggle/sort run plus network-inspector page load showing only origin requests.
