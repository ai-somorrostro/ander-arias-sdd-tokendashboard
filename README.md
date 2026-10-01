# Token Dashboard

## 1. What it is

Token Dashboard is a static single-page app for comparing evaluated language models on cost, speed, modality, and usage. It renders one row per model entry in `mock-data.json` so the team can sort, filter, chart, and drill into per-model details without any backend.

## 2. Features

- **8-column comparison table** — Model, Cost In ($/M), Cost Out ($/M), TTFT (ms), Input modality, Output modality, Daily usage (tokens), Weekly usage (tokens), one row per model in `mock-data.json`.
- **Two-state sorting** — every leaf column header toggles ascending/descending with a visible arrow; numeric comparison for costs, TTFT, and usage, case-insensitive comparison for model and modality names.
- **Live filters** — model-name substring search plus modality select (`All | Text | Text+Image`, matching input OR output), combined with AND, with `Showing X of N models` status and a "no models match" empty state.
- **Price and usage-share charts** — grouped Cost In/Out bars on a shared scale plus Daily/Weekly usage-share bars with percentage labels, derived from the currently visible (filtered + sorted) set in the same row order.
- **Detail sidepanel** — click or Enter/Space on a row opens a right-docked drawer with modality, TTFT, Cost In/Out, Out/In ratio, daily/weekly totals, daily-average-from-weekly, deltas, token splits, visible-set shares, estimated spend with formulas, and native-SVG graphs; closes on close button, `Escape`, or backdrop click.

## 3. Tech

- Plain HTML (`index.html`), CSS (`styles.css`), and vanilla JavaScript (`app.js`) — no libraries, frameworks, fonts, or CDN assets.
- Data comes from `./mock-data.json` loaded over HTTP via a relative path. Opening the page with `file://` will fail to load data; serve it over HTTP (see below).
- Container preview uses `python:3-alpine` stdlib `http.server` only (local preview, not production hardening).

## 4. Project layout

```text
.
├── index.html      # page structure, table, filters, charts, sidepanel
├── app.js          # rendering, sorting, filtering, charts, sidepanel logic
├── styles.css      # styling
├── mock-data.json  # model data (name, prices per token, ttft_ms, modalities, day/week tokens)
├── Dockerfile      # containerized preview (python http.server on 8000)
├── .dockerignore   # keeps .git/, .opencode/, openspec/, metadata out of the image
└── README.md       # this file
```

## 5. Run locally without Docker

Requires Python 3.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

HTTP serving is required so `mock-data.json` loads correctly. If you change data, hard-refresh the browser to bypass cache.

## 6. Run with Docker

Requires Docker Engine.

```bash
docker build -t tokendashboard .
docker run -d -p 8000:8000 --name tokendashboard tokendashboard
```

Then open <http://localhost:8000>.

What this does: builds the `tokendashboard` image from the `Dockerfile` (`FROM python:3-alpine`, `WORKDIR /app`, `COPY . .`, `EXPOSE 8000`, `CMD ["python3", "-m", "http.server", "8000"]`) and starts it detached with container port 8000 mapped to host port 8000.

Useful checks:

```bash
docker ps
docker logs tokendashboard
```

## 7. Cleanup

Stop and remove the container:

```bash
docker stop tokendashboard
docker rm tokendashboard
```

Optionally remove the image:

```bash
docker rmi tokendashboard
```

Rerun / collision recovery:

- `docker: Error response ... Conflict. The container name "/tokendashboard" is already in use` means an old container still exists. Run `docker stop tokendashboard && docker rm tokendashboard`, then run the `docker run` command again.
- `port is already allocated` on `-p 8000:8000` means something else uses host port 8000. Stop it, or map a different host port, e.g. `docker run -d -p 8080:8000 --name tokendashboard tokendashboard` and open <http://localhost:8080>.
