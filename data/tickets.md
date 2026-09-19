# Ticket backlog — the Jira contract

Every component in `components.md` has at least one ticket in this backlog. Ticket records
below are the **canonical contract** for `mockapis/seed/issues.json` (plus `comments.json`
and `changelog.json`). The "Seed?" column states whether the record is shipped in the seed:
everything marked `seed` is loaded verbatim, and the asserted anchors listed in
`HANDOFF.md` §1 stay byte-identical.

Conventions (from `HANDOFF.md` §3):

- Status on the 4-state workflow: `To Do | In Progress | In Review | Done`.
- Assignee = the component SME (from `components.md` §2); reporter = the person who filed it.
- Priority: `Highest | High | Medium | Low | Lowest`.
- Labels are free-form; new tickets carry `service:<name>` to satisfy the cross-link global
  ("every issue about a service carries `service:<name>`").
- Timestamps are 2026 ISO-8601 UTC.

## Ownership coverage (verified)

Every component in `components.md` §2 already has an owner + SME + second and every
department has a named lead (`organisation.md` §3). No gaps found; no doc changes needed
beyond the backlog below. Where the seed's ticket assignee predates the component SME
(e.g. `FLY-2` assignee is jo, `ORB-2` assignee is mira), the **seed value wins** — it is a
hard anchor; the SME directory in `components.md` is unchanged.

## ORB (Orbiter team → service `orbiter-dashboard`)

| Key | Summary | Type | Priority | Status | Assignee | Reporter | Seed? |
|---|---|---|---|---|---|---|---|
| `ORB-1` | Live telemetry chart loses history after reconnect | Bug | High | In Progress | ada | grayson | seed (anchor) |
| `ORB-2` | Self-serve mission replays for support | Story | Medium | To Do | mira | jo | seed (anchor) |
| `ORB-3` | Upgrade charting library to reduce bundle size | Task | Low | Done | grayson | ada | seed (anchor) |
| `ORB-4` | Session tokens must survive redeploys | Bug | High | In Progress | ada | grayson | seed |
| `ORB-5` | Chart store backfill progress indicator | Story | Medium | To Do | nina | grayson | seed |
| `ORB-6` | Archive client retry with backoff on failed backfill | Bug | Medium | To Do | grayson | ravi | seed |
| `ORB-7` | Replay player: seek and scrubbing controls | Story | Medium | To Do | nina | theo | seed |
| `ORB-8` | Fleet overview: live mission status aggregation | Story | Medium | To Do | grayson | jo | seed |

### ORB-1 — Live telemetry chart loses history after reconnect (anchor)

- Components: Gateway, Chart store, Archive client (`components.md` §2).
- Description: "When the Orbiter dashboard's WebSocket to the gateway drops and reconnects,
  the live telemetry chart resets to an empty window instead of backfilling the gap. Users
  watching long demo runs lose context on every reconnect.\n\nExpected behaviour: on
  reconnect, the chart should request the missed interval from the gateway and continue the
  trend line without a visible jump." (contains `backfill`)
- Labels: `[telemetry, orbiter, reconnect]` (anchor). Service: orbiter-dashboard.
- Comments (exactly 2 — anchor):

| # | Author | Date | Body |
|---|---|---|---|
| 10000 | grayson | 2026-08-11 | Reproduced on the staging gateway. It looks like the client clears its buffer on socket close before the reconnect handler runs. |
| **10001** | ada | 2026-08-12 | Root cause confirmed: the chart store treats the socket close as a reset. I am moving the buffer clear to the 'stale' path instead. |

  `comment id 10001` is **ORB-1's second comment** — anchor.

### ORB-2 — Self-serve mission replays for support (anchor)

- Component: Mission replay player.
- Description: "Support currently asks engineering for screen recordings when a flight issue
  is reported. Add a read-only mission replay page in Orbiter that reconstructs the live
  chart from the flight log, so support can attach a replay URL instead."
- Labels: `[mission, support, orbiter]` (anchor). Service: orbiter-dashboard.

### ORB-3 — Upgrade charting library to reduce bundle size (anchor)

- Component: Fleet dashboards / chart rendering.
- Description: "The Orbiter dashboard ships ~640kB of charting JS. Most of it is for features
  we do not use. Evaluate swapping to a smaller tree-shakeable renderer and cut the initial
  bundle target to under 350kB gzipped."
