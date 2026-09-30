# token-dashboard Specification

## Purpose
Provide the team with a single static comparison table for evaluated language models covering cost, speed, modality, and usage without any backend or third-party dependencies.

## Requirements

### Requirement: Dashboard renders one row per model from mock data
The system SHALL render a table with one row per filtered model entry in `mock-data.json` and exactly 8 columns in this order: Model, Cost In ($/M), Cost Out ($/M), TTFT (ms), Input (input modality), Output (output modality), Daily usage (tokens), Weekly usage (tokens).

#### Scenario: All models listed
- **WHEN** the dashboard page loads with the provided `mock-data.json` containing 10 models and no filters active
- **THEN** the table body contains 10 rows, each showing the corresponding model name verbatim (e.g. `Llama 3.3 70B`, `DeepSeek-R1`, `Phi-4`).

#### Scenario: Column order and headers
- **WHEN** the dashboard page loads
- **THEN** the table header shows the 8 leaf columns in order: Model, Cost In, Cost Out, TTFT, Input, Output, Daily usage, Weekly usage (wording MAY vary but meaning and order SHALL match), with Input and Output grouped under a `Content` group header.

#### Scenario: Output modality visible
- **WHEN** a model has `outputModality` `Text`
- **THEN** the Output cell shows `Text` verbatim.

### Requirement: Usage cost displayed per million tokens
The system SHALL display input cost as `inputPricePerToken * 1,000,000` and output cost as `outputPricePerToken * 1,000,000`, each formatted as dollars per million tokens with 2 decimals (e.g. `$0.23`, `$2.19`).

#### Scenario: Cost derivation
- **WHEN** a model has `inputPricePerToken` 0.00000023 and `outputPricePerToken` 0.00000040
- **THEN** the row shows `$0.23` in Cost In and `$0.40` in Cost Out.

#### Scenario: High output-cost model
- **WHEN** a model has `outputPricePerToken` 0.00000219 (DeepSeek-R1)
- **THEN** the row shows `$2.19` in Cost Out.

### Requirement: TTFT and modality displayed as-is
The system SHALL display `ttft_ms` as an integer millisecond value (e.g. `320 ms`), `inputModality` verbatim in the Input column, and `outputModality` verbatim in the Output column (e.g. `Text`, `Text+Image`).

#### Scenario: TTFT and modality values
- **WHEN** a model has `ttft_ms` 890, `inputModality` `Text`, and `outputModality` `Text`
- **THEN** the row shows `890 ms` (or `890ms`), `Text` in Input, and `Text` in Output.

#### Scenario: Multimodal input model
- **WHEN** a model has `inputModality` `Text+Image` and `outputModality` `Text` (e.g. Mistral Small 3.1)
- **THEN** the row shows `Text+Image` in Input and `Text` in Output.

### Requirement: Usage combines input and output tokens
The system SHALL display Daily usage as `inputTokensDay + outputTokensDay` and Weekly usage as `inputTokensWeek + outputTokensWeek`, formatted in human-readable form (e.g. `5.30M` for 5,300,000; exact full numbers on title/hover or plain formatting is acceptable as long as the value is unambiguous).

#### Scenario: Combined daily usage
- **WHEN** a model has `inputTokensDay` 4200000 and `outputTokensDay` 1100000
- **THEN** Daily usage shows the equivalent of 5,300,000 tokens (e.g. `5.30M`).

#### Scenario: Combined weekly usage
- **WHEN** a model has `inputTokensWeek` 19400000 and `outputTokensWeek` 14600000
- **THEN** Weekly usage shows the equivalent of 34,000,000 tokens (e.g. `34.00M` or `34.0M`).

### Requirement: Dependency-free static page
The system SHALL be implemented with only HTML, CSS, and vanilla JavaScript and SHALL NOT load any external libraries, frameworks, fonts, or CDN assets. The page SHALL load its data from `./mock-data.json` via a relative path.

#### Scenario: No external requests
- **WHEN** the page loads with network inspection enabled
- **THEN** no requests are made to any host other than the serving origin (only the page assets and `mock-data.json` are fetched).

### Requirement: Data-load failure is communicated
The system SHALL display a visible error message in the page when `mock-data.json` cannot be loaded or parsed (e.g. HTTP error, invalid JSON), instead of showing an empty table with no explanation.

#### Scenario: Missing data file
- **WHEN** `mock-data.json` returns 404 or invalid JSON
- **THEN** the page shows a human-readable error message indicating the data could not be loaded.

### Requirement: Sortable columns with two-state toggle
The system SHALL make every leaf column header a sort control; the first activation on a column sorts ascending, the second sorts descending, and subsequent activations keep toggling between ascending and descending (2-state, no reset to file order). Activating a different column sorts by that column ascending. The active column SHALL show a visible direction indicator (simple arrow). Sorting SHALL compare underlying values, not formatted display text: numeric comparison for Cost In, Cost Out, TTFT, Daily usage, Weekly usage; case-insensitive string comparison for Model, Input modality, Output modality. Sorting SHALL move whole rows so each model's stats stay together, and SHALL apply to the currently filtered set.

