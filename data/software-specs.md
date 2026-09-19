# Brightline — software specs

Specs per software project. These are the **contract for generating seed artifacts**:
tickets (Jira `ORB-*`/`FLY-*`), docs (Confluence spaces/pages), infra
(containers/processes), and observability (logs/spans/CI deploys) must all stay consistent
with the services, flows, formats, and incidents defined here.

Conventions: services are Datadog `apm-services` / `catalog-entities`; observability events
carry `service:<name>`, `env:<env>`, `ticket:<KEY-n>`, `git.commit.sha:<sha>`,
`version:<semver>`; deployments carry 7-char git shas.

---

## 1. orbiter-dashboard (`ORB`) — live telemetry & mission replays

| | |
|---|---|
| Purpose | SPA for operators: live drone telemetry, mission replays, fleet overview |
| Stack | TypeScript, React, WebSocket gateway, in-browser chart store |
| Service | `orbiter-dashboard` (web) |
| Owner | Grayson Bell (Orbiter team); design Theo |

**Components / flows**
- **Gateway** — WebSocket hub that fans telemetry frames to connected dashboards.
- **Chart store** — client-side ring buffer; on reconnect it **backfills** from the gateway
  archive API (open incident `ORB-1`).
- **Mission replay player** — reconstructs the live chart from a recorded flight log
  (`ORB-2` self-serve replays for support).
- **Archive API** (owned by telemetry-ingest) supplies missed intervals.

**Known issues / backlog**
- `ORB-1` (Bug, High, In Progress) — chart resets on reconnect; backfill gap.
- `ORB-2` (Story, Medium) — self-serve mission replays for support.
- `ORB-3` (Task, Low, Done) — charting bundle cut to <350kB gzipped.

**Observability expectations**
- Logs: gateway connect/disconnect/backfill events (`ticket: ORB-1`), replay requests,
  bundle/asset warnings.
- Spans: `GET /api/flights/live` trace crossing `orbiter-dashboard` →
  `flyer-gateway` → `telemetry-ingest`.
- Deploy: `deploy-orbiter-prod` (e.g. sha `9f2c8a1`, tag `orbiter-1.4.2`).

## 2. flyer-autopilot (`FLY`) — the drone autopilot

| | |
|---|---|
| Purpose | Autonomy firmware: corridor flying, waypoint control, preflight |
| Stack | Go (operator/companion services), hard-real-time controller |
| Services | `flyer-gateway` (service), `flyer-flight` (service) |
| Owner | Mira Ito (Flyer team) |

**Components / flows**
- **Trajectory smoother** — spline-based path smoothing with curvature clamp on every knot
  (open incident `FLY-1`: overshoot on tight S-turns, max deviation 0.93 m vs 0.5 m
  corridor).
- **Preflight checklist** — REST API the field tablet calls before takeoff: battery, GPS
  lock, firmware version, controller link; returns per-item pass/fail + signed token
  (`FLY-2`).
- **Heartbeat telemetry** — 1Hz controller link quality / CPU / battery logged alongside
  the IMU stream (`FLY-3`, spec in Flight Log Format v2).

**Known issues / backlog**
- `FLY-1` (Bug, Highest, In Progress) — waypoint overshoot, curvature clamp at knots.
- `FLY-2` (Story, Medium) — preflight checklist API for the field app.
- `FLY-3` (Task, Medium, In Review) — heartbeat records in the flight log.

**Observability expectations**
- Logs: waypoint overshoot detected (`ticket: FLY-1`), curvature clamp applied, heartbeat
  write failures (telemetry-ingest `ticket`), preflight pass/fail.
- Spans: `trajectory.smooth` (long, error on overshoot) + `log.parse_segment`
  (flight-log-parser, staging).
- Deploy: `deploy-flyer-gateway-prod` (sha `a1b2c3`, tag `flyer-gw-2.1.0`);
  `deploy-flyer-flight-prod` (sha `6d0e1f`, tag `flyer-flight-0.9.0` — failed smoke in seed).

## 3. telemetry-ingest — the data backbone

| | |
|---|---|
| Purpose | Flight-log ingestion, frame batching, backfill API for Orbiter |
| Stack | Rust, high-throughput JSONL parsing; owns Flight Log Format **v2** |
| Service | `telemetry-ingest` |
| Owner | Ravi Mehta (Platform team) |

**Flight Log Format v2** (spec page `98303`)
- Newline-delimited JSON stream; record types: `imu` (100 Hz), `heartbeat` (1 Hz — `FLY-3`),
  `waypoint` (planned/cleared).
- Validated by the `flightlog` utility in the **flight-log-parser** repo.

**Flows**
- **Frame batching** — telemetry frames batched and handed to Orbiter's chart store.
- **Backfill API** — serves missed intervals after a dashboard reconnect (`ORB-1`).

**Observability expectations**
- Logs: batch ingested (1024 frames), heartbeat write failures (`ticket`), backfill served.
- Spans: `ingest.frames` child of gateway forwarding.
- Deploy: `deploy-telemetry-ingest-prod` (sha `77aa88b`, tag `3.0.1`).

## 4. flight-log-parser

| | |
|---|---|
| Purpose | Decode/validate v2 flight logs; powers replay + parsing in staging |
| Stack | Go |
| Service | `flight-log-parser` (staging only in seeds) |
| Owner | Platform team |

**Flows**
- `parse_segment` span: decode a log segment → events for replay. Staging host
  `fly-staging-1`, `env:staging`, sha `2b4c5d6`, version `0.4.0`.

## 5. field-ops-app — tablet companion (in development)

| | |
|---|---|
| Purpose | Field tablet: preflight checklist, launch, live mission view |
| Stack | TypeScript, React Native |
| Dependencies | `flyer-gateway` preflight API (`FLY-2`), Orbiter mission replays |
| Status | Design + API groundwork (`FLY-2`); not yet deployed to prod seeds |

---

## Cross-project consistency checklist (for seed generation)

1. Every `ORB-*`/`FLY-*` ticket maps to a service and (where relevant) a Confluence page.
2. `service:<name>` + `ticket:<KEY-n>` tags appear on related logs/spans.
3. Containers/processes report `git.commit.sha` matching the deploy that shipped them.
4. A ticket's acceptance criteria (e.g. `FLY-1` ≤0.5 m deviation) match the numbers in
   incident pages and logs (0.93 m in seed).
5. Confluence space `ENG` hosts engineering docs; `PD` hosts product/vision/research.
