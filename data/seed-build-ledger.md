# Seed build-out ledger — deliberate anchor updates

Records every change to the **asserted seed anchors** (counts/keys/statuses the contract
tests assert) made during the category-by-category seed build-out, because
`HANDOFF.md` §1 requires updates to a hard-asserted count/status to be **deliberate and
noted**. Policy chosen by the user: **full build-out, update anchors deliberately**
(i.e. grow capped categories too, and update the specific test assertion with a note here).

Each pass records: category, seed change, test file + line updated, and why.
Suites must stay green after every pass (`npm test` + `npm run smoke` + coverage unchanged).

## Pass 1 — Users + teams (`mockapis/seed/users.json`, `data/organisation.md`, `data/components.md`)

- **Seed change:** expanded the canonical user set from 12 staff → 24 staff + 3 customer
  contacts (27 records). Added 12 backfill staff (Nina Petrov, Hiroshi Nakata, Priya Nair,
  Dani Osei, Marta Kowalski, Luca Moretti, Aisha Rahman, Tom Becker, Elena Rossi, Zoe Chen,
  Omar Idris, Grace Adeyemi) under the `a6f10xx` accountId space, and 3 `accountType:
  customer` contacts (Margaret Hale, Diego Fuentes, Ethan Cole) under `02b4f1xx`.
- **Test anchors changed:** **none.** The user set has no count/contents anchor; `userBean`
  passes `accountType` through (`u.accountType ?? 'atlassian'`), the `user/search` test only
  asserts the first `ada` hit and `length >= 1`, and group endpoints are static. Suites green
  without edits.
- **Docs:** `organisation.md` §3 staff table + new §"Customer contacts"; `components.md` §3
  SME directory gained backfill rows (each SME now has a named second).
- **Validator impact:** unchanged (assignee/reporter/author emails all still resolve; all 27
  ids/emails unique).

## Pass 2 — Issues (backlog): ORB un-frozen (`mockapis/seed/issues.json`, `+comments.json`, `+changelog.json`, `mockapis/test/mock.test.js`)

- **Seed change:** grew the ORB backlog from 3 → 8 tickets. Seeded the previously
  documented-only `ORB-4` (sessions/auth, In Progress) and added `ORB-5` (chart-store
  backfill progress, Nina), `ORB-6` (archive-client backfill retry, Grayson), `ORB-7`
  (replay-player seek/scrub, Nina), `ORB-8` (fleet overview aggregation, Grayson). Added
  comments 10016–10021 and changelog entry 7 (ORB-4 To Do → In Progress). All carry
  `service:orbiter-dashboard`; the FLY side, `ORB-1..3` and every other anchor is untouched.
- **Test anchors changed (deliberate, noted):**
  - `mockapis/test/mock.test.js` ~L74 — `assert.equal(key, 'ORB-4')` → `assert.equal(key,
    'ORB-9')`. With ORB-1..8 seeded, `nextIssueKey` returns ORB-9. Comment added inline.
  - This is the first anchor edit of the build-out; it is the one §1's "next key ORB-4"
    entry described, and it is now recorded here instead of being latent.
- **Docs:** `tickets.md` ORB table + ORB-4..8 sections; `links.md` ORB rows + id ranges.
- **Validator impact:** updated `ISSUE_SERVICE` handling is not needed — new issues carry
  `service:orbiter-dashboard` labels, so the label branch resolves them. No validator file
  change; check count stays 204 (issues 10001–10016, comments 10000–10021 all resolve).

## Pass 3 — Confluence pages (`mockapis/seed/content.json`, `mock.test.js`, `scripts/smoke.js`)

- **Seed change:** grew the documentation tree from 7 → 15 records. ENG +6 (pages `98306`
  Telemetry Ingest, `98307` Flight Log Parser, `98308` Flyer Autopilot Architecture, `98309`
  Field Ops App, plus blogposts `98312` release and `98313` flyer-flight postmortem); PD +2
  (`98314` Q4 roadmap, `98315` September interviews). All carry full body.storage XHTML,
  labels, parents; every page references only seeded tickets.