#### Scenario: Sort by TTFT ascending finds fastest
- **WHEN** the user activates the TTFT header once
- **THEN** rows are ordered by `ttft_ms` ascending with Phi-4 (190 ms) first, and the TTFT header shows the ascending indicator.

#### Scenario: Second activation reverses order
- **WHEN** the user activates the same TTFT header a second time
- **THEN** rows are ordered by `ttft_ms` descending with DeepSeek-R1 (890 ms) first, and the header shows the descending indicator.

#### Scenario: Model name sort is case-insensitive
- **WHEN** the user activates the Model header once
- **THEN** rows are ordered alphabetically by `name` ignoring case (e.g. `deepseek-r1` and `DeepSeek-R1` sort identically).

#### Scenario: Cost sorts numerically
- **WHEN** the user activates the Cost Out header once
- **THEN** rows are ordered by `outputPricePerToken` numerically ascending (Phi-4 `$0.14` before DeepSeek-R1 `$2.19`), not alphabetically by the `$` string.

#### Scenario: Switching columns resets to ascending
- **WHEN** the user sorted by TTFT descending and then activates the Model header
- **THEN** rows are ordered by Model ascending.

### Requirement: Filter by model name and modality
The system SHALL provide a model-name text filter and a single modality select filter (`All | Text | Text+Image`). The name filter SHALL match case-insensitive substrings against `name` (empty input matches all). The modality filter SHALL keep a row when `inputModality == X OR outputModality == X` (`All` matches all). Both filters SHALL combine with AND, apply live as the user types or selects, and re-apply the active sort to the filtered view.

#### Scenario: Name substring filter
- **WHEN** the user types `kimi` in the name filter
- **THEN** only rows whose name contains `kimi` case-insensitively remain (e.g. `Kimi K2`).

#### Scenario: Modality OR filter
- **WHEN** the user selects `Text+Image` in the modality filter
- **THEN** only rows with `inputModality` `Text+Image` OR `outputModality` `Text+Image` remain (e.g. Mistral Small 3.1 and Gemma 3 27B with current data).

#### Scenario: Combined AND filters
- **WHEN** the user types `deep` and selects `Text`
- **THEN** only rows matching both remain (e.g. DeepSeek-V3 and DeepSeek-R1, each matching the name and having `Text` in input or output).

#### Scenario: Clearing filters restores full list
- **WHEN** the user clears the name input and sets modality to `All`
- **THEN** all models from `mock-data.json` are shown again in the active sort order.

### Requirement: Filtered status and empty results
The system SHALL show `Showing X of N models` in the status line whenever filters or sorts are applied (N is the total loaded, X the visible count), and SHALL show a visible "no models match" message in the table area when filters match zero rows. The existing load-error message behavior is unchanged.

#### Scenario: Filtered count
- **WHEN** 10 models load and the modality filter leaves 2 visible
- **THEN** the status line reads the equivalent of `Showing 2 of 10 models`.

#### Scenario: Empty filter result
- **WHEN** the combined filters match zero models
- **THEN** the table body shows no data rows and a visible message indicates no models match the current filters.

### Requirement: Helper copy removed
The system SHALL NOT render the `Data: mock-data.json.` snippet in the subtitle nor the `Serve over HTTP...` hint paragraph.

#### Scenario: Copy absent
- **WHEN** the dashboard page loads
- **THEN** neither the `Data: mock-data.json.` text nor the `Serve over HTTP` hint text is present in the page.

### Requirement: Combined chart section above table
The system SHALL render one combined chart section directly above the table (between the filters and the table area) showing one row per currently visible model with the model name, price comparison bars, and a usage-share bar.

#### Scenario: Chart rows match visible models
- **WHEN** the dashboard loads with 10 models and no filters active
- **THEN** the chart section shows 10 rows, one per model, each labeled with the model name verbatim.

#### Scenario: Chart placed above table
- **WHEN** the dashboard page loads
- **THEN** the chart section appears after the filter controls and before the table wrapper in reading/tab order.

### Requirement: Price comparison bars on shared linear scale
The system SHALL render per-model grouped horizontal bars for Cost In ($/M) and Cost Out ($/M) derived as `inputPricePerToken * 1,000,000` and `outputPricePerToken * 1,000,000`, scaled on a single shared linear scale across all visible models with value labels for both bars and a legend distinguishing In from Out.