- Labels: `[perf, orbiter]` (anchor). Service: orbiter-dashboard.
- Comment 10002 (grayson, 2026-07-28): "Merged. Bundle is now 312kB gzipped; the telemetry
  chart renders 30% faster in the profiler."

### ORB-4 — Session tokens must survive redeploys

- Component: Sessions/auth (Ada, cross-cutting).
- Description: "Users are logged out every time staging is redeployed. Session tokens issued
  before a deploy are rejected by the session store afterwards.\n\nAcceptance: a token issued
  before a deploy is still accepted after it; only explicitly revoked tokens are rejected."
- Labels: `[auth, prod-readiness, orbiter, service:orbiter-dashboard]`. Service: orbiter-dashboard.
- Comments 10016 (grayson, 08-14: reproduced on staging) + 10017 (ada, 08-15: root cause —
  session store flushes on deploy). Changelog 7 (To Do → In Progress, ada, 08-15).
- **Seed build-out pass 2** (ledger): previously documented-only so the create contract
  yielded `ORB-4`; now seeded. Next ORB auto-key is **ORB-9**.

### ORB-5 — Chart store backfill progress indicator

- Component: Chart store (Nina, backfill to Grayson).
- Description: "During the reconnect backfill (ORB-1) the live chart shows a silent gap for
  up to two minutes. Surface a progress indicator so operators know history is still
  loading.\n\nAcceptance: the chart shows a backfill progress ring and a 'live' state once
  the missed interval is contiguous."
- Labels: `[telemetry, orbiter, chart-store, service:orbiter-dashboard]`. Comment 10018
  (nina, 09-20: progress ring ties to the ORB-1 fix).

### ORB-6 — Archive client retry with backoff on failed backfill

- Component: Archive client (Grayson; server counterpart is FLY-4).
- Description: "When the archive API returns a stale or empty window (see FLY-4) the Orbiter
  archive client treats it as final and shows truncated history. Retry with exponential
  backoff until the archive returns data current to the request time.\n\nAcceptance: a failed
  backfill retries up to 3 times with backoff; the chart renders the contiguous window."
- Labels: `[telemetry, orbiter, archive, service:orbiter-dashboard]`. Comment 10019 (ravi,
  09-21: pairs with FLY-4 stale-window root cause).

### ORB-7 — Replay player: seek and scrubbing controls

- Component: Mission replay player (Nina; UX Theo).
- Description: "Support replays (ORB-2) can only play start-to-finish. Add seek and scrub to
  the replay player so support can jump straight to the problem window in a mission
  recording.\n\nAcceptance: seeking to any offset renders the chart state for that timestamp
  within 1s."
- Labels: `[replay, orbiter, service:orbiter-dashboard]`. Comment 10020 (theo, 09-20: mocked
  seek + scrub against a support replay).

### ORB-8 — Fleet overview: live mission status aggregation

- Component: Fleet dashboards (Grayson).
- Description: "The Q3 demo follow-up: a fleet overview card that aggregates live mission
  status (flying, preflight, grounded) from the gateway's active sessions.\n\nAcceptance:
  fleet cards reflect gateway state within 5s; demo route flights surface as 'flying'."
- Labels: `[fleet, orbiter, dashboard, service:orbiter-dashboard]`. Comment 10021 (jo, 09-19:
  Q3 demo follow-up, wires mission status from the live trace).

## FLY (Flyer team → services `flyer-flight`, `flyer-gateway`; platform/ops as relevant)

| Key | Summary | Type | Priority | Status | Assignee | Reporter | Seed? |
|---|---|---|---|---|---|---|---|
| `FLY-1` | Waypoint smoothing causes overshoot on tight turns | Bug | Highest | In Progress | mira | grayson | seed (anchor) |
| `FLY-2` | Preflight checklist API for field app | Story | Medium | To Do | jo | mira | seed (anchor) |
| `FLY-3` | Add heartbeat telemetry to flight log | Task | Medium | In Review | mira | ada | seed (anchor) |
| `FLY-4` | Archive backfill cache serves stale interval after reconnect | Bug | Medium | To Do | ravi | grayson | seed |
| `FLY-5` | flightlog validator must reject malformed heartbeat records | Task | Medium | To Do | clara | ravi | seed |
| `FLY-6` | Field app: tablet preflight checklist and live mission view | Story | High | To Do | sam | jo | seed |
| `FLY-7` | Smoke-test gate must block rollout on failure | Bug | High | In Review | ada | mira | seed |
| `FLY-8` | Standardize deployment and ticket tags across services | Task | Medium | In Review | ravi | ada | seed |