- **Test anchors changed (deliberate, noted):**
  - `mockapis/test/mock.test.js` CQL `space = "ENG"` — `s.size === 5` → `11`.
  - `mockapis/test/mock.test.js` `?spaceKey=PD&type=page` — `2` → `4`.
  - `mockapis/test/mock.test.js` DC `?spaceKey=PD` — `2` → `4`.
  - `mockapis/scripts/smoke.js` CQL `space = "ENG"` — `s.size !== 5` → `11` (the smoke
    script separately hardcoded the same anchor; was caught by the pass-3 smoke run).
  - `data/validate-links.mjs` — ENG 5 → 11, PD 2 → 4, max content id 98311 → 98315.
- **Docs:** `page-map.md` rewritten for the 15-page tree; `links.md` page map/refs/id ranges;
  `HANDOFF.md` §1 Confluence line.
- **Validator impact:** page → ticket refs all resolve; check count grew 236 → 255.

## Pass 4 — Containers + processes per-service-per-env (`datadog/mock/seed/containers.json`, `+processes.json`, `+events.jsonl`, `datadog/mock/test/mock.test.js`)

- **Seed change:** grew `containers.json` from 5 → 12 records — one container per declared
  service/environment pair. Added dev/staging containers for every service lacking them:
  `orb-dev-1` (orbiter-dev, 1.4.0), `fly-staging-2` (flyer-gw-staging, 2.0.9),
  `fly-staging-3` (flyer-flight-staging, 0.9.0-rc1), `fly-dev-2` (flyer-flight-dev,
  0.9.0-dev), `tel-staging-1` (tel-ingest-staging, 3.0.0), `fly-staging-1`
  (parser-staging, 0.4.0 — matches the existing pid-7314 process), `fly-dev-3`
  (parser-dev, 0.4.0-dev). Added 6 matching processes. Each has a unique 7-hex
  `git.commit.sha` resolving to a new deploy pipeline (see `events.jsonl` additions below)
  plus a `deployment:<service>-<env>-<date>` tag. Production `orbiter-dashboard` stays a
  single container (`orb-prod-7`) so the prod-orbiter host filter keeps asserting exactly
  `['orb-prod-7']`.
- **Events added:** `events.jsonl` gained 6 `ci-pipeline` + 6 `ci-job` records
  (`pipe_20012..20022` / `job_20013..20023`) for `deploy-orbiter-dev` (d3e4f5a,
  orbiter-1.4.0), `deploy-flyer-gateway-staging` (4b5c6d7, flyer-gw-2.0.9),
  `deploy-flyer-flight-staging` (e5f6a7b, flyer-flight-0.9.0-rc1),
  `deploy-flyer-flight-dev` (c7d8e9f, flyer-flight-0.9.0-dev),
  `deploy-telemetry-ingest-staging` (b2c3d4e, telemetry-ingest-3.0.0),
  `deploy-flight-log-parser-dev` (8e9f0a1, flight-log-parser-0.4.0-dev).
- **Test anchors changed (deliberate, noted):**
  - `datadog/mock/test/mock.test.js` ~L40 — `assert.equal(all.data.length, 5)` → `12`.
  - `data/validate-links.mjs` — `containers.length === 5` → `12`.
  - `L45` prod orbiter filter (`['orb-prod-7']`) unchanged — single prod orbiter container.
- **Docs:** `operations.md` §2/§3/§4/§5 + caps note (containers 12), `HANDOFF.md` §1
  containers line, `data/README.md` §5 caps, `links.md` service→sha maps + id ranges.
- **Validator impact:** every new container/process sha resolves to the new deploy events;
  `validate-links` check count grew 255 → 299.

## Pass 5 — Logs per-service coverage (`datadog/mock/seed/events.jsonl`, `datadog/mock/test/mock.test.js`)

