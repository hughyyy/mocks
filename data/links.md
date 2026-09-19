# Cross-link map — every resolvable key

One section listing every resolvable key across the two products' stores, chaining
**ticket → page → service → deploy sha → (containers | logs | spans)**. The `KEY-n` ticket
keys, Confluence page ids, Datadog services, git shas and event ids below all resolve to
records shipped in `mockapis/seed/*` and `datadog/mock/seed/*` — `validate-links.mjs`
asserts this and must pass.

## Tickets → pages → services

| Ticket | Page(s) | Service | Components |
|---|---|---|---|
| ORB-1 | 98302 (architecture), 98304 (demo) | orbiter-dashboard, telemetry-ingest (archive) | Gateway / Chart store / Archive client |
| ORB-2 | 98302 (replay), 98311 (research) | orbiter-dashboard, flight-log-parser | Mission replay player |
| ORB-3 | 98302 | orbiter-dashboard | Fleet dashboards / chart rendering |
| ORB-4 | 98302 (auth) | orbiter-dashboard | Sessions/auth |
| ORB-5 | 98302 (chart store) | orbiter-dashboard | Chart store |
| ORB-6 | 98302 (archive) | orbiter-dashboard | Archive client |
| ORB-7 | 98302 (replay) | orbiter-dashboard | Mission replay player |
| ORB-8 | 98302 (fleet) | orbiter-dashboard | Fleet dashboards |
| FLY-1 | 98304 (demo), 98305 (incident), 98308 (arch) | flyer-flight | Trajectory smoother / Waypoint controller |
| FLY-2 | 98308 (preflight API), 98309 (field app), 98311 (research) | flyer-gateway | Preflight checklist / field-ops-app |
| FLY-3 | 98303 (heartbeat record), 98306 (ingest), 98308 (arch) | telemetry-ingest, flyer-flight | Heartbeat producer / v2 parser |
| FLY-4 | 98306 (ingest archive) | telemetry-ingest | Archive/backfill API |
| FLY-5 | 98307 (parser) | flight-log-parser | v2 decoder/validator `flightlog` |
| FLY-6 | 98309 (field app) | flyer-gateway, orbiter-dashboard | field-ops-app |
| FLY-7 | 98313 (postmortem), 98308 (release gate) | flyer-flight | CI/CD + deploys |
| FLY-8 | 98306 (obs section) | telemetry-ingest (observability) | Observability/tagging |

## Tickets → deploy shas → containers/processes/logs/spans

| Ticket | Deploy sha | Containers | Logs | Spans |
|---|---|---|---|---|
| ORB-1 | 9f2c8a1 (orbiter-prod) | c-1a2b3c (orb-prod-7) | log_10001, log_10002 | span_30010 `ingest.backfill` |
| ORB-2 | 2b4c5d6 (parser-staging) | — | — | span_30008, span_30009 |
| ORB-3 | 9f2c8a1 | c-1a2b3c | — | span_30011 |
| ORB-4 | (none yet) | — | — | — |
| ORB-5 | (none yet) | — | — | — |
| ORB-6 | (none yet) | — | — | — |
| ORB-7 | (none yet) | — | — | span_30013 |
| ORB-8 | (none yet) | — | — | span_30012 |
| FLY-1 | 6d0e1f (flyer-flight) | c-j0k1l2 (fly-prod-4) | log_10003, log_10004 | span_30004 (error), span_30005 |
| FLY-2 | a1b2c3 (flyer-gw) | c-7g8h9i (fly-prod-3) | — | span_30006, span_30007 |
| FLY-3 | 77aa88b (ingest-prod) | c-m3n4o5 (tel-prod-1) | log_10005 (warn), log_10006 | span_30003 `ingest.frames` |
| FLY-4 | 77aa88b | c-m3n4o5 | log_10002 (backfill) | span_30010 |
| FLY-5 | 2b4c5d6 (parser-staging) | — | — | span_30005 `log.parse_segment` |
| FLY-6 | a1b2c3 | c-7g8h9i | — | span_30006, span_30007 |
| FLY-7 | 6d0e1f (error pipeline) | c-j0k1l2 | — | — (pipe_20004 error smoke) |
| FLY-8 | all deploy shas | all | — | — |

## Pages → tickets (page body references)

- 98302: `ORB-1` · 98303: `FLY-3` · 98304: `FLY-1`, `FLY-3`, `ORB-2` · 98305: `FLY-1` ·
  98306: `ORB-1`, `FLY-3`, `FLY-4` · 98307: `ORB-2`, `FLY-5` · 98308: `FLY-1`, `FLY-2`,
  `FLY-3`, `FLY-7` · 98309: `FLY-2`, `FLY-6`, `ORB-2` · 98310: `FLY-1`, `ORB-2` ·
  98311: `FLY-2` · 98312: `ORB-3` · 98313: `FLY-7` · 98314: `ORB-8`, `ORB-7`, `FLY-6` ·
  98315: `FLY-2`, `ORB-7`. All resolve to seeded issues.

## Services → deploy shas → events

| Service | Deploy shas | CI events |
|---|---|---|
| orbiter-dashboard | 9f2c8a1 (prod), 1e3f9b2 (staging), d3e4f5a (dev) | pipe_20001, job_20002, pipe_20006, job_20007, pipe_20012, job_20013 |
| flyer-gateway | a1b2c3 (prod), 4b5c6d7 (staging) | pipe_20003, job_20010, pipe_20014, job_20015 |
| flyer-flight | 6d0e1f (prod), e5f6a7b (staging), c7d8e9f (dev) | pipe_20004, job_20005, pipe_20016, job_20017, pipe_20018, job_20019 |
| telemetry-ingest | 77aa88b (prod), b2c3d4e (staging) | pipe_20008, job_20009, pipe_20020, job_20021 |
| flight-log-parser | 2b4c5d6 (staging), 8e9f0a1 (dev) | pipe_20011, pipe_20022, job_20023 |

## Id ranges (no collisions)

- Issues: 10001–10016 (ORB-1..8 + FLY-1..8). Next ORB auto-key: **ORB-9**; next FLY: FLY-9.
- Comments: 10000–10021. Changelog: 1–7.
- Content ids: 98301–98315 (ENG 11 records: 9 pages + 2 blogposts; PD 4 pages). Next free: **98316**.
- Spans: span_30001–span_30013. CI: pipe_20001–pipe_20022, job_20002–job_20023.
- Logs: log_10001–log_10011 (capped at 11).
- Containers: c-1a2b3c … c-f9g0h1 (12, per-service-per-env; capped at 12).
