# container-preview Specification

## Purpose

Give contributors a reproducible local preview of the static token dashboard via Docker plus a complete README that explains the app and how to run and stop it.

## Requirements

### Requirement: Container image builds and serves the dashboard

The system SHALL provide a `Dockerfile` at the repository root that builds a runnable image tagged `tokendashboard` and serves the static dashboard over HTTP on container port 8000.

#### Scenario: Image builds with the prescribed Dockerfile

- **WHEN** a contributor runs `docker build -t tokendashboard .` from the repository root
- **THEN** the build succeeds and produces an image tagged `tokendashboard` whose layers are based on `python:3-alpine` with working directory `/app`, copied project files, declared port 8000, and default command `python3 -m http.server 8000`.

#### Scenario: Container serves the dashboard page

- **WHEN** a contributor runs `docker run -d -p 8000:8000 --name tokendashboard tokendashboard` and opens `http://localhost:8000`
- **THEN** the dashboard page loads with its table, filters, charts, and sidepanel, loading data from the served `mock-data.json` with no file-not-found error for page assets.

### Requirement: Build context stays lean

The system SHALL provide a `.dockerignore` at the repository root that excludes version-control, planning, and OS metadata from the Docker build context while keeping all runtime assets.

#### Scenario: Ignored paths do not reach the image

- **WHEN** a contributor builds the image with `COPY . .` in the Dockerfile
- **THEN** `.git/`, `.opencode/`, `openspec/`, `*.Zone.Identifier`, and OS artifacts such as `.DS_Store` are excluded from the build context and are not present in `/app` inside the image, while `index.html`, `app.js`, `styles.css`, and `mock-data.json` are present.

### Requirement: README documents the app and both run paths

The system SHALL provide a `README.md` at the repository root that describes what the app is and its function, and documents both the plain local run and the Docker run.

#### Scenario: Reader learns what the app does

- **WHEN** a new contributor opens `README.md`
- **THEN** they find sections stating what Token Dashboard is, its features (8-column table, sorting, name/modality filters, price and usage-share charts, detail sidepanel), its dependency-free HTML/CSS/vanilla-JS tech, the project file layout, and that data comes from `mock-data.json`.

#### Scenario: Reader can run without Docker

- **WHEN** a contributor follows the local-run section
- **THEN** they find a working non-Docker command (e.g. `python3 -m http.server 8000`) plus the URL `http://localhost:8000` and the note that HTTP serving is required for `mock-data.json` to load.

### Requirement: Docker run and cleanup workflow is documented

The system SHALL document in `README.md` the exact Docker build/run commands and the cleanup lifecycle including name-collision recovery.

#### Scenario: Docker quickstart works as written

- **WHEN** a contributor follows the Docker section verbatim (`docker build -t tokendashboard .` then `docker run -d -p 8000:8000 --name tokendashboard tokendashboard`)
- **THEN** the container starts detached, the dashboard is reachable at `http://localhost:8000`, and the documented commands match the `Dockerfile`'s exposed port and workdir.

#### Scenario: Cleanup and rerun are covered

- **WHEN** a contributor re-runs the container or wants to stop it
- **THEN** the README shows `docker stop tokendashboard` and `docker rm tokendashboard` (plus optional `docker rmi tokendashboard`) and explains how to recover from `--name tokendashboard` already-in-use and port 8000 conflicts.
