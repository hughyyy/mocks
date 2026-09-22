# Agent guide — stand up the mock suite and connect

Brightline Robotics is fictional, but the servers behind it are real, local, and
stateful. This guide is for an agent that wants to **stand up** any of the four mocks,
**connect** to them as a client, read/write data, and **prove** a change. Read it before
your first call to any mock, when a port, auth shape, or base URL is unclear, or when you
are about to boot the live-activity feed for a demo.

The suite: four independent repos sharing one zero-dependency core.

| Repo | What it mocks | Port | Boot |
|---|---|---|---|
| `mockapis/` | Jira (Cloud/DC v2+v3) · Confluence (Cloud v1+v2, DC) | `8080` | `npm run mock` |
| `datadog/mock/` | Datadog hosted v2 (containers, services, logs, spans, CI) | `8090` | `npm run mock` |
| `mailmock/` | Microsoft Graph / Outlook business email (inbox + send) | `8100` | `npm run mock` |
| `mockcore/` | storage core (library — no server) | — | — |

## 1. Stand up a server

Per repo, from the repo root:

1. `npm install` only where the repo has deps (`datadog/mock` — dev-only `js-yaml`);
   `mockcore`, `mockapis`, `mailmock` are dependency-free.
2. `npm run ingest` only `mockapis` / `datadog/mock` if its `specs/` dir is missing or you
   changed route coverage (downloaded OpenAPI descriptors are gitignored).
3. `npm run mock` starts the server. First boot copies `seed/` → `data/`; later boots read
   the live `data/`.

**Done when** each server answers a readiness probe on its port:

- `8080` → `curl -o /dev/null -s -w "%{http_code}" -H "Authorization: Basic $(printf 'ada@brightline.dev:mock' | base64)" http://127.0.0.1:8080/rest/api/3/serverInfo` → `200`
- `8090` → a `containers` GET with `DD-API-KEY` + `DD-APPLICATION-KEY` headers → `200`
- `8100` → `GET /v1.0/me` with a `Basic`/`Bearer` header → `200`

Servers are long-running; run them as managed processes and stop them when done. They do
not share state except conceptually — each has its own `data/`.

## 2. Connect

Every mock accepts any presented credential by default; identity is attributed from the
header. Opt-in flags change this (see §7). Use the same auth you would against the real
product, so client code is portable.

| Surface | Base URL | Auth header | Identity from |
|---|---|---|---|
| Jira | `http://127.0.0.1:8080/rest/api/{2,3}` | `Basic base64(email:token)` or `Bearer <pat>` | Basic user; any Bearer accepted |
| Confluence | `http://127.0.0.1:8080/wiki/rest/api` (v1/DC: `/rest/api`; v2: `/wiki/api/v2`) | same Basic/Bearer | same |
| OAuth 3LO gateway | `http://127.0.0.1:8080/ex/{jira\|confluence}/{cloudId}/...` · `GET /oauth/token/accessible-resources` · `GET /me` | `Bearer` | — |
| Datadog | `http://127.0.0.1:8090/api/v2/...` | `DD-API-KEY` + `DD-APPLICATION-KEY` (or `Bearer`) | — |
| Mail | `http://127.0.0.1:8100/v1.0/...` | `Basic base64(email:token)` or `Bearer` + `X-MS-Mail-As: <email>` | Basic email / `X-MS-Mail-As` |

Canonical first calls (all round-trip through reads):

```bash
# Jira: read a seeded issue (description is ADF — `fields.description` is a doc node)
curl -H "Authorization: Basic $(printf 'ada@brightline.dev:mock' | base64)" \
  http://127.0.0.1:8080/rest/api/3/issue/ORB-1

# Confluence v2 page
curl -H "Authorization: Basic $(printf 'ada@brightline.dev:mock' | base64)" \
  http://127.0.0.1:8080/wiki/api/v2/pages/98303

# Datadog: containers (the 12-container per-service-per-env world)
curl -H "DD-API-KEY: mock-api-key" -H "DD-APPLICATION-KEY: mock-app-key" \
  http://127.0.0.1:8090/api/v2/containers

# Mail: inbox, then send from the calling identity
curl -H "Authorization: Basic $(printf 'lena@brightline.dev:mock' | base64)" \
  http://127.0.0.1:8100/v1.0/me/messages
```

Write endpoints accept what the real API accepts and persist; the matching read reflects
the write (round-trip is enforced by the contract suites). Jira `POST /issue`,
`/issue/{key}/comment`, `/transitions`, project CRUD; Confluence `POST/`PUT content, pages,
blogposts, spaces, labels, footer-comments; Datadog `POST /catalog/entity`, `POST /logs`;
mail `POST /v1.0/me/sendMail`, `POST /v1.0/me/messages`, `PATCH`/`DELETE`.

