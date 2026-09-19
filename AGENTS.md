# AGENTS.md — mock API suite (Jira · Confluence · Datadog · Outlook mail)

Guide for agents (and humans) working in this folder. Four **independent git repos** live
under the grouped parent; this file describes the whole suite and the invariants that keep
it coherent. Read `README.md` for the system overview.

## Repos

| Repo | Purpose | Commit separately |
|---|---|---|
| `mockcore/` | Zero-dependency storage core: `Database` (document store, atomic JSON persistence, stable ids) + `EventStore` (append-only `events.jsonl`, query/paginate/aggregate) | yes |
| `mockapis/` | Jira (Cloud/DC v2+v3) + Confluence (Cloud v1+v2, DC) mock on one shared Database. Docs: `DESIGN.md`, `ENDPOINTS.md`, `STATUS.md`, `ACCESS.md` | yes |
| `datadog/` | Datadog API research (`README.md`) + hosted v2 mock (`mock/`) | yes |
| `mailmock/` | Microsoft Graph / Outlook **business email** mock (inbox + send). Docs: `README.md`, `ENDPOINTS.md`, `STATUS.md` | yes |
| `data/` (this repo) | **Canonical seed model + build-out handoff** — fictional org
  (`organisation.md`), software specs (`software-specs.md`), component catalog with
  owners/SMEs/relationships (`components.md`), entity conventions (`README.md`), and the
  agent brief to complete + seed (`HANDOFF.md`). | with `mocks/` |

## Hard invariants

1. **`mockcore/` must stay dependency-free.** Do not add runtime npm dependencies to it.
2. **Seeds are the DB schema.** `seed/*.json` files (and `datadog/mock/seed/events.jsonl`)
   are schema-shaped and load directly — never store a *different* (legacy/catalog) shape.
   The **canonical model lives in `data/`** (`organisation.md`, `components.md`,
   `software-specs.md`); when generating/regenerating seeds, derive them from `data/` and
   keep every cross-link (ticket ↔ page ↔ service ↔ event ↔ deploy) resolvable. **Preserve
   the asserted seed anchors** listed in `data/HANDOFF.md` §1 byte-identical — the contract
   suites assert specific tickets/pages/events/counts.
3. **Writes must round-trip through reads.** Every write endpoint persists to the store;
   the corresponding read reflects it. The contract suites (`*roundtrip.test.js`) enforce
   this — changes to handlers or the model must keep them green.
4. **Projections live in `*-wire.js`** (`jira-wire`, `confluence-wire`, `datadog-wire`,
   `mail-wire`); HTTP mounts (`jira-http`, `confluence-http`, `datadog-http`, `mail-http`)
   are thin wrappers. Keep it that way; do not reintroduce per-handler shape mapping.
5. **Sibling layout is load-bearing.** `mockapis/*`, `datadog/mock/*` and `mailmock/*`
   import `mockcore` by relative path (`../../mockcore`, `../../../mockcore`). All four
   folders must move together; never move one alone.
6. **Live-activity simulators touch the live store only.** Each product's
   `npm run simulate` feeds writes through the running server's HTTP API into `data/`
   (gitignored). They never mutate `seed/`, and test suites boot from seeds into temp dirs,
   so simulators can never break the asserted anchors. `npm run reset` restores after demoing.
7. **`workflowconcept` must stay at `Source/workflowconcept`.** `mockapis`' HTTP tests and
   smoke import the real client at `../../../workflowconcept/src/jira.js` (relative to
   `mockapis/test` and `mockapis/scripts`).
8. **Never commit `data/` or `specs/`** — live stores and regenerable ingested descriptors
   (`npm run ingest`, `npm run reset`). `node_modules/` is dev-only.
9. **Wire-fidelity vs official specs.** Responses should validate under `MOCK_VALIDATE=1`;
   the wire-fidelity tests assert this for Jira `IssueBean`, Confluence v2 `PageSingle`,
   and Datadog spans. If a spec contradicts the real API (e.g. Confluence
   `PageSingle.parentId: null`), prefer the real API and update the validator/tests.

## Commands (run from each repo root)

| Task | mockcore | mockapis | datadog/mock | mailmock |
|---|---|---|---|---|
| Install | — | — | `npm i` (dev-only js-yaml) | — |
| Ingest specs | — | `npm run ingest` | `npm run ingest` | — |
| Run mock | — | `npm run mock` (:8080) | `npm run mock` (:8090) | `npm run mock` (:8100) |
| Test | `npm test` | `npm test` | `npm test` | `npm test` |
| Smoke | — | `npm run smoke` | `npm run smoke` | `npm run smoke` |
| Harness | — | `npm run harness` | `npm run harness` | `npm run harness` |
| Simulate (live feed) | — | `npm run simulate` | `npm run simulate` | `npm run simulate` |
| Coverage | — | `npm run coverage` | `npm run coverage` | `npm run coverage` |
| Reset live store | — | `npm run reset` | `npm run reset` | `npm run reset` |

## Change flow

- Test-first where behavior is involved (contract/round-trip/wire-fidelity suites exist).
- After any change: run that repo's `npm test` (+ `npm run smoke`, and `npm run coverage`
  if routes/specPaths changed). Do not run unrelated repos' suites mid-change (each is an
  independent repo with its own CI-friendly command set).
- Commit per repo with a descriptive message; keep `data/`, `specs/`, `node_modules/`
  out of the index.

## Handoff (flesh out the universe → generate seeds)

`data/HANDOFF.md` is the standing brief to complete the fictional model and produce the
per-product seed artifacts. Run it in its two phases (docs-first, then seeds); it lists the
asserted seed anchors that must not change, the exact seed-file contracts, and the
verification (tests + smoke + coverage + a link validator).

## Where things live

- Canonical model + handoff: `data/` (`HANDOFF.md` first for agents continuing the fiction)
- Design + deviations: `mockapis/DESIGN.md`
- Endpoint inventory + data-backed flag: `mockapis/ENDPOINTS.md`
- Verified state + remaining work: `mockapis/STATUS.md`
- Official access methods: `mockapis/ACCESS.md`
- Datadog API research: `datadog/README.md`
