# Proposal

## Why

The token dashboard is a dense 10-row comparison table; relative input/output price gaps (notably the DeepSeek-R1 $2.19 output outlier) and each model's share of usage are hard to grasp from numbers alone. A compact native visualization above the table gives the team an at-a-glance comparison while keeping the page dependency-free.

## What Changes

- Add one combined native-SVG chart section directly above the table (between filters and table/status area).
- Render grouped horizontal bars per visible model comparing Cost In ($/M) vs Cost Out ($/M) on a shared linear scale; outlier values are shown as-is with no log scale or truncation.
- Render per-model usage-share bars (rank view, not time series) with a Daily | Weekly toggle; share = model daily (or weekly) total / visible-total for the active period.
- Charts derive from the same filtered + sorted `visible` set as the table and mirror table row order exactly; re-render on filter, sort, toggle, and data load.
- Show model names, value labels (readable even for tiny bars), legend for In/Out/share, chart title/count, and an empty-filter message mirroring the table's "no models match" behavior.
- Keep the page dependency-free (HTML/CSS/vanilla JS + inline SVG, no Chart.js or CDN); load data from `./mock-data.json` unchanged; no `mock-data.json` schema change; no tests added per request.

## Capabilities

### New Capabilities
- None — this extends the existing dashboard capability rather than introducing a standalone one.

### Modified Capabilities
- `token-dashboard`: add chart-visualization requirements (combined SVG section, price comparison bars, usage-share bars with Daily/Weekly toggle, filter/sort mirroring, accessibility labels, empty and error behavior).

## Impact

- Affected files: `index.html` (new chart section + toggle controls), `app.js` (chart render from visible models), `styles.css` (chart layout, bars, legend, responsive behavior).
- No API, backend, dependency, or data-contract changes; `mock-data.json` format unchanged.
- Risk areas: readability of tiny price bars next to the $2.19 outlier; SVG text/axis legibility on narrow screens (table already scrolls at 960px min-width); keeping chart accessible (titles, text equivalents) without libraries.
