# Proposal

## Why

The team is evaluating multiple open-source language models and lacks a single, simple view comparing cost, speed, modality support, and real usage. A static, dependency-free dashboard table gives everyone the same numbers to compare without standing up any backend or tooling.

## What Changes

- Add a static token dashboard page rendered as a plain HTML table with no external libraries or frameworks (HTML + CSS + vanilla JavaScript only).
- Load model data from the existing `mock-data.json` in the repo root (10 models) and render one row per model.
- Display 7 columns:
  - Model name
  - Usage cost In ($ per million input tokens, derived as `inputPricePerToken * 1,000,000`)
  - Usage cost Out ($ per million output tokens, derived as `outputPricePerToken * 1,000,000`)
  - TTFT average in ms (`ttft_ms` as-is)
  - Content / input modality (`inputModality`, e.g. `Text`, `Text+Image`)
  - Daily usage, combined input + output tokens (`inputTokensDay + outputTokensDay`)
  - Weekly usage, combined input + output tokens (`inputTokensWeek + outputTokensWeek`)
- Format numbers for readability (2-decimal $/M costs, human-readable token totals such as `5.30M`, integer ms for TTFT).
- Ship as static files (`index.html`, `styles.css`, `app.js`) that work when served over HTTP alongside `mock-data.json`.

## Capabilities

### New Capabilities

- `token-dashboard`: static comparison table for evaluated language models showing per-million-token input/output cost, average TTFT, input modality, and combined daily/weekly token usage loaded from `mock-data.json`, built with dependency-free HTML/CSS/JS.

### Modified Capabilities

- None. Greenfield project with no existing specs (`openspec list --specs` returns empty).

## Impact

- New static frontend files in the repo root; no backend, build step, dependencies, or APIs.
- Reads the existing `mock-data.json` contract (field names listed above); any future change to that file's shape requires a dashboard update.
- Known constraint: `fetch('mock-data.json')` requires serving over HTTP (e.g. `python3 -m http.server`); opening via `file://` may be blocked by browser CORS. The 7-column table will need horizontal scroll on narrow screens.
