# Proposal

## Why

The dashboard is a static site that must be served over HTTP to load `./mock-data.json` (file:// fails), but the repo has no Dockerfile, no README, and no documented way to run it. Contributors currently guess how to serve it.

## What Changes

- Add `Dockerfile` with exact content:
  - `FROM python:3-alpine`, `WORKDIR /app`, `COPY . .`, `EXPOSE 8000`, `CMD ["python3", "-m", "http.server", "8000"]`
- Add `.dockerignore` to keep build context lean (exclude `.git/`, `.opencode/`, `openspec/`, `*.Zone.Identifier`, OS artifacts) without changing the Dockerfile's `COPY . .` semantics.
- Add complete `README.md` following the agreed 7-section outline:
  1. What it is, 2. Features, 3. Tech, 4. Project layout, 5. Run locally without Docker, 6. Run with Docker, 7. Cleanup.
- Document Docker lifecycle: `docker build -t tokendashboard .`, `docker run -d -p 8000:8000 --name tokendashboard tokendashboard`, open `http://localhost:8000`, plus `stop` / `rm` / `rmi` cleanup and name-collision recovery.
- Keep base image unpinned (`python:3-alpine`) per exploration decision.

## Capabilities

### New Capabilities
- `container-preview`: Containerized static preview via Docker (buildable image serving the dashboard on port 8000) and complete README documentation including Docker run and cleanup instructions.

### Modified Capabilities
<!-- None — existing token-dashboard behavior is unchanged. -->

## Impact

- Affected files: new `Dockerfile`, new `.dockerignore`, new `README.md`; no changes to `index.html`, `app.js`, `styles.css`, `mock-data.json`.
- Dependencies: requires Docker Engine to build/run; runtime image uses `python:3-alpine` stdlib `http.server` only — no app code dependency changes, no CDN/external assets.
- Systems: local preview only; `http.server` is a dev static server, not production hardening.
