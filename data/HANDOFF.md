# Handoff — complete the fictional universe, then generate seed artifacts

**Mission:** (1) flesh out the remaining detail in the canonical model under `data/`
(organisation, components, software specs, relationships, owners/SMEs) until the "whole
picture" is coherent; then (2) generate the **actual schema-shaped seed artifacts** for each
mock repo, derived from `data/`, keeping every suite green.

**Status (2026-09-20): Phase A and Phase B are complete and verified.** The canonical docs,
all seed passes (1–8, including the deliberate "mess" layer), the endpoint harness, the
live-activity simulators, and the mail mock are in place; see `seed-build-ledger.md` for the
anchor-change record. This file remains the standing rulebook — extend the universe, don't
regress the anchors, keep the suites green.

Read first: `data/README.md` (entity model + conventions), `organisation.md`, `components.md`
(component catalog + owners/SMEs), `software-specs.md` (per-project specs + consistency
checklist), `emails.md` (the mail universe), then `mockapis/DESIGN.md` (store schemas) and
`../AGENTS.md` (invariants). Agents standing up / connecting to the suite: `../AGENT-GUIDE.md`.

---

## 1. What already exists (do not regress)

- **Brightline Robotics**: business, 6 departments/teams, 24 staff + 3 customer contacts,
  5 repos, environments, products — `organisation.md`.
- **Component catalog**: ~26 components with owner/SME/second + relationship wiring —
  `components.md`.
- **Software specs**: services, flows, Flight Log Format v2, incidents, deploy tags —
  `software-specs.md`.
- **Working seeds** (already schema-shaped and **tested**): `mockapis/seed/*`,
  `datadog/mock/seed/*`, and `mailmock/seed/*`. Verified: mockapis 36/36 + smoke + harness
  (126 routes) + coverage 8.2%; datadog 16/16 + smoke + harness (16 routes) + coverage 1.0%;
  mailmock 13/13 + smoke + harness (10 routes); `data/validate-links.mjs` 344 checks.
- **Live-activity feeds**: `npm run simulate` per mock keeps a demo moving (comments/
  transitions/pages, log/entity ingest, storyline mail delivery) — live `data/` only,
  `npm run reset` restores.
- **The deliberate mess**: the freshest layer (CRYPTO-1 "pivot into crypto" + Confluence
  98316 stablecoin plan + the 18-months/18-days/18-hours runway contradiction across
  ticket/doc/comment/email) is *intentional* — a real company is inaccurate and
  self-contradictory, and a workflow should have to dig to find the ground truth. Do not
  "clean up" these contradictions; the ledger pass 8 addendum records them.

**Critical: the tests assert specific seed values.** These anchors must stay byte-identical:

- Jira — `ORB-1` (summary "Live telemetry chart loses history after reconnect", status
  In Progress, type Bug, priority High, labels `[telemetry,orbiter,reconnect]`, assignee
  ada, reporter grayson, **2 comments**, description contains "backfill"), `ORB-2`
  "Self-serve mission replays for support", `ORB-3`, `ORB-4..8` (seed build-out pass 2),
  `FLY-1` (In Progress), `FLY-2`, `FLY-3`; projects `ORB`/`FLY` plus `CRYPTO` (pass 8,
  `CRYPTO-1` id 10017 — the pivot ticket, with the buried runway contradiction in its
  comments);
  comment id **10001 = ORB-1's second comment**; comment range 10000–10026; changelog 1–9;
  next key `ORB-9`.
  (Deliberate anchor edits made during the seed build-out — including this one — are
  recorded in [`seed-build-ledger.md`](./seed-build-ledger.md).)
- Confluence — spaces `ENG`(id 100)/`PD`(101); pages `98301` Welcome, `98302` Orbiter
  Architecture Overview (parent 98301, labels architecture/orbiter, body contains
  "gateway"), `98303` Flight Log Format v2 (body "newline-delimited"), `98304` Q3 demo plan
  (ENG, labels demo, body "figure eight"), `98305` incident, `98306` ingest, `98307`
  parser, `98308` flyer architecture, `98309` field-ops, `98312`/`98313` ENG blogposts,
  `98310/98311/98314/98315/98316` + orphan-ticket pages `98317..98320` (ENG 98317..98320);
  `PD` has **5** pages; ENG CQL search size **15**
  (13 pages + 2 blogposts); next content id `98321`.
