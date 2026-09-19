# Operations — services, catalog, infrastructure, deploys & observability

Runtime view of the five repos (`software-specs.md` §"Cross-project consistency checklist").
This is the contract for `datadog/mock/seed/*` (services, catalog-entities,
catalog-relations, containers, processes) and `events.jsonl` (logs/spans/CI).

Conventions (`HANDOFF.md` §3): Datadog tags lowercase `k:v` — `env:`, `service:`,
`version:`, `git.commit.sha:`, `deployment:<service>-<env>-<date>`, `team:`, `ticket:`;
spans add `traceId/spanId/parentId/resourceName/durationNs/env`; CI adds
`ciLevel/pipeline/gitSha/gitBranch/gitTag/number/url/startedAt`.

**Seed caps (anchors):** containers = **12** records (per-service-per-env, seed build-out
pass 4); logs (`kind:log` events) = **11** records (per-service coverage, seed build-out
pass 5). `HANDOFF.md` §1 asserts these exact counts, so the infra/log tables below are a
complete snapshot; spans and CI events are extensible.

## 1. Services & catalog

`services.json` (APM) — repo ↔ service 1:1 except `flyer-autopilot` (two services) and
`field-ops-app` (no runtime yet; added "when it earns a runtime" per HANDOFF §2.4):

| Service | Type | Envs | Language | Team |
|---|---|---|---|---|
| `orbiter-dashboard` | web | prod, staging, dev | TypeScript | orbiter |
| `flyer-gateway` | service | prod, staging | Go | flyer |
| `flyer-flight` | service | prod, staging, dev | Go | flyer |
| `telemetry-ingest` | service | prod, staging | Rust | platform |
| `flight-log-parser` | service | staging, dev | Go | flyer |

`catalog-entities.json` (one per service, `urn:dd:service:<name>:<env>`): prod entities for
orbiter-dashboard / flyer-gateway / flyer-flight / telemetry-ingest, staging for
flight-log-parser; `definition` carries `owner: <team>@brightline.dev`, `lifecycle`, `tier`.

`catalog-relations.json` (dependency edges, `kind: dependency`):

| Source | Target | Env |
|---|---|---|
| orbiter-dashboard | flyer-gateway | production |
| orbiter-dashboard | telemetry-ingest | production |
| flyer-gateway | flyer-flight | production |
| flyer-gateway | telemetry-ingest | production |
| flyer-flight | telemetry-ingest | production |
| flyer-flight | flight-log-parser | staging |
| orbiter-dashboard | flight-log-parser | staging (replay path) |

The first six relations are asserted (`relation_to=orbiter-dashboard` → flyer-gateway +
telemetry-ingest; `relation_to=flyer-gateway` → source flyer-gateway).

## 2. Infrastructure — containers

`containers.json` — exactly **12** records (anchor count): one container per declared
service/environment pair (prod/staging/dev). Each container's `git.commit.sha` matches the
deploy that shipped it (resolved via section 3) and carries a
`deployment:<service>-<env>-<date>` tag naming that deploy. Only one production
`orbiter-dashboard` container exists (`orb-prod-7`) — the prod-orbiter filter assertion
depends on it.

