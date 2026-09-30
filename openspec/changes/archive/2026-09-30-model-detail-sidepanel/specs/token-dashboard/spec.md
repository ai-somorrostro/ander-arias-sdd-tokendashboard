# Spec Delta

## ADDED Requirements

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
