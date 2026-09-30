# Spec Delta

## ADDED Requirements

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