- **Seed change:** grew `kind:log` events from 6 → 11 records, closing per-service coverage
  gaps. Added `log_10007` (orbiter-dashboard, session resume, ticket ORB-4), `log_10008`
  + `log_10009` (flyer-gateway preflight check + token warn, ticket FLY-2), `log_10010`
  + `log_10011` (flight-log-parser v2 segment parse + malformed-frame warn, ticket FLY-5).
  No new log contains "overshoot", preserving that single-hit search contract.
- **Test anchors changed (deliberate, noted):**
  - `datadog/mock/test/mock.test.js` ~L87 — `logs.data.length === 6` → `11`.
  - `datadog/mock/test/mock.test.js` ~L100 — `after.data.length === 7` → `12`.
  - `L91` `overshoot` search (`1`, `ticket: FLY-1`) unchanged.
  - `data/validate-links.mjs` — `logs.length === 6` → `11`.
- **Docs:** `operations.md` §5 cap note + logs table (6 → 11), `HANDOFF.md` §1 logs line,
  `data/README.md` §5 caps, `links.md` log id range.
- **Validator impact:** check count grew 299 → 309.

## Pass 6 — Spans: orbiter-dashboard growth (`datadog/mock/seed/events.jsonl`, `datadog/mock/test/mock.test.js`)

- **Seed change:** added `span_30011` (`GET /api/flights`, ORB-3), `span_30012`
  (`GET /api/overview/fleet`, ORB-8), `span_30013` (`chart.store.replay`, ORB-7) in a new
  orbiter-dashboard trace `e0f1e0f1e0f1e0f1` (prod, sha 9f2c8a1). Orbiter-dashboard span
  count grows 1 → 4. Traces `1234567890abcdef` (3 spans) and `fedcba9876543210` untouched.
- **Test anchors changed (deliberate, noted):**
  - `datadog/mock/test/mock.test.js` ~L115 — aggregate-by-service orbiter-dashboard count
    `=== 1` → `=== 4`.
- **Docs:** `operations.md` §5 spans (new fleet trace + anchor note), `links.md` spans range
  (span_30001–span_30013) + ORB-3/ORB-7/ORB-8 span rows.
- **Validator impact:** live-trace 3-span assertion unchanged; check count grew 309 → 318.

## Pass 7 — FLY statuses: second In Progress ticket (`mockapis/seed/issues.json`, `+changelog.json`, `mockapis/test/mock.test.js`)

- **Seed change:** moved `FLY-5` (flightlog validator, id 10008) from `To Do` →
  `In Progress` — it is actively underway: parser comments 10007/10008 and the FLY-5 logs
  (`log_10010`/`log_10011`) date 2026-09-18. Added changelog 8 (To Do → In Progress, clara,
  2026-09-18). `FLY-1` stays the primary anchor; `updatedAt` 2026-09-18 already reflects
  the activity. JQL `project = FLY AND status = "In Progress"` now returns 2.
- **Test anchors changed (deliberate, noted):**
  - `mockapis/test/mock.test.js` ~L101 — `body.total === 1` → `2`; `issues[0].key ===
    'FLY-1'` unchanged (FLY-1 id 10004 < FLY-5 id 10008).
  - `data/validate-links.mjs` — FLY In Progress: `length === 1 && [0].key === 'FLY-1'` →
    `length === 2`, first FLY-1, and includes FLY-5.
- **Docs:** `tickets.md` FLY table + FLY-5 section + status note + changelog table,
  `HANDOFF.md` §1 JQL line, `data/README.md` §5 caps, `links.md` changelog range (1–8).
- **Validator impact:** check count unchanged at 318 (same single FLY check, tightened to
  FLY-1 + FLY-5).

## Pass 8 — Mess build-out: orphan-ticket pages, buried context + pivot storyline (`mockapis/seed/*`, `datadog/mock/seed/events.jsonl`)

Deliberate move towards "a real company, not a clean model": fill the four orphaned
tickets, enrich the thin spec page, and layer in an intentionally contradictory,
partially-buried executive storyline (a crypto-pivot) whose truth a digging workflow can
recover and could "turn around".

