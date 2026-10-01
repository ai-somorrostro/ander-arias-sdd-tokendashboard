# Design

## Context

See proposal.md Why. Current state (observed): repo root holds `index.html`, `app.js` (~30KB), `styles.css`, `mock-data.json` (~3KB); no `Dockerfile`, no `README.md`, no `.gitignore`/`.dockerignore`. The page fetches `./mock-data.json` via relative path, so `file://` fails and HTTP serving is required. Existing spec `token-dashboard` (20 requirements) pins dependency-free static behavior; this change adds only packaging and docs, no app-code changes.

## Goals / Non-Goals

**Goals:**
- One-command local preview (`build` + `run`) that serves the exact static files on `http://localhost:8000`.
- Keep the Dockerfile exactly as agreed (5 lines, `python:3-alpine`, `http.server` on 8000).
- Keep the image lean via `.dockerignore` without changing Dockerfile semantics.
- Full README with the agreed 7 sections plus stop/rm/rmi cleanup and collision notes.

**Non-Goals:**
- No production hardening (TLS, auth, caching headers, multi-stage builds).
- No version pinning of the base image (decision: stay floating per exploration).
- No changes to dashboard behavior, `mock-data.json` schema, or existing specs.
- No CI workflow or registry push.

## Decisions

- **Base `python:3-alpine` unpinned over pinned `3.x-alpine`.** Why: matches the requested Dockerfile verbatim and stays smallest; project has no reproducibility gate that needs a digest. Alternative `python:3.12-alpine` or digest pin was rejected to honor the exploration decision. Trade-off: floating tag can shift Python minor versions (see Risks).
- **`python -m http.server` over nginx/caddy/node-serve.** Why: zero new files (no server config), stdlib only, consistent with the dependency-free constraint and the local `python3 -m http.server` fallback documented in README. Alternative nginx would need config + larger image for no benefit at this scale.
- **`COPY . .` + `.dockerignore` over explicit `COPY index.html app.js ...`.** Why: preserves the exact 5-line Dockerfile while still excluding `.git/`, `.opencode/`, `openspec/`, `*.Zone.Identifier`, `.DS_Store`. Explicit file list would be tighter but diverges from the agreed Dockerfile and needs updating per new asset.
- **`EXPOSE 8000` + `-p 8000:8000` + `http://localhost:8000` everywhere.** Why: single port end-to-end (Dockerfile, run command, README, local fallback) avoids mapping confusion. `http.server` binds all interfaces by default so no extra `--bind` flag is needed.
- **README 7-section shape.** Why: What it is / Features / Tech / Layout / Local run / Docker run / Cleanup — covers "what + how" for newcomers and gives the Docker commands a home. Cleanup (`stop`/`rm`/`rmi`, `--name` collision, port conflict) is a section, not an afterthought, because rerun failure is the most common Docker friction.

## Risks / Trade-offs

- [Floating `3-alpine` drifts] → Mitigation: README states the tag floats; pin later if reproducibility matters (one-line change, no spec change needed beyond the tag string).
- [`http.server` is single-threaded dev server, no compression/caching] → Mitigation: document as local preview only; dashboard is ~46KB so impact is negligible.
- [`COPY . .` can silently bloat as repo grows] → Mitigation: `.dockerignore` covers known metadata; revisit if new large dirs appear.
- [Port 8000 or `--name tokendashboard` collision on rerun] → Mitigation: README documents `docker stop/rm`, `docker ps`, and changing `-p` host port.
- [Stale browser cache hides new `mock-data.json`] → Mitigation: README notes hard-refresh; no code change.

## Migration Plan

No migration. Additive only: three new files at repo root. Rollback is deleting them. No data, no API, no existing-spec archive impact.

## Open Questions

None. All spec-affecting choices (Dockerfile content, unpinned tag, 7-section README, cleanup docs) were settled in exploration.
