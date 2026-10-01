# Tasks

## 1. Container packaging

- [x] 1.1 Create `Dockerfile` at repo root with the five agreed lines (`FROM python:3-alpine`, `WORKDIR /app`, `COPY . .`, `EXPOSE 8000`, `CMD ["python3", "-m", "http.server", "8000"]`) and verify `cat Dockerfile` shows exactly that content in order.
- [x] 1.2 Create `.dockerignore` at repo root excluding `.git/`, `.opencode/`, `openspec/`, `*.Zone.Identifier`, and `.DS_Store`, and verify `cat .dockerignore` lists those entries and `docker build` context no longer includes them.

## 2. Documentation

- [x] 2.1 Create `README.md` at repo root with sections 1-4 (what Token Dashboard is, features from live code/spec, dependency-free tech + `mock-data.json` note, file layout) and verify each heading exists and feature list matches the 8-column table, filters, charts, and sidepanel.
- [x] 2.2 Document sections 5-7 in `README.md` (local `python3 -m http.server 8000` run, Docker `build -t tokendashboard` + `run -d -p 8000:8000 --name tokendashboard` + `http://localhost:8000`, cleanup `stop`/`rm`/`rmi` plus name/port collision recovery) and verify every command in the file runs as written when copy-pasted.

## 3. End-to-end verification

- [x] 3.1 Build the image with `docker build -t tokendashboard .` and verify it succeeds and `docker images tokendashboard` lists the tag.
- [x] 3.2 Run `docker run -d -p 8000:8000 --name tokendashboard tokendashboard`, verify `http://localhost:8000` loads the dashboard with table data from `mock-data.json`, then verify cleanup with `docker stop tokendashboard && docker rm tokendashboard` removes the container.
- [x] 3.3 Run `openspec validate --change add-docker-and-readme --strict` and verify it passes with no errors.