| Container | Service | Host | Env | Image tag | git sha | Deployment tag |
|---|---|---|---|---|---|---|
| c-1a2b3c | orbiter-dashboard | orb-prod-7 | production | 1.4.2 | 9f2c8a1 | deployment:orbiter-prod-2026-09-10 |
| c-4d5e6f | orbiter-dashboard | orb-staging-2 | staging | 1.4.1 | 1e3f9b2 | deployment:orbiter-staging-2026-09-08 |
| c-7g8h9i | flyer-gateway | fly-prod-3 | production | 2.1.0 | a1b2c3 | deployment:flyer-gateway-prod-2026-09-12 |
| c-j0k1l2 | flyer-flight | fly-prod-4 | production | 0.9.0 | 6d0e1f | deployment:flyer-flight-prod-2026-09-15 |
| c-m3n4o5 | telemetry-ingest | tel-prod-1 | production | 3.0.1 | 77aa88b | deployment:telemetry-ingest-prod-2026-09-01 |
| c-n1o2p3 | orbiter-dashboard | orb-dev-1 | dev | 1.4.0 | d3e4f5a | deployment:orbiter-dev-2026-09-05 |
| c-q4r5s6 | flyer-gateway | fly-staging-2 | staging | 2.0.9 | 4b5c6d7 | deployment:flyer-gateway-staging-2026-09-11 |
| c-t7u8v9 | flyer-flight | fly-staging-3 | staging | 0.9.0-rc1 | e5f6a7b | deployment:flyer-flight-staging-2026-09-14 |
| c-w0x1y2 | flyer-flight | fly-dev-2 | dev | 0.9.0-dev | c7d8e9f | deployment:flyer-flight-dev-2026-09-13 |
| c-z3a4b5 | telemetry-ingest | tel-staging-1 | staging | 3.0.0 | b2c3d4e | deployment:telemetry-ingest-staging-2026-08-30 |
| c-c6d7e8 | flight-log-parser | fly-staging-1 | staging | 0.4.0 | 2b4c5d6 | deployment:flight-log-parser-staging-2026-09-16 |
| c-f9g0h1 | flight-log-parser | fly-dev-3 | dev | 0.4.0-dev | 8e9f0a1 | deployment:flight-log-parser-dev-2026-09-15 |

## 3. Deployments (per-pipeline history)

`ci-pipeline` / `ci-job` events carry `gitSha` (7-hex), `gitTag <service>-<semver>`, branch
`main`, status. Container/process shas resolve to these deploys.

| Deploy pipeline | Service | Env | Sha | Tag | Status | Date |
|---|---|---|---|---|---|---|
| deploy-orbiter-prod | orbiter-dashboard | prod | 9f2c8a1 | orbiter-1.4.2 | success | 2026-09-10 |
| deploy-orbiter-staging | orbiter-dashboard | staging | 1e3f9b2 | orbiter-1.4.1 | success | 2026-09-08 |
| deploy-flyer-gateway-prod | flyer-gateway | prod | a1b2c3 | flyer-gw-2.1.0 | success | 2026-09-12 |
| deploy-flyer-flight-prod | flyer-flight | prod | 6d0e1f | flyer-flight-0.9.0 | **error** | 2026-09-15 |
| deploy-telemetry-ingest-prod | telemetry-ingest | prod | 77aa88b | telemetry-ingest-3.0.1 | success | 2026-09-01 |
| deploy-flight-log-parser-staging | flight-log-parser | staging | 2b4c5d6 | flight-log-parser-0.4.0 | success | 2026-09-16 |
| deploy-orbiter-dev | orbiter-dashboard | dev | d3e4f5a | orbiter-1.4.0 | success | 2026-09-05 |
| deploy-flyer-gateway-staging | flyer-gateway | staging | 4b5c6d7 | flyer-gw-2.0.9 | success | 2026-09-11 |
| deploy-flyer-flight-staging | flyer-flight | staging | e5f6a7b | flyer-flight-0.9.0-rc1 | success | 2026-09-14 |
| deploy-flyer-flight-dev | flyer-flight | dev | c7d8e9f | flyer-flight-0.9.0-dev | success | 2026-09-13 |
| deploy-telemetry-ingest-staging | telemetry-ingest | staging | b2c3d4e | telemetry-ingest-3.0.0 | success | 2026-08-30 |
| deploy-flight-log-parser-dev | flight-log-parser | dev | 8e9f0a1 | flight-log-parser-0.4.0-dev | success | 2026-09-15 |

Notable: `deploy-flyer-flight-prod` shipped 0.9.0 past a **red** `smoke-test` job —
tracked as FLY-7 (see `tickets.md`); the `deploy-flyer-flight-prod` pipeline + smoke-test
job keep `status: error` in the seed.

## 4. Infrastructure — processes

