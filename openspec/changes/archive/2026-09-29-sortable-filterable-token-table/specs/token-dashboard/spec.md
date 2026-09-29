# Spec Delta

## MODIFIED Requirements

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

### Requirement: TTFT and modality displayed as-is
The system SHALL display `ttft_ms` as an integer millisecond value (e.g. `320 ms`), `inputModality` verbatim in the Input column, and `outputModality` verbatim in the Output column (e.g. `Text`, `Text+Image`).

#### Scenario: TTFT and modality values
- **WHEN** a model has `ttft_ms` 890, `inputModality` `Text`, and `outputModality` `Text`
- **THEN** the row shows `890 ms` (or `890ms`), `Text` in Input, and `Text` in Output.

#### Scenario: Multimodal input model
- **WHEN** a model has `inputModality` `Text+Image` and `outputModality` `Text` (e.g. Mistral Small 3.1)
- **THEN** the row shows `Text+Image` in Input and `Text` in Output.

## ADDED Requirements

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