#### Scenario: Outlier shown as-is
- **WHEN** DeepSeek-R1 has Cost Out `$2.19` while all other models are at or below `$0.60`
- **THEN** its Out bar extends proportionally further than every other bar on the same linear scale with no log transform, cap, or axis break, and its `$2.19` label remains visible.

#### Scenario: Small bars stay labeled
- **WHEN** a model has Cost In `$0.07` (Phi-4) alongside the `$2.19` maximum
- **THEN** its In bar renders proportionally small but its `$0.07` label is still displayed and readable outside or adjacent to the bar.

### Requirement: Usage-share bars with Daily/Weekly toggle
The system SHALL render per-model usage-share bars with a Daily | Weekly toggle control; Daily share SHALL equal `(inputTokensDay + outputTokensDay) / SUM over visible models of (inputTokensDay + outputTokensDay)`, Weekly share SHALL equal the equivalent with Week fields, each displayed as a proportional bar plus a percentage label and exact token count on title/hover, with the toggle defaulting to Daily.

#### Scenario: Daily share default
- **WHEN** the dashboard loads with no interaction
- **THEN** the toggle is set to Daily and each row shows that model's share of total visible daily tokens (e.g. the largest daily model shows the largest percentage).

#### Scenario: Toggle switches to weekly
- **WHEN** the user activates the Weekly toggle option
- **THEN** every usage-share bar and percentage recomputes from `inputTokensWeek + outputTokensWeek` over the visible set without changing table contents or order.

#### Scenario: Share totals to one hundred percent
- **WHEN** all 10 models are visible in Daily mode
- **THEN** the displayed percentages sum to 100% within rounding tolerance.

### Requirement: Charts follow filters and mirror table order
The system SHALL derive chart rows from the same filtered and sorted visible set as the table, in the identical row order, and SHALL re-render charts on every filter change, sort change, toggle change, and data load.

#### Scenario: Name filter narrows chart
- **WHEN** the user types `kimi` so only `Kimi K2` remains visible in the table
- **THEN** the chart section shows exactly one row for `Kimi K2` with its usage share at 100%.

#### Scenario: Sort mirrors table
- **WHEN** the user sorts the table by Cost Out ascending
- **THEN** chart rows appear in the same Cost Out ascending order as table rows (Phi-4 first, DeepSeek-R1 last).

### Requirement: Chart empty, error, and dependency-free behavior
The system SHALL show a visible "no models match" message in the chart section when filters match zero rows, SHALL show no chart rows and no misleading shares when `mock-data.json` fails to load (keeping the existing load-error message), SHALL keep charts dependency-free with native SVG only and no external libraries or CDN assets, SHALL NOT add automated tests, and SHALL expose each chart row's values as text or titles readable by assistive technology.

#### Scenario: Empty filter result in chart
- **WHEN** the combined filters match zero models
- **THEN** the chart section shows no model rows and a visible message indicating no models match the current filters.

#### Scenario: Load failure shows no chart data
- **WHEN** `mock-data.json` returns 404 or invalid JSON
- **THEN** the chart section shows no model rows or shares and the existing data-load error message remains visible.

#### Scenario: No external chart requests
- **WHEN** the page loads with network inspection enabled
- **THEN** chart rendering issues no requests beyond the serving origin (no Chart.js, fonts, or CDN fetches).

#### Scenario: Chart values available as text
- **WHEN** a screen reader or text-only inspection reads a chart row for Llama 3.3 70B
- **THEN** the model name, both `$`-per-M price values, and the active-period share percentage plus exact token total are available as text or title content.

### Requirement: Model row opens detail sidepanel
The system SHALL open a detail sidepanel for a model when the user activates that model's table row by click, and SHALL make each row keyboard-activatable (focusable with Enter/Space activation) so the panel is reachable without a pointer.

#### Scenario: Click opens panel for that model
- **WHEN** the user clicks the table row for `Phi-4`
- **THEN** a sidepanel appears showing details for `Phi-4` (name visible in the panel header).

#### Scenario: Keyboard opens panel
- **WHEN** a table row has keyboard focus and the user presses Enter or Space
- **THEN** the sidepanel opens for that row's model.

#### Scenario: Activating another row swaps content
- **WHEN** the sidepanel is open for one model and the user activates a different model row
- **THEN** the panel content updates to the newly activated model without requiring an explicit close first.

### Requirement: Sidepanel shows all model metrics including estimated spend
The system SHALL display in the sidepanel for the selected model: name, `inputModality`, `outputModality`, `ttft_ms` as integer ms, Cost In and Cost Out as `pricePerToken * 1,000,000` with 2 decimals, Out/In price ratio, Daily total (`inputTokensDay + outputTokensDay`) and Weekly total (`inputTokensWeek + outputTokensWeek`) in human-readable form with exact values on title/hover, daily-average-from-weekly (`weeklyTotal / 7`), day-vs-average delta, input-token share and output-token share for day and week, share of the currently visible total for day and week, and estimated spend per day and per week computed as `inputTokens * inputPricePerToken + outputTokens * outputPricePerToken` for the matching period, each spend value labeled as an estimate with its formula available as text or title.

