# Handoff — complete the fictional universe, then generate seed artifacts

**Mission:** (1) flesh out the remaining detail in the canonical model under `data/`
(organisation, components, software specs, relationships, owners/SMEs) until the "whole
picture" is coherent; then (2) generate the **actual schema-shaped seed artifacts** for both
mock repos, derived from `data/`, keeping every suite green.

Read first: `data/README.md` (entity model + conventions), `organisation.md`, `components.md`
(component catalog + owners/SMEs), `software-specs.md` (per-project specs + consistency
checklist), then `mockapis/DESIGN.md` (store schemas) and `../AGENTS.md` (invariants).

---

## 1. What already exists (do not regress)

- **Brightline Robotics**: business, 6 departments/teams, 12 staff, 5 repos, environments,
  products — `organisation.md`.
- **Component catalog**: ~24 components with owner/SME/second + relationship wiring —
  `components.md`.
- **Software specs**: services, flows, Flight Log Format v2, incidents, deploy tags —
  `software-specs.md`.
- **Working seeds** (already schema-shaped and **tested**): `mockapis/seed/*` and
  `datadog/mock/seed/*`. Tests: mockapis 36/36 + smoke, datadog 16/16 + smoke, coverage
  Jira 52 + Conf 27 + Datadog 16.

**Critical: the tests assert specific seed values.** These anchors must stay byte-identical:

- Jira — `ORB-1` (summary "Live telemetry chart loses history after reconnect", status
  In Progress, type Bug, priority High, labels `[telemetry,orbiter,reconnect]`, assignee
  ada, reporter grayson, **2 comments**, description contains "backfill"), `ORB-2`
  "Self-serve mission replays for support", `ORB-3`, `ORB-4..8` (seed build-out pass 2),
  `FLY-1` (In Progress), `FLY-2`, `FLY-3`; projects `ORB`/`FLY`;
  comment id **10001 = ORB-1's second comment**; next key `ORB-9`.
  (Deliberate anchor edits made during the seed build-out — including this one — are
  recorded in [`seed-build-ledger.md`](./seed-build-ledger.md).)
- Confluence — spaces `ENG`(id 100)/`PD`(101); pages `98301` Welcome, `98302` Orbiter
  Architecture Overview (parent 98301, labels architecture/orbiter, body contains
  "gateway"), `98303` Flight Log Format v2 (body "newline-delimited"), `98304` Q3 demo plan
  (ENG, labels demo, body "figure eight"), `98305` incident, `98306` ingest, `98307`
  parser, `98308` flyer architecture, `98309` field-ops, `98312`/`98313` ENG blogposts,
  `98310/98311/98314/98315` PD; `PD` has **4** pages; ENG CQL search size **11**
  (9 pages + 2 blogposts); next content id `98316`.
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

Globals/conventions:

- Timestamps 2026, ISO-8601 UTC. Issue ids numeric global-unique; keys `KEY-n` monotonic;
  content ids numeric strings (next after existing max, i.e. > 98311); event ids unique;
  deploy shas 7-hex unique.
- Datadog tags lowercase `k:v`: `env:`, `service:`, `version:`, `git.commit.sha:`,
  `deployment:<service>-<env>-<date>`, `team:`, `ticket:`.
- Every issue about a service carries `service:<name>`; every related event carries
  `ticket: <KEY-n>`; every container/process git sha matches its deploy; every page that a
  ticket references exists.

## 4. Phase B — generate the seed artifacts

1. From the completed `data/` docs, produce/update:
   - `mockapis/seed/{users,projects,issues,comments,changelog,spaces,content}.json`
   - `datadog/mock/seed/{api-keys,services,catalog-entities,catalog-relations,containers,processes}.json` + `events.jsonl`
   Keep all §1 anchors; schema shapes exactly as §3.
2. **Verification (required):**
   - `cd mockcore && npm test`
   - `cd mockapis && npm test && npm run smoke && npm run coverage` (coverage must stay
     ~79/967; route surface unchanged)
   - `cd datadog/mock && npm test && npm run smoke && npm run coverage`
   - Cross-link check: every `ticket:`/`service:`/`git sha` tag in events resolves to an
     issue/page/deploy; log or add a small `mocks/data/validate-links.mjs` that asserts
     this and passes.
3. Commit per repo (`mockapis`, `datadog/mock`, and the `mocks/` repo for `data/` docs),
   keeping `data/` (live stores) and `specs/` out of the index.

## 5. Definition of done

- `data/*.md` tell one coherent story: every component has a ticket, a page, a service,
  an owner/SME, and observable events; every cross-link resolves.
- Seeds are schema-shaped, load directly, and all of §1 anchors are intact.
- All three repos' `npm test` + `npm run smoke` green; coverage unchanged; `npm run reset`
  restores a working demo; the link validator passes.
