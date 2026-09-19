# Confluence page map — the documentation contract

Page records in `mockapis/seed/content.json`. Per the **seed build-out pass 3** (ledger), the
documentation tree was deliberately grown: ENG now has **11** content records (7 pages + 2
pages + 2 blogposts), PD has **4** pages. The previously-capped CQL counts
(`space = "ENG"` → 5, `space = "PD"` → 2) were updated in `mock.test.js` / `smoke.js` and
recorded in `seed-build-ledger.md`. Next free content id: **98316**.

Space inventory (`spaces.json`):

| Key | Space | Homepage |
|---|---|---|
| `ENG` (id 100) | Engineering | 98301 Welcome to Brightline Engineering |
| `PD` (id 101) | Product | 98310 Product vision 2026 |

## Page map (id → title → space → parent → topic)

### ENG — Engineering (11 records: 9 pages + 2 blogposts)

| Id | Title | Parent | Topic / coverage |
|---|---|---|---|
| 98301 | Welcome to Brightline Engineering | — | Onboarding; home of the ENG tree |
| 98302 | Orbiter Architecture Overview | 98301 | orbiter-dashboard: Gateway, Chart store, Archive client, Mission replay player, Fleet dashboards, Sessions/auth (ORB-1..4, ORB-8) |
| 98303 | Flight Log Format v2 | 98301 | v2 record types (imu/heartbeat/waypoint), validation (FLY-3, FLY-5) |
| 98304 | Q3 demo plan | — | "figure eight" corridor demo (FLY-1, FLY-3, ORB-2) |
| 98305 | Incident: waypoint overshoot on tight turns | 98304 | incident page for FLY-1 (timeline) |
| 98306 | Telemetry Ingest — ingestion, batching, backfill | 98301 | telemetry-ingest: ingest endpoints, frame batching, archive/backfill API (FLY-3, FLY-4, ORB-1) |
| 98307 | Flight Log Parser — decoder & replay streamer | 98301 | flight-log-parser: `flightlog` validator, replay event streamer (FLY-5, ORB-2) |
| 98308 | Flyer Autopilot Architecture | 98301 | flyer-gateway + flyer-flight: smoother, waypoint, preflight, heartbeat, release gate (FLY-1/2/3/7) |
| 98309 | Field Ops App — tablet companion | 98301 | field-ops-app: preflight UI, live mission, replay view (FLY-2/6, ORB-2) |
| 98312 | Release: Orbiter 1.4.2 + telemetry ingest 3.0.1 | — | **blogpost** — release announcement (ORB-3; shas 9f2c8a1 / 77aa88b) |
| 98313 | Postmortem: flyer-flight 0.9.0 shipped past a red gate | — | **blogpost** — release/incident note (FLY-7, deploy-flyer-flight-prod 6d0e1f) |

### PD — Product (4 pages)

| Id | Title | Parent | Topic |
|---|---|---|---|
| 98310 | Product vision 2026 | — | vision (FLY-1, ORB-2) |
| 98311 | Customer interviews — July | 98310 | research (FLY-2, replays, autonomy) |
| 98314 | Product roadmap — Q4 2026 | 98310 | roadmap (ORB-8, ORB-7, FLY-6) |
| 98315 | Customer interviews — September (Flyer + replays) | 98311 | research (FLY-2, ORB-7) |

## Component → page coverage (every component has a page)

| Component | Page(s) |
|---|---|
| Gateway, Chart store, Archive client, Mission replay player, Fleet dashboards, Sessions/auth | 98302 (architecture); chart store 98302+ORB-5, archive client 98302+ORB-6, replay 98302+ORB-7, fleet 98302+ORB-8 |
| Trajectory smoother, Waypoint controller | 98304 (demo), 98305 (incident), 98308 (architecture) |
| Preflight checklist service | 98308 (architecture), 98309 (field app), 98311 (research) |
| Heartbeat telemetry producer | 98303 (heartbeat record), 98308 (architecture) |
| Flight Log Format v2 parser, Frame batching pipeline, Archive/backfill API, Ingest endpoints | 98303 (format), 98306 (ingest service) |
| v2 decoder/validator `flightlog`, Replay event streamer | 98303 (validation), 98307 (parser service) |
| field-ops-app (preflight UI, live mission, replay view) | 98309 (field app) + 98302 (replay) + 98311/98315 (research) |
| CI/CD + deploys, Observability/tagging, Incident response, Release planning | 98308 (release gate), 98313 (postmortem), 98305 (incident), 98314 (roadmap), 98310/98311 (planning) |

Body content is XHTML storage (`body.storage`): headings, lists and code samples; every page
that references a ticket (e.g. "See ORB-1") keeps that key resolvable in `issues.json`
(enforced by `validate-links.mjs`).

## Blogposts

Release announcements and postmortems live in ENG as `type: blogpost`: `98312` (Orbiter
1.4.2 + ingest 3.0.1 release) and `98313` (flyer-flight 0.9.0 red-gate postmortem). They
count toward the ENG CQL total (11), so the CQL assertion was updated deliberately in pass 3.