Status note (anchor): **exactly one FLY issue is `In Progress` (`FLY-1`)** — the JQL
`project = FLY AND status = "In Progress"` contract asserts a single hit.

### FLY-1 — Waypoint smoothing causes overshoot on tight turns (anchor)

- Components: Trajectory smoother, Waypoint controller.
- Description: "Flyer's trajectory smoother generates a path that overshoots the next
  waypoint on tight S-turns, pushing the drone outside the planned corridor. Observed on the
  demo 'figure eight' route with the default smoothing radius.\n\nAcceptance: no overshoot
  outside 0.5m of the corridor on the stock demo routes."
- Labels: `[flight, trajectory, flyer]`. Service: flyer-flight.
- Comments:

| # | Author | Date | Body |
|---|---|---|---|
| 10003 | mira | 2026-09-03 | The smoothing spline clamps curvature only at endpoint speed, so it cuts corners under constant speed. Proposed: curvature clamp on every spline knot. |
| 10004 | grayson | 2026-09-15 | Logged a repro flight on the simulator (see Flight Log Format v2 spec). Max deviation was 0.9m. |

- Observability: overshoot log (`deviation 0.93m`) + `trajectory.smooth` error span, incident
  page 98305, demo page 98304.

### FLY-2 — Preflight checklist API for field app (anchor)

- Component: Preflight checklist service (field-ops-app preflight).
- Description: "Expose a REST endpoint the field tablet app calls before takeoff: battery, GPS
  lock, firmware version, controller link. Return pass/fail per item plus a signed checklist
  token the flight controller can verify."
- Labels: `[preflight, api, flyer]`. Service: flyer-gateway.

### FLY-3 — Add heartbeat telemetry to flight log (anchor)

- Components: Heartbeat telemetry producer (flyer), Flight Log Format v2 parser (ingest).
- Description: "Log a 1Hz heartbeat record (controller link quality, CPU load, battery
  voltage) alongside the existing IMU stream so post-flight analysis can correlate drops with
  subsystem stress."
- Labels: `[telemetry, flyer, flight-log]`. Service: telemetry-ingest.
- Comment 10015 (clara, 2026-09-16): "Format v2 heartbeat record looks good; strict parser
  coverage is tracked under FLY-5."
- Page: 98303 (Flight Log Format v2).

### FLY-4 — Archive backfill cache serves stale interval after reconnect

- Component: Archive / backfill API (telemetry-ingest). Feeds ORB-1.
- Assignee ravi (telemetry-ingest SME); reporter grayson.
- Description: "The telemetry-ingest archive API keeps a per-interval results cache that is
  not invalidated when new frames arrive, so a dashboard reconnect can be backfilled with a
  stale, truncated window.\n\nAcceptance: a backfill for an interval that is still receiving
  frames returns the frames available at request time and invalidates the cache key on the
  next batch."
- Labels: `[telemetry, ingest, backfill, service:telemetry-ingest]`. Comments:

| # | Author | Date | Body |
|---|---|---|---|
| 10005 | ravi | 2026-09-19 | The archive cache held a stale interval after the 13:02 reconnect; reproduced against prod ingest. |
| 10006 | grayson | 2026-09-19 | ORB-1 depends on this — the dashboard backfill only works if the archive serves the true missed window. |

### FLY-5 — flightlog validator must reject malformed heartbeat records

- Component: v2 decoder/validator `flightlog` (flight-log-parser).
- Assignee clara (parser SME); reporter ravi.
- Description: "The flightlog decoder accepts heartbeat records with missing fields,
  producing silently corrupt logs. Make validation strict per Flight Log Format v2 (page
  98303): a malformed 1Hz heartbeat fails with the line number and the offending
  field.\n\nAcceptance: any deviation from the v2 record schema exits non-zero and names the
  line + field."
- Labels: `[flight-log, parser, validity, service:flight-log-parser]`. Comments:

| # | Author | Date | Body |
|---|---|---|---|
| 10007 | clara | 2026-09-18 | Drafted a parser test where a 1Hz heartbeat with a dropped header must fail with a line number. |
| 10008 | ravi | 2026-09-18 | Agreed: fail loudly, reference the FLY-3 record format so the error message names the field. |