#### Scenario: Full metrics for a model
- **WHEN** the sidepanel opens for Llama 3.3 70B
- **THEN** it shows `Llama 3.3 70B`, `Text`/`Text`, `320 ms`, `$0.23` In, `$0.40` Out, daily total equivalent of 5,300,000, weekly total equivalent of 36,600,000, input/output splits, visible shares, and estimated `$`-per-day and `$`-per-week values marked as estimates.

#### Scenario: Spend formula is disclosed
- **WHEN** the sidepanel shows an estimated spend value
- **THEN** the exact formula (`inputTokens * inputPricePerToken + outputTokens * outputPricePerToken`) is available as adjacent text or title content.

#### Scenario: Exact token counts available
- **WHEN** the sidepanel shows a human-readable total such as `5.30M`
- **THEN** the exact integer (e.g. `5300000`) is available on title/hover or as plain text.

### Requirement: Sidepanel shows per-model native-SVG graphs
The system SHALL render per-model graphs in the sidepanel using native SVG only (no external libraries), derived exclusively from existing `mock-data.json` fields plus the currently visible set: input-vs-output token split bars for day and for week, daily-total vs daily-average-from-weekly comparison, TTFT of this model vs fastest/median/slowest of the visible set, usage share of visible total, and cost-exposure (estimated spend) bars for day and week, each with value labels and text/title equivalents readable by assistive technology.

#### Scenario: Split graphs render from existing fields
- **WHEN** the sidepanel opens for a model with `inputTokensDay` 4200000 and `outputTokensDay` 1100000
- **THEN** the day-split graph shows input ~79% vs output ~21% with labeled values and no fetch beyond `mock-data.json`.

#### Scenario: TTFT context reflects visible set
- **WHEN** the sidepanel is open and the modality filter changes the visible set
- **THEN** the TTFT fastest/median/slowest markers and the usage-share denominator recompute from the currently visible models.

#### Scenario: Graphs available as text
- **WHEN** a screen reader or text-only inspection reads a per-model graph
- **THEN** the underlying values (splits, TTFT markers, share percentage, spend amounts) are available as text or title content.

### Requirement: Sidepanel is an overlay drawer with close and selection state
The system SHALL render the sidepanel as a right-docked overlay drawer that does not displace table layout, SHALL highlight the selected row and mark it `aria-selected="true"`, SHALL close on close-button activation, `Escape` key, and backdrop click, SHALL move focus into the panel on open and return focus to the activating row on close, and SHALL keep the panel open across filter, sort, and usage-toggle re-renders while its content refreshes for the selected model.

#### Scenario: Overlay does not reflow table
- **WHEN** the sidepanel opens
- **THEN** the table keeps its position and column widths (panel floats above content with a backdrop).

#### Scenario: Escape closes and restores focus
- **WHEN** the sidepanel is open and the user presses `Escape`
- **THEN** the panel closes and keyboard focus returns to the row that opened it.

#### Scenario: Selection survives re-sort
- **WHEN** the sidepanel is open for `Kimi K2` and the user sorts the table by TTFT
- **THEN** the panel stays open for `Kimi K2` and the highlight follows its new row position.

### Requirement: Sidepanel handles hidden selection, errors, and stays dependency-free
The system SHALL keep the sidepanel usable when its selected model is filtered out (showing a visible "outside current filters" notice while retaining the model's own metrics, with share/TTFT-context marked unavailable or computed against the visible set), SHALL show no sidepanel content and no misleading shares when `mock-data.json` fails to load (keeping the existing load-error message), SHALL render full-width (or near-full-width) on narrow viewports, SHALL NOT load external libraries, frameworks, fonts, or CDN assets, SHALL NOT change the `mock-data.json` schema, and SHALL NOT add automated tests.

#### Scenario: Selected model filtered out
- **WHEN** the sidepanel is open for `Kimi K2` and the user types a name filter that hides it
- **THEN** the panel shows a visible notice that the model is outside the current filters, keeps its own metrics visible, and does not present share/TTFT-context as if computed over the hidden model.

#### Scenario: Load failure keeps panel closed
- **WHEN** `mock-data.json` returns 404 or invalid JSON
- **THEN** no sidepanel opens (or any open panel shows no model data) and the existing data-load error message remains visible.

#### Scenario: Narrow viewport layout
- **WHEN** the viewport is 360px wide and the sidepanel opens
- **THEN** the panel occupies the full (or near-full) width rather than an unusable narrow drawer.

#### Scenario: No external requests
- **WHEN** the sidepanel opens with network inspection enabled
- **THEN** no requests are made beyond the serving origin.
