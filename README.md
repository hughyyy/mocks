# Mock API suite — Jira · Confluence · Datadog

Grouped home for the three local mock-server projects. Each subfolder is its **own git
repository** (matching the workspace convention); this folder holds only the system-level
documentation and the agents file (`AGENTS.md`).

| Repo | What it is | Serves | Port |
|---|---|---|---|
| [`mockcore/`](./mockcore/) | Shared zero-dependency storage core (used by the other two) | — (library) | — |
| [`mockapis/`](./mockapis/) | Jira (Cloud/DC, REST v2+v3) + Confluence (Cloud v1+v2, DC) mock | Atlassian HTTP APIs | `8080` |
| [`datadog/`](./datadog/) | Datadog research (`README.md`) + v2 hosted-API mock (`mock/`) | Datadog HTTP APIs | `8090` |

**`data/`** (committed here, in this repo) is the canonical seed-data source: the fictional
organisation (`organisation.md`), software specs (`software-specs.md`), and the entity
model/conventions (`README.md`). Per-product seeds (`mockapis/seed`, `datadog/mock/seed`)
derive from it.

## Architecture

All three products return **seeded data with the correct official shapes**, accept writes
through the exposed write APIs, store them durably, and return them faithfully through the
read APIs. The design contract lives in `mockapis/DESIGN.md`; the one-row-per-endpoint
inventory (+ whether each is data-backed) is in `mockapis/ENDPOINTS.md`.

```
mockcore/            Database (document store: stable ids, atomic JSON persistence,
  src/db.js            schema-shaped seeds) + EventStore (append-only events.jsonl,
  src/events.js         query / paginate / aggregate by kind)
        ▲ relative imports (sibling folders must stay together)
┌───────┴───────────────────────────────┐
mockapis/ (one Database shared by both) │   datadog/mock/
  jira-data.js / jira-wire.js            │     datadog-data.js / datadog-wire.js
  jira-http.js (REST v2/v3 + gateway)    │     datadog-http.js (hosted v2)
  confluence-http.js (v1 + v2 + DC)      │     events.jsonl (logs/spans/CI)
└───────────────────────────────────────┘
```

- **Shared core**: `mockcore/` has no runtime dependencies. Seeds **are** the DB schema —
  LLM-written JSON files load directly, no translation.
- **One stored record → many wire projections**: a Confluence `content` record renders as
  v1 content *and* v2 `PageSingle`; a Datadog log/span/CI event flows through the same
  `EventStore`.
- **Round-trip tested**: every write persists and is observable through reads (contract
  suite in each repo); wire-fidelity is asserted against the official OpenAPI specs
  (Jira `IssueBean`, Confluence v2 `PageSingle`, Datadog spans).

## Run & verify (per repo)

```bash
# mockcore — no deps
cd mockcore && npm test                       # 6/6

# mockapis (Jira + Confluence)
cd mockapis && npm run ingest && npm run mock  # http://127.0.0.1:8080
npm test  # 36/36 (HTTP + round-trips + wire-fidelity + edges)
npm run smoke && npm run coverage             # 79/967 official ops (8.2%)
npm run harness                              # every implemented endpoint, validated (126 routes)

# datadog (research + mock)
cd datadog/mock && npm i && npm run ingest && npm run mock  # http://127.0.0.1:8090
npm test  # 16/16
npm run smoke && npm run coverage             # 16/1585 official ops (1.0%)
npm run harness                              # every implemented endpoint, validated (16 routes)
```

Auth: Atlassian — Basic (email+API token / username+pass), Bearer PAT, OAuth-3LO gateway
(`/ex/jira/{cloudId}/...`, `GET /oauth/token/accessible-resources`, `GET /me`); opt-in
`STRICT_AUTH` / `ALLOW_ANON_READS` (see `mockapis/ACCESS.md`). Datadog — `DD-API-KEY` +
`DD-APPLICATION-KEY` (or Bearer), opt-in `STRICT_AUTH`.

## Key files / docs

- `mockapis/DESIGN.md` — storage + projection design (implemented, deviations recorded).
- `mockapis/ENDPOINTS.md` — every endpoint, what it returns, data-backed or placeholder.
- `mockapis/STATUS.md` — verified state + what remains.
- `mockapis/ACCESS.md` — official access methods (Cloud + DC, all auth models).
- `mockapis/examples/refinement-stacks.md` — sample agent call stacks.
- `datadog/README.md` — official Datadog API research (auth, sites, catalog, OpenAPI spec).
- `data/` — canonical seed model: organisation + software specs + entity conventions.

## Intentional non-committed artifacts

- `*/data/` — live stores (runtime/agent writes; `npm run reset` restores seeds).
- `*/specs/` — ingested official OpenAPI descriptors (`npm run ingest` regenerates).
- `node_modules/` — dev-only (`datadog/mock` uses `js-yaml` for ingestion).