**Storage backends & persistence (the four launch modes).** Each server reads
`MOCK_STORAGE=json|sqlite` and `MOCK_PERSIST=on|off` (defaults `json`/`on`) and has a
per-mode startup script — `scripts/start-json.sh`, `start-json-ephemeral.sh`,
`start-sqlite.sh`, `start-sqlite-ephemeral.sh` (also `npm run start:…`). Durable modes write
to `<repo>/data/` (json) or `<repo>/data-sqlite/mockstore.sqlite` and survive restarts;
ephemeral modes boot fresh from `seed/` into a throwaway tmp dir and clear on teardown
(restart = mock data again) without touching either durable store. `scripts/clear-json.sh` /
`clear-sqlite.sh` wipe the named durable store (next boot reseeds); `npm run reset` restores
both. The json and sqlite stores are independent and may diverge. Design + semantics:
[`mockcore/STORAGE.md`](./mockcore/STORAGE.md).

## 3. Data model — read this before you write seeds

- `seed/*.json` (and `datadog/mock/seed/events.jsonl`) are **the schema** — schema-shaped,
  loaded directly, never a legacy/catalog shape. `data/` is the live store; `npm run reset`
  restores `seed/ → data/` and erases anything you wrote at runtime.
- The canonical fiction lives in `data/` (this repo): `organisation.md`, `components.md`,
  `software-specs.md`, `tickets.md`, `page-map.md`, `operations.md`, `links.md`, `emails.md`.
  Seeds should be derived from it, and every cross-link (ticket ↔ page ↔ service ↔ event ↔
  deploy ↔ email) must resolve.
- **Hard anchors**: `data/HANDOFF.md` §1 lists seed values the contract tests assert
  byte-identical (ORB-1, comment `10001`, next key `ORB-9`, ENG/PD content counts, container
  and log counts, CI sha/tag, JQL totals). Extend, don't move; when an addition changes an
  asserted count/status, update the specific assertion **and** record it in
  `data/seed-build-ledger.md`.
- Mock-mode auth is deliberately loose (any credential); `STRICT_AUTH=1` and
  `ALLOW_ANON_READS=1` are the opt-in hardening flags.

**Done when** any seed edit you make keeps `node data/validate-links.mjs` green and the
affected repo suite green (§5).

## 4. Live-activity feed (optional)

Each server can look alive during a demo: run that repo's `npm run mock` and
`npm run simulate` together. The simulator writes through the HTTP API into the **live
store only** — comments/transitions/pages on the timer (mockapis), log/entity ingest
(datadog), storyline mail delivery (mailmock). It can never touch `seed/`, so it cannot
break anchors or the test suites. `npm run reset` clears its effects.

## 5. Prove a change

For anything you modified, run that repo's battery from its root:

| Repo | Tests | Smoke | Harness | Coverage |
|---|---|---|---|---|
| `mockcore` | `npm test` (6/6) | — | — | — |
| `mockapis` | `npm test` (36/36) | `npm run smoke` | `npm run harness` (126 routes) | `npm run coverage` (8.2%) |
| `datadog/mock` | `npm test` (16/16) | `npm run smoke` | `npm run harness` (16 routes) | `npm run coverage` (1.0%) |
| `mailmock` | `npm test` (13/13) | `npm run smoke` | `npm run harness` (10 routes) | `npm run coverage` (10 routes) |

Plus, for any seed/model change: `node data/validate-links.mjs` (all cross-links + anchors).

Coverage counts are a **route-surface** signal — a seed-only change must leave them
unchanged; a route addition moves them and should be expected. `MOCK_VALIDATE=1` (or a
`validate: true` server) logs structural deviations against the ingested official
descriptors — best-effort, never fatal.

## 6. Reference

- Endpoint inventory + data-backed flags: `mockapis/ENDPOINTS.md`, `datadog/mock/README.md`,
  `mailmock/ENDPOINTS.md`.
- Auth matrix + versions: `mockapis/ACCESS.md`.
- Storage/projection design + deviations: `mockapis/DESIGN.md` (projections always live in
  `*-wire.js`; HTTP mounts are thin wrappers).
- Seed layout + entity conventions: `data/README.md`; cross-link map: `data/links.md`;
  anchor ledger: `data/seed-build-ledger.md`.

Gotchas worth knowing before you trip over them:

- Jira **descriptions are Atlassian Document Format (ADF)** on both v2 and v3 (Cloud) — a
  `fields.description` object, not a string. The reference client
  (`Source/workflowconcept/src/jira.js`) parses it via `parseAdf` and exposes the raw doc as
  `descriptionAdf`. Data Center returns a plain string.
- `mockapis`' own tests import that **real client** (`workflowconcept`), so a change to the
  client's mapping surfaces in the mock's suite — keep the two in step.
- Ports are fixed (`8080/8090/8100`); a conflicting process means the readiness probe fails
  — find and stop it before booting.
- Live `data/` and `specs/` are gitignored across repos — never commit them.
