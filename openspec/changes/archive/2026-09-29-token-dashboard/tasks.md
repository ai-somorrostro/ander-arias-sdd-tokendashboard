# Tasks

## 1. Page markup and styles

- [x] 1.1 Create `index.html` with table skeleton (7-column thead with Cost/Usage grouping, empty tbody, error region, links to `styles.css` and `app.js`) and verify the file exists and references both assets.
- [x] 1.2 Create `styles.css` with table layout, header grouping styles, right-aligned numeric cells, and horizontal-scroll wrapper, and verify by opening the page over HTTP and confirming headers render and the table scrolls on narrow widths.

## 2. Data rendering

- [x] 2.1 Implement `app.js` data loading via `fetch('./mock-data.json')` with `textContent`-based row construction and a visible error message on fetch/parse failure, and verify by serving with `python3 -m http.server` and blocking/renaming the JSON to see the error message appear.
- [x] 2.2 Implement cost (`pricePerToken * 1e6` as `$X.XX`), combined usage (`in + out` per day/week formatted `X.XXM` with exact value in `title`), and TTFT/modality formatting, and verify all 10 rows against spec scenarios (Llama 3.3 70B `$0.23`/`$0.40`/`5.30M`, DeepSeek-R1 `$2.19`/`34.00M` weekly, Phi-4 `$0.07`).

## 3. Integration check

- [x] 3.1 Serve the root over HTTP and confirm 10 rows render in column order with no external network requests and graceful error on missing data, and verify via browser devtools network tab showing only same-origin requests.