- Datadog — containers: `orb-prod-7`/`orbiter-dashboard`/tag `1.4.2` (list count 12,
  per-service-per-env build-out);
  processes incl `flyer-flight`; services incl `orbiter-dashboard`+`flyer-flight`; catalog
  ≥4 entities; relations expose `orbiter-dashboard → flyer-gateway|telemetry-ingest`; logs:
  `overshoot` (ticket FLY-1), **11 logs before ingest, 12 after**; spans: trace
  `fedcba9876543210` service `flyer-flight`, `1234567890abcdef` (3 spans); CI
  `deploy-orbiter-prod` sha `9f2c8a1` tag `orbiter-1.4.2`; spans events validate `ok`.
- JQL totals asserted: `project = FLY AND status = "In Progress"` → **2** (FLY-1 + FLY-5);
  smoke compares ORB issue count.

**Rule:** *extend, don't move* — add new entities alongside; when an addition would change a
hard-asserted count/status (e.g. adding another FLY In Progress issue, or more containers),
either choose data that keeps the assertion true, or update the specific test assertion
deliberately and note it. Run the affected suites before finishing.

## 2. Phase A — flesh out the canonical model (`data/*.md`)

**Status: complete.** All eight areas below are done and cross-linked; the doc set now also
includes `emails.md` (the mail universe) and `../AGENT-GUIDE.md` (how to stand up + connect).
The checklist remains the standard for any future extension.

Verify and complete each area in the docs (in this order), keeping ids/keys/tags/timestamps
consistent with §3:

1. **People/ownership** — confirm every component in `components.md` has an owner + SME +
   second; add any missing expertise/backup to the SME directory; ensure every department
   has a named lead.
2. **Tickets** — for EVERY component, define its backlog: at least one ticket per
   component, with real descriptions, acceptance criteria (matching the numbers in
   specs, e.g. `FLY-1` ≤0.5 m), status on the 4-state workflow, priority, labels, assignee
   = the component SME, reporter, comments with authors. Document a per-ticket entry in
   `software-specs.md` or a new `data/tickets.md`.
3. **Confluence** — a page (or pages) for every component/service: full `body.storage`
   XHTML content (headings/lists/code), labels, parent tree under a sensible hierarchy in
   `ENG`, product/vision/research in `PD`; blogposts for releases/announcements. Document
   the page map (id → title → space → parent → topic).
4. **Services & catalog** — `services.json` + `catalog-entities.json` + relations for all
   five repos (add `field-ops-app` when it earns a runtime): dependency edges, `owner`/
   `team:/tier` metadata.
5. **Infrastructure** — containers + processes per service per environment (dev/staging/
   prod hosts), each with `version`, `git.commit.sha`, `deployment:<service>-<env>-<date>`
   tags matching its deploy.
6. **Deployments** — per-pipeline deploy history (`<service>-<env>`) with 7-hex git shas,
   git tags `<service>-<semver>`, branch, status, dates.
7. **Observability** — logs/spans/CI events covering every service + incident + deploy:
   trace chains cross services, incidents carry `ticket:`, heartbeats/waypoints per
   Format v2.
8. **Cross-link map** — one section in `data/README.md` (or `data/links.md`) listing every
   resolvable key: `KEY-n → page id → service → deploy sha → (containers|logs|spans)`.

Document anything you add in the `data/` Markdown (this is the contract); do not jump
straight to seeds.

## 3. Contracts every seed must satisfy

Store schemas (exact field lists — see `mockapis/DESIGN.md` for behaviour):

