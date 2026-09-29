# Spec Delta

## Purpose

Provide the team with a single static comparison table for evaluated language models covering cost, speed, modality, and usage without any backend or third-party dependencies.

## ADDED Requirements

### Requirement: Dashboard renders one row per model from mock data
The system SHALL render a table with one row per model entry in `mock-data.json` and exactly 7 columns in this order: Model, Cost In ($/M), Cost Out ($/M), TTFT (ms), Content (input modality), Daily usage (tokens), Weekly usage (tokens).

#### Scenario: All models listed
- **WHEN** the dashboard page loads with the provided `mock-data.json` containing 10 models
- **THEN** the table body contains 10 rows, each showing the corresponding model name verbatim (e.g. `Llama 3.3 70B`, `DeepSeek-R1`, `Phi-4`).

#### Scenario: Column order and headers
- **WHEN** the dashboard page loads
- **THEN** the table header shows the 7 columns in order: Model, Cost In, Cost Out, TTFT, Content, Daily usage, Weekly usage (wording MAY vary but meaning and order SHALL match).

### Requirement: Usage cost displayed per million tokens
The system SHALL display input cost as `inputPricePerToken * 1,000,000` and output cost as `outputPricePerToken * 1,000,000`, each formatted as dollars per million tokens with 2 decimals (e.g. `$0.23`, `$2.19`).

#### Scenario: Cost derivation
- **WHEN** a model has `inputPricePerToken` 0.00000023 and `outputPricePerToken` 0.00000040
- **THEN** the row shows `$0.23` in Cost In and `$0.40` in Cost Out.

#### Scenario: High output-cost model
- **WHEN** a model has `outputPricePerToken` 0.00000219 (DeepSeek-R1)
- **THEN** the row shows `$2.19` in Cost Out.

### Requirement: TTFT and modality displayed as-is
The system SHALL display `ttft_ms` as an integer millisecond value (e.g. `320 ms`) and `inputModality` verbatim (e.g. `Text`, `Text+Image`).

#### Scenario: TTFT and modality values
- **WHEN** a model has `ttft_ms` 890 and `inputModality` `Text`
- **THEN** the row shows `890 ms` (or `890ms`) and `Text` in the respective columns.

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