`processes.json` — one long-running process per running container plus staging/dev
workers (count `>= 4` is the only assertion, so processes are extensible). Each carries the
same `deployment:` tag as its container's deploy.

| Host | Service | Env | cmdline | git sha | version | Deployment tag |
|---|---|---|---|---|---|---|
| orb-prod-7 | orbiter-dashboard | production | node … dist/server.js | 9f2c8a1 | 1.4.2 | deployment:orbiter-prod-2026-09-10 |
| orb-staging-2 | orbiter-dashboard | staging | node … dist/server.js | 1e3f9b2 | 1.4.1 | deployment:orbiter-staging-2026-09-08 |
| fly-prod-3 | flyer-gateway | production | flyer-gateway --config … | a1b2c3 | 2.1.0 | deployment:flyer-gateway-prod-2026-09-12 |
| fly-prod-4 | flyer-flight | production | flyer-flight --mode operator | 6d0e1f | 0.9.0 | deployment:flyer-flight-prod-2026-09-15 |
| tel-prod-1 | telemetry-ingest | production | telemetry-ingest run --workers 8 | 77aa88b | 3.0.1 | deployment:telemetry-ingest-prod-2026-09-01 |
| fly-staging-1 | flight-log-parser | staging | flyer-gw flightlog --parse-log /var/log/flight.v2.jsonl | 2b4c5d6 | 0.4.0 | deployment:flight-log-parser-staging-2026-09-16 |
| orb-dev-1 | orbiter-dashboard | dev | node … dist/server.js | d3e4f5a | 1.4.0 | deployment:orbiter-dev-2026-09-05 |
| fly-staging-2 | flyer-gateway | staging | flyer-gateway --config … | 4b5c6d7 | 2.0.9 | deployment:flyer-gateway-staging-2026-09-11 |
| fly-staging-3 | flyer-flight | staging | flyer-flight --mode operator | e5f6a7b | 0.9.0-rc1 | deployment:flyer-flight-staging-2026-09-14 |
| fly-dev-2 | flyer-flight | dev | flyer-flight --mode sim | c7d8e9f | 0.9.0-dev | deployment:flyer-flight-dev-2026-09-13 |
| tel-staging-1 | telemetry-ingest | staging | telemetry-ingest run --workers 4 | b2c3d4e | 3.0.0 | deployment:telemetry-ingest-staging-2026-08-30 |
| fly-dev-3 | flight-log-parser | dev | flightlog --watch /var/log/flight.v2.jsonl | 8e9f0a1 | 0.4.0-dev | deployment:flight-log-parser-dev-2026-09-15 |

## 5. Observability — events.jsonl

One stream, `kind: log | span | ci-pipeline | ci-job`. **Logs are capped at 11** (anchor)
and cover every service plus the three prod incidents; spans/CI extend to every service,
deploy and feature ticket.

### Logs (11 — exhaustive)

| Id | Service | Status | Message | ticket |
|---|---|---|---|---|
| log_10001 | orbiter-dashboard | error | websocket client disconnected; buffer cleared before reconnect backfill | ORB-1 |
| log_10002 | orbiter-dashboard | info | backfill requested for interval 13:00-13:02 after reconnect | ORB-1 |
| log_10003 | flyer-flight | error | waypoint overshoot detected: deviation 0.93m outside corridor | FLY-1 |
| log_10004 | flyer-flight | info | spline curvature clamp applied; replanning segment after wp-6 | — (FLY-1 context) |
| log_10005 | telemetry-ingest | warn | heartbeat telemetry write failed: buffer full | — (FLY-3 context) |
| log_10006 | telemetry-ingest | info | telemetry frame batch ingested (1024 frames) | — |
| log_10007 | orbiter-dashboard | info | session resumed; chart-store backfill resynced 4h of live history | ORB-4 |
| log_10008 | flyer-gateway | info | preflight checklist verified for mission F-0142: battery, gps, firmware, link ok | FLY-2 |
| log_10009 | flyer-gateway | warn | checklist token near expiry; re-signed before departure | FLY-2 |
| log_10010 | flight-log-parser | info | flightlog v2 segment parsed (wp-6..wp-7, 2048 records) | FLY-5 |
| log_10011 | flight-log-parser | warn | malformed v2 frame dropped (bad checksum at offset 0x1F2C4) | FLY-5 |

