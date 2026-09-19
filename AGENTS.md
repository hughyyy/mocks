# AGENTS.md — mock API suite (Jira · Confluence · Datadog)

Guide for agents (and humans) working in this folder. Three **independent git repos** live
under the grouped parent; this file describes the whole suite and the invariants that keep
it coherent. Read `README.md` for the system overview.

## Repos

| Repo | Purpose | Commit separately |
|---|---|---|
| `mockcore/` | Zero-dependency storage core: `Database` (document store, atomic JSON persistence, stable ids) + `EventStore` (append-only `events.jsonl`, query/paginate/aggregate) | yes |
| `mockapis/` | Jira (Cloud/DC v2+v3) + Confluence (Cloud v1+v2, DC) mock on one shared Database. Docs: `DESIGN.md`, `ENDPOINTS.md`, `STATUS.md`, `ACCESS.md` | yes |
| `datadog/` | Datadog API research (`README.md`) + hosted v2 mock (`mock/`) | yes |

## Hard invariants

1. **`mockcore/` must stay dependency-free.** Do not add runtime npm dependencies to it.
2. **Seeds are the DB schema.** `seed/*.json` files (and `datadog/mock/seed/events.jsonl`)
   are schema-shaped and load directly — never store a *different* (legacy/catalog) shape.
3. **Writes must round-trip through reads.** Every write endpoint persists to the store;
   the corresponding read reflects it. The contract suites (`*roundtrip.test.js`) enforce
   this — changes to handlers or the model must keep them green.
4. **Projections live in `*-wire.js`** (`jira-wire`, `confluence-wire`, `datadog-wire`);
   HTTP mounts (`jira-http`, `confluence-http`, `datadog-http`) are thin wrappers. Keep it
   that way; do not reintroduce per-handler shape mapping.
5. **Sibling layout is load-bearing.** `mockapis/*` and `datadog/mock/*` import
   `mockcore` by relative path (`../../mockcore`, `../../../mockcore`). All three folders
   must move together; never move one alone.
6. **`workflowconcept` must stay at `Source/workflowconcept`.** `mockapis`' HTTP tests and
   smoke import the real client at `../../../workflowconcept/src/jira.js` (relative to
   `mockapis/test` and `mockapis/scripts`).
7. **Never commit `data/` or `specs/`** — live stores and regenerable ingested descriptors
   (`npm run ingest`, `npm run reset`). `node_modules/` is dev-only.
8. **Wire-fidelity vs official specs.** Responses should validate under `MOCK_VALIDATE=1`;
   the wire-fidelity tests assert this for Jira `IssueBean`, Confluence v2 `PageSingle`,
   and Datadog spans. If a spec contradicts the real API (e.g. Confluence
   `PageSingle.parentId: null`), prefer the real API and update the validator/tests.

## Commands (run from each repo root)

| Task | mockcore | mockapis | datadog/mock |
|---|---|---|---|
| Install | — | — | `npm i` (dev-only js-yaml) |
| Ingest specs | — | `npm run ingest` | `npm run ingest` |
| Run mock | — | `npm run mock` (:8080) | `npm run mock` (:8090) |
| Test | `npm test` | `npm test` | `npm test` |
| Smoke | — | `npm run smoke` | `npm run smoke` |
| Coverage | — | `npm run coverage` | `npm run coverage` |
| Reset live store | — | `npm run reset` | `npm run reset` |

## Change flow

- Test-first where behavior is involved (contract/round-trip/wire-fidelity suites exist).
- After any change: run that repo's `npm test` (+ `npm run smoke`, and `npm run coverage`
  if routes/specPaths changed). Do not run unrelated repos' suites mid-change (each is an
  independent repo with its own CI-friendly command set).
- Commit per repo with a descriptive message; keep `data/`, `specs/`, `node_modules/`
  out of the index.

## Where things live

- Design + deviations: `mockapis/DESIGN.md`
- Endpoint inventory + data-backed flag: `mockapis/ENDPOINTS.md`
- Verified state + remaining work: `mockapis/STATUS.md`
- Official access methods: `mockapis/ACCESS.md`
- Datadog API research: `datadog/README.md`