- `mockapis/seed/users.json` — `{id, name, email, displayName, active, timeZone, accountType}`
- `mockapis/seed/projects.json` — `{id, key, name, projectTypeKey, style, description?}`
- `mockapis/seed/issues.json` — `{id, key, projectKey, summary, description, status, issueType, priority, labels[], assigneeId, reporterId, createdAt, updatedAt}` (enums: status To Do|In Progress|In Review|Done; issueType Epic|Story|Task|Bug|Sub-task|Improvement; priority Highest|High|Medium|Low|Lowest)
- `mockapis/seed/comments.json` — `{id, ownerType: issue|page, ownerId, body, authorId, createdAt, updatedAt}`
- `mockapis/seed/changelog.json` — `{id, issueId, field:"status", from, to, authorId, createdAt}`
- `mockapis/seed/spaces.json` — `{id, key, name, type, description?, homepageId?, createdAt?}`
- `mockapis/seed/content.json` — `{id, type: page|blogpost, title, spaceId, parentId?, bodyStorage, labels[], authorId, version, status:"current", createdAt, updatedAt}`
- `datadog/mock/seed/services.json` — `{name, type, envs[], tags[]}`
- `datadog/mock/seed/catalog-entities.json` — `{id(urn), name, kind, env, definition{}, tags[], refs[]}`
- `datadog/mock/seed/catalog-relations.json` — `{id, kind:"dependency", source, target, tags[]}`
- `datadog/mock/seed/containers.json` — `{id, name, host, image, imageTags[], imageDigest?, state, startedAt?, createdAt?, tags[]}`
- `datadog/mock/seed/processes.json` — `{pid, ppid?, user, host, cmdline, start?, timestamp?, tags[]}`
- `datadog/mock/seed/events.jsonl` — one JSON object per line: `{kind: log|span|ci-pipeline|ci-job, id?, timestamp, message?, service, host?, status, tags[], attributes{}, …}`; spans add `traceId/spanId/parentId/resourceName/durationNs/env`; CI adds `ciLevel/pipeline/gitSha/gitBranch/gitTag/number/url/startedAt`
- `mailmock/seed/contacts.json` — `{id, email, displayName, role?}` (org directory: staff + customers)
- `mailmock/seed/messages.json` — `{id, ownerEmail, folder: inbox|sent|drafts|archive, subject, body, bodyContentType, fromName?, fromEmail?, toRecipients[], ccRecipients[], bccRecipients[], isRead, importance, hasAttachments, conversationId?, internetMessageId?, sentAt?, createdAt, updatedAt}`

Globals/conventions:

- Timestamps 2026, ISO-8601 UTC. Issue ids numeric global-unique; keys `KEY-n` monotonic;
  content ids numeric strings (next after existing max, i.e. > 98320); event ids unique;
  deploy shas 7-hex unique.
- Datadog tags lowercase `k:v`: `env:`, `service:`, `version:`, `git.commit.sha:`,
  `deployment:<service>-<env>-<date>`, `team:`, `ticket:`.
- Every issue about a service carries `service:<name>` — with two deliberate exceptions:
  the legacy anchors `ORB-1..3`/`FLY-1..3` predate the convention (the validator falls back
  to a hardcoded map; see `links.md` and page 98320), and the `CRYPTO` project is
  company-level, not service-scoped (validator skips it). Every related event carries
  `ticket: <KEY-n>`; every container/process git sha matches its deploy; every page that a
  ticket references exists.

## 4. Phase B — generate the seed artifacts

**Status: complete** (passes 1–8, ledger-recorded). The checklist remains the standard.

1. From the completed `data/` docs, produce/update:
   - `mockapis/seed/{users,projects,issues,comments,changelog,spaces,content}.json`
   - `datadog/mock/seed/{api-keys,services,catalog-entities,catalog-relations,containers,processes}.json` + `events.jsonl`
   - `mailmock/seed/{contacts,messages}.json`
   Keep all §1 anchors; schema shapes exactly as §3.
2. **Verification (required):**
   - `cd mockcore && npm test`
   - `cd mockapis && npm test && npm run smoke && npm run harness && npm run coverage`
     (coverage must stay ~8.2%; route surface unchanged unless a route is added)
   - `cd datadog/mock && npm test && npm run smoke && npm run harness && npm run coverage`
     (coverage ~1.0%)
   - `cd mailmock && npm test && npm run smoke && npm run harness` (+ `npm run coverage`)
   - Cross-link check: `node mocks/data/validate-links.mjs` — every `ticket:`/`service:`/
     `git sha` tag in events resolves to an issue/page/deploy; the validator asserts this
     and must pass.
3. Commit per repo (`mockapis`, `datadog/mock`, `mailmock`, and the `mocks/` repo for
   `data/` docs), keeping `data/` (live stores) and `specs/` out of the index.

Run the live-activity feeds (`npm run simulate`) against a booted mock only for demos; they
write to the gitignored live store and never to `seed/`.

## 5. Definition of done

- `data/*.md` tell one coherent story: every component has a ticket, a page, a service,
  an owner/SME, and observable events; every cross-link (ticket ↔ page ↔ service ↔ event ↔
  deploy ↔ email) resolves — accepting the *deliberate* contradictions of the mess layer.
- Seeds are schema-shaped, load directly, and all of §1 anchors are intact.
- All four repos' `npm test` + `npm run smoke` green; the harness covers every implemented
  endpoint (mockapis 126, datadog 16, mailmock 10); coverage unchanged unless a route
  changed; `npm run reset` restores a working demo; the link validator passes.
