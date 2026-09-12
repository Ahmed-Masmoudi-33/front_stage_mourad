# Jira Pipeline UI

Angular 16 + Material frontend for the Jira → analysis → plan → approval → local
implementation → local review/retry → draft PR pipeline.

Requires Node **18.20.8** and npm **10.8.2** (or compatible).

## Setup

```bash
cd /home/ahmed/study/front_stage_mourad
npm install
```

## Run (with API)

1. Start the backend (from `stage_mourad`):

```bash
cd "/home/ahmed/study/stage_mobelite_jira_project/no_git_usage/stage_mourad"
source .venv/bin/activate
export PIPELINE_API_MOCK=true   # optional; fake timed runs for UI demo
python scripts/serve.py
```

2. Start this app (proxies `/api` → `http://127.0.0.1:8000`):

```bash
npm start
```

Open http://localhost:4200

## Features

- **Runs list** — history with status filters
- **Launch pipeline** — start a run by Jira key
- **Live workflow graph** — node states update over SSE
- **Timeline & artifacts** — local review findings, retry count, published branch, and draft PR
- **Approval gate** — approve or cancel when the pipeline pauses

## Scripts

| Command | Description |
|---|---|
| `npm start` | Dev server with API proxy |
| `npm run build` | Production build |
| `npm test` | Unit tests |

## Config

- [`proxy.conf.json`](proxy.conf.json) — proxies `/api` to the FastAPI server
- [`src/environments/environment.ts`](src/environments/environment.ts) — `apiUrl: '/api'`