### FLY-6 — Field app: tablet preflight checklist and live mission view

- Component: field-ops-app (Preflight checklist UI, Live mission view).
- Assignee sam (field SME); reporter jo.
- Description: "Build the tablet companion (field-ops-app) around the FLY-2 preflight API:
  run battery/GPS/firmware/link checks, block launch on any fail, and mirror the Orbiter live
  chart during flight.\n\nAcceptance: preflight blocks launch on a fail item; the live
  mission view tracks the Orbiter chart within 1s."
- Labels: `[field-ops, preflight, orbiter, service:flyer-gateway]`. Comments:

| # | Author | Date | Body |
|---|---|---|---|
| 10009 | sam | 2026-09-16 | The preflight gate must block takeoff when the tablet shows a fail item — no override. |
| 10010 | theo | 2026-09-17 | Sharing the flow draft: battery → GPS → firmware → link, then a signed token on the mission view. |

### FLY-7 — Smoke-test gate must block rollout on failure

- Component: CI/CD + deploys (Ada, cross-cutting). References deploy-flyer-flight-prod #189.
- Assignee ada (CI/CD SME); reporter mira.
- Description: "deploy-flyer-flight-prod #189: the smoke-test job failed but the rollout
  proceeded and shipped flyer-flight 0.9.0 to prod. The gate asserted the wrong artifact
  digest.\n\nAcceptance: a red smoke-test job stops the pipeline before rollout; the shipped
  container version must match the pipeline gitTag."
- Labels: `[ci, deployment, flyer, service:flyer-flight]`. Comments:

| # | Author | Date | Body |
|---|---|---|---|
| 10011 | ada | 2026-09-15 | The deploy-flyer-flight-prod #189 smoke-test job failed but the rollout proceeded to 0.9.0. |
| 10012 | clara | 2026-09-16 | Root cause: the smoke gate checked the wrong artifact digest. New gate asserts pod health after rollout. |

- Observability: the seed's `deploy-flyer-flight-prod` pipeline is `status: error` with a
  failed `smoke-test` ci-job (see `operations.md`).

### FLY-8 — Standardize deployment and ticket tags across services

- Component: Observability/tagging conventions (Ravi).
- Assignee ravi (observability SME); reporter ada.
- Description: "Enforce the observability conventions (env:, service:,
  deployment:<svc>-<env>-<date>, git.commit.sha:, ticket:) on every event emitted by the five
  services, and make the cross-link validator a CI check.\n\nAcceptance: every event carries
  env/service; every deploy event carries a git sha; the link validator passes."
- Labels: `[observability, tags, platform, service:telemetry-ingest]`. Comments:

| # | Author | Date | Body |
|---|---|---|---|
| 10013 | ravi | 2026-09-17 | Inventory of services missing deployment:/ticket: tags — mostly staging. |
| 10014 | ada | 2026-09-18 | Lock the convention list in the observability page and make the link validator part of CI. |

## Changelog (status history, seed `changelog.json`)

| # | Issue | From | To | Author | Date |
|---|---|---|---|---|---|
| 1 | ORB-3 | To Do | In Progress | ada | 2026-07-10 |
| 2 | ORB-3 | In Progress | Done | ada | 2026-07-28 |
| 3 | FLY-1 | To Do | In Progress | mira | 2026-09-02 |
| 4 | FLY-3 | To Do | In Review | mira | 2026-09-15 |
| 5 | FLY-7 | To Do | In Review | ada | 2026-09-16 |
| 6 | FLY-8 | To Do | In Review | ravi | 2026-09-17 |

## Cross-links every ticket must resolve

- `service:` labels/resolution → see `links.md`.
- `FLY-1` ↔ incident page 98305 + demo page 98304 + `trajectory.smooth` error span (ticket:FLY-1).
- `FLY-3` ↔ page 98303 (heartbeat record) + FLY-5 (validation) + heartbeat log in ingest.
- `ORB-1` ↔ page 98302 + gateway logs (ticket:ORB-1) + ingest backfill span (span_30010).
- `ORB-2` ↔ page 98302 replay + replay span (span_30008, ticket:ORB-2).
- `FLY-2` ↔ page 98303-adjacent preflight + preflight span (span_30006, ticket:FLY-2).
- `FLY-7` ↔ failed deploy-flyer-flight-prod pipeline (gitSha 6d0e1f).
