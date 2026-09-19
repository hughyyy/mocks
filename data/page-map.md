# Confluence page map — the documentation contract

Page records in `mockapis/seed/content.json` are **anchor-capped**: the CQL
`space = "ENG"` search must return **5** records and `space = "PD"` lists must return **2**
(`HANDOFF.md` §1, `mock.test.js`). Content ids are numeric strings; the next free id is
**98312**. Because of the caps, per-component documentation lives in the bodies of the seven
fixed pages below — no new pages or blogposts are added to ENG/PD.

Space inventory (`spaces.json`):

| Key | Space | Homepage |
|---|---|---|
| `ENG` (id 100) | Engineering | 98301 Welcome to Brightline Engineering |
| `PD` (id 101) | Product | 98310 Product vision 2026 |

## Page map (id → title → space → parent → topic)

| Id | Title | Space | Parent | Topic / coverage |
|---|---|---|---|---|
| 98301 | Welcome to Brightline Engineering | ENG | — | Onboarding; home of the ENG tree (child of 98301: 98302) |
| 98302 | Orbiter Architecture Overview | ENG | 98301 | orbiter-dashboard: **Gateway**, **Chart store**, **Flight log player / mission replay**; references ORB-1 (anchor: body contains "gateway" — labels architecture/orbiter) |
| 98303 | Flight Log Format v2 | ENG | 98301 | telemetry-ingest / flight-log-parser / flyer: v2 record types (imu 100Hz, **heartbeat 1Hz FLY-3**, waypoint); validation via `flightlog` (FLY-5); anchor: body contains "newline-delimited" — labels spec/flyer |
| 98304 | Q3 demo plan | ENG | — | Go-to-market demo: "figure eight" corridor livestreamed to Orbiter (anchor: body contains "figure eight", labels demo/planning); milestones tie FLY-1, FLY-3, ORB-2 |
| 98305 | Incident: waypoint overshoot on tight turns | ENG | 98304 | incident page for FLY-1: timeline 09-01 filed → 09-03 root cause → 09-15 sim repro (0.9m); labels incident/flyer |
| 98310 | Product vision 2026 | PD | — | vision: corridor reliability (FLY-1), self-serve replays (ORB-2); labels vision |
| 98311 | Customer interviews — July | PD | 98310 | research: preflight checklist (FLY-2), replays for customers, longer autonomy; labels research |

## Component → page coverage (every component has a page)

Each component's documentation anchor:

| Component | Page(s) |
|---|---|
| Gateway, Chart store, Archive client, Mission replay player, Fleet dashboards | 98302 |
| Sessions/auth | 98302 (auth section) + ORB-4 (ticket) |
| Trajectory smoother, Waypoint controller | 98304 (demo route), 98305 (incident) |
| Preflight checklist service | 98311 (research ask FLY-2) + 98304 |
| Heartbeat telemetry producer | 98303 (heartbeat record FLY-3) |
| Flight Log Format v2 parser, Frame batching pipeline, Archive/backfill API, Ingest endpoints | 98303 (format + ingest sections) |
| v2 decoder/validator `flightlog`, Replay event streamer | 98303 (validation FLY-5) + 98302 (replay player) |
| field-ops-app (preflight UI, live mission, replay view) | 98302 (replay) + 98311 (research) |
| CI/CD + deploys, Observability/tagging, Incident response, Release planning | 98302 (deploy/observability sections), 98305 (incident), 98310/98311 (planning) |

Body content is XHTML storage (`body.storage`): headings, lists and code samples; every
page that references a ticket (e.g. "See ORB-1") keeps that key resolvable in
`issues.json` (enforced by `validate-links.mjs`).

## Blogposts

`content.json` currently ships no blogposts. Release announcements for Orbiter 1.4.2 / Flyer
gateway 2.1.0 are documented as **planned** under ENG — adding them would raise the seeded
CQL count above the 5-record anchor, so they stay out of the seed and the body anchors above
are preserved byte-identical.