Search contract: query `overshoot` → exactly 1 hit with `ticket: FLY-1` (so no new log may
contain "overshoot").

### Spans

Trace `1234567890abcdef` — live telemetry path (3 spans, all `ok`):
`orbiter-dashboard` `GET /api/flights/live` → `flyer-gateway` `gateway.forward_frame` →
`telemetry-ingest` `ingest.frames`.

Trace `fedcba9876543210` — FLY-1 incident (root span `error`):
`flyer-flight` `trajectory.smooth` (error, `ticket: FLY-1`, deviation 0.93m) →
`flight-log-parser` `log.parse_segment` (staging, ok).

Extensible spans (new, all resolve — validated):

| Id | Trace | Service | Resource | Env | ticket |
|---|---|---|---|---|---|
| span_30006 | a1b2c3d4e5f68790 | flyer-gateway | preflight.check | staging | FLY-2 |
| span_30007 | a1b2c3d4e5f68790 | flyer-gateway | checklist.token_sign | staging | FLY-2 |
| span_30008 | bb00bb00bb00bb00 | flight-log-parser | replay.parse_segment | staging | ORB-2 |
| span_30009 | bb00bb00bb00bb00 | flight-log-parser | replay.event_stream | staging | ORB-2 |
| span_30010 | cc11cc11cc11cc11 | telemetry-ingest | ingest.backfill | production | ORB-1 |

Anchor note: the aggregate-by-service span count asserts **exactly one `orbiter-dashboard`
span** (`GET /api/flights/live`) — replay (ORB-2) and preflight (FLY-2) traces are therefore
spanned on `flight-log-parser` / `flyer-gateway` respectively, not on orbiter-dashboard.

### CI events

Kept from seed (anchors): `deploy-orbiter-prod` pipeline+job (sha 9f2c8a1, tag
orbiter-1.4.2, success); `deploy-flyer-gateway-prod` pipeline (success); `deploy-flyer-flight-prod`
pipeline + failing `smoke-test` job.

Added for the deploy history above:

| Id | Level | Pipeline | Sha | Status |
|---|---|---|---|---|
| pipe_20006 + job_20007 | pipeline + job | deploy-orbiter-staging | 1e3f9b2 | success |
| pipe_20008 + job_20009 | pipeline + job | deploy-telemetry-ingest-prod | 77aa88b | success |
| job_20010 | job | deploy-flyer-gateway-prod | a1b2c3 | success (rollout) |
| pipe_20011 | pipeline | deploy-flight-log-parser-staging | 2b4c5d6 | success |
| pipe_20012 + job_20013 | pipeline + job | deploy-orbiter-dev | d3e4f5a | success |
| pipe_20014 + job_20015 | pipeline + job | deploy-flyer-gateway-staging | 4b5c6d7 | success |
| pipe_20016 + job_20017 | pipeline + job | deploy-flyer-flight-staging | e5f6a7b | success |
| pipe_20018 + job_20019 | pipeline + job | deploy-flyer-flight-dev | c7d8e9f | success |
| pipe_20020 + job_20021 | pipeline + job | deploy-telemetry-ingest-staging | b2c3d4e | success |
| pipe_20022 + job_20023 | pipeline + job | deploy-flight-log-parser-dev | 8e9f0a1 | success |

## 6. Cross-service coverage

Every one of the five services emits at least one span AND appears in the catalog; every
incident (ORB-1, FLY-1) and feature ticket (FLY-2, ORB-2) has a span carrying
`ticket: <KEY>`; every container/process `git.commit.sha` resolves to a deploy in section 3
(enforced by `validate-links.mjs`).