- **Seed change (Jira):** new `CRYPTO` project (id 10003) + `CRYPTO-1` (id 10017) "Develop a
  plan to pivot into crypto" (Epic, Highest, In Progress, assigned Noor, reported by Ada —
  Ada's comment is the buried reality-check: runway 18+ months, pipeline up, board hasn't
  approved, no banking partner). Comments 10022–10025: Noor champion view, Ada's flag, plus
  breadcrumbs on ORB-2 (Lena: customers asking about "the blockchain thing") and FLY-2 (Sam:
  preflight is the thing customers pay for). Changelog 9 = CRYPTO-1 → In Progress.
  ORB/FLY anchors untouched (max ORB id still 10016, next ORB key ORB-9, FLY In Progress 2).
- **Seed change (Confluence):** new pages 98316 (PD stablecoin executive plan — the
  centrepiece, contradicts its own body's claims vs Ada's comment), 98317 (sessions/auth →
  ORB-4, with an unresolved July security review), 98318 (chart store → ORB-5), 98319
  (archive client → ORB-6), 98320 (tagging conventions → FLY-8, self-aware about the legacy
  `service:` label debt). Enriched 98303 (Format v2 example record + FLY-5), and appended
  contradictory lines to 98310 ("robotics, not a financial services company") and 98314
  (roadmap: no new business lines; CRYPTO-1 "not part of this roadmap").
- **Seed change (Datadog):** CI events pipe_20024 + job_20025 `deploy-stablecoin-experiment`
  (sha 8a1b2c3, tag stablecoin-demo-0.1.0, service orbiter-dashboard) — a smoke contradiction:
  something was already "deployed" before the plan was approved.
- **Test anchors changed (deliberate, noted):**
  - `mockapis/test/mock.test.js` — ENG CQL `s.size` 11 → 15; PD list/page `4` → `5` (×2:
    Cloud + DC); ORB-2 comment stateful test made seed-count-agnostic (`.some(...)` instead
    of exact count / `[0]`), because ORB-2 now carries a seed comment.
  - `mockapis/scripts/smoke.js` — ENG CQL `11` → `15`.
  - `mockapis/scripts/harness.js` — ENG CQL expectation `11` → `15`.
  - `data/validate-links.mjs` — ENG 11 → 15, PD 4 → 5, max content id 98315 → 98320 (next
    98321); issue→service resolution now skips non-ORB/FLY projects (CRYPTO is company-level).
- **Docs:** `HANDOFF.md` §1 Confluence line, `data/README.md` §5 caps (also corrected the
  stale ORB next-key reference), `links.md` ticket→page map + page→ticket refs + id ranges.
- **Validator impact:** page→ticket refs all resolve (new pages reference ORB/FLY keys +
  CRYPTO-1); check count grew 318 → 342.

## Anticipated anchor updates (later passes, not yet applied)

These are the specific test assertions that will change, pass by pass, as capped categories
get built out. They are listed here first so each edit is deliberate and auditable.

| Category (pass) | Seed growth | Test assertion to update |
|---|---|---|
| *(all anticipated passes applied)* | | |

Applied so far: **pass 2** ORB next-key (`ORB-4` → `ORB-9`, `mock.test.js`); **pass 3**
Confluence counts (ENG 5 → 11, PD 2 → 4, next content id 98312 → 98316 — `mock.test.js` +
`scripts/smoke.js` + `validate-links.mjs`); **pass 4** containers per-service-per-env
(5 → 12 — `datadog/mock/test/mock.test.js` + `validate-links.mjs`); **pass 5** logs
per-service coverage (6 → 11 — `datadog/mock/test/mock.test.js` + `validate-links.mjs`);
**pass 6** orbiter-dashboard spans (1 → 4 — `datadog/mock/test/mock.test.js`); **pass 7**
second FLY ticket `In Progress` (1 → 2 — `mockapis/test/mock.test.js` +
`validate-links.mjs`); **pass 8** mess build-out (ENG 11 → 15, PD 4 → 5, next content id
98316 → 98321 — `mockapis/test/mock.test.js` + `scripts/smoke.js` + `scripts/harness.js` +
`validate-links.mjs`).
