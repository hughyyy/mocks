# Component catalog — ownership, SMEs & relationships

Fleshes out every individual item and subcomponent under the five software projects
(`mocks/data/software-specs.md`), and determines:

- **organisational structure** — who owns each component (team) and who escalates to whom;
- **owners** — the person accountable for a component;
- **subject-matter experts (SMEs)** — the person whose expertise a component lives or dies
  by, and the recommended second/reviewer;
- **relationships** — component ↔ repository ↔ Datadog service ↔ team ↔ person ↔ tickets ↔
  Confluence pages ↔ observability events.

People reference `organisation.md` (accountIds). Teams: `Orbiter`, `Flyer`, `Platform`,
`QA` (all under Engineering). Product owner for feature decisions is Jo (Head of Product)
across all components; Theo (Design) is SME for anything user-facing.

## 1. Organisational structure (reporting)

```
Noor Al-Farsi (CEO)
├─ Ada Turing (CTO) — Engineering
│    ├─ Grayson Bell — Orbiter team lead  (orbiter-dashboard, field-ops-app UI)
│    ├─ Mira Ito    — Flyer team lead     (flyer-autopilot, field-ops-app integration)
│    ├─ Ravi Mehta  — Platform/data lead (telemetry-ingest, flight-log-parser, SRE/observability)
│    └─ Clara Odum  — QA lead            (test strategy, release gates, flight-log validation)
├─ Jo Kwan (Head of Product) — Product Management + Design (Theo Laurent)
├─ Sam Okafor (Head of Field Operations) — Pilots + Support (Lena Fischer)
├─ Paolo Ricci (People & Finance)
└─ Yuki Tanaka (GTM / Sales)
```

**Escalation path** for any component: SME → team lead → Ada (CTO) → Noor (CEO) for
exec-level; customer-facing incidents route via Lena (Support) with the owning SME.

**Backlog prefixes:** `ORB-*` (Orbiter team), `FLY-*` (Flyer team). Platform/QA work uses the
prefix of the team whose component it touches; cross-cutting ops (deploys, tagging, incident
tooling) live under Ada/Ravi with `FLY-*`/`ORB-*` tickets as relevant.

## 2. Component catalog (per repository)

### orbiter-dashboard (`ORB`) — service `orbiter-dashboard`

| Component | Type | Owner / SME | Second (review) | Dependencies | Notes · tickets · pages · observability |
|---|---|---|---|---|---|
| Gateway | WebSocket fan-out hub | Grayson · Grayson | Ravi (telemetry wire protocol) | telemetry-ingest (frames, backfill) | `ORB-1` reconnect path · page 98302 · log `websocket client disconnected` |
| Chart store | client ring buffer + backfill | Grayson · Grayson | Ravi | gateway archive API | `ORB-1` (root cause) · span `GET /api/flights/live` |
| Mission replay player | replay engine from flight log | Grayson · Grayson | Theo (UX) | flight-log-parser (decoded segments) | `ORB-2` self-serve replays · page 98302 |
| Archive client | backfill/archive API client | Grayson · Ravi | Ravi | telemetry-ingest archive API | `ORB-1` backfill flow · log `backfill requested` |
| Fleet dashboards | fleet/mission views | Grayson · Theo | Grayson | chart store | page 98302 · Q3 demo (page 98304) |
| Sessions/auth | login + session tokens | Ada · Ada | Ravi | all services | shared platform component |

### flyer-autopilot (`FLY`) — services `flyer-gateway`, `flyer-flight`

| Component | Type | Owner / SME | Second (review) | Dependencies | Notes · tickets · pages · observability |
|---|---|---|---|---|---|
| Trajectory smoother | spline smoothing + curvature clamp | Mira · Mira | Ada (dynamics review) | waypoint controller | `FLY-1` overshoot (0.93 m vs 0.5 m) · span `trajectory.smooth` |
| Waypoint controller | waypoint sequencing | Mira · Mira | Sam (field SME) | smoother, GPS | corridor demo (page 98304) |
| Preflight checklist service | takeoff checks API + token | Mira · Sam | Sam (requirements) | gateway, firmware version | `FLY-2` · page 98303 · preflight logs |
| Heartbeat telemetry producer | 1 Hz link/cpu/battery records | Mira · Ravi | Ravi (v2 format) | telemetry-ingest | `FLY-3` · page 98303 · heartbeat logs (incl. write failures) |
| Flight controller | real-time control loop | Mira · Mira | Ada | smoother, IMU | conceptual; not in seeds' services list |
| flyer-gateway | operator/companion gateway service | Mira · Ravi | Ravi | flight-log stream | span `gateway.forward_frame` · deploy `deploy-flyer-gateway-prod` |

### telemetry-ingest (platform) — service `telemetry-ingest`

| Component | Type | Owner / SME | Second (review) | Dependencies | Notes · tickets · pages · observability |
|---|---|---|---|---|---|
| Flight Log Format v2 parser | NL-DL JSON parser | Ravi · Ravi | Mira (records) | imu/heartbeat/waypoint records | `FLY-3` · page 98303 |
| Frame batching pipeline | batch telemetry frames | Ravi · Ravi | Grayson (consumer) | parser | log `frame batch ingested (1024)` · span `ingest.frames` |
| Archive / backfill API | serve missed intervals | Ravi · Grayson | Grayson | store | `ORB-1` backfill · log `backfill requested` |
| Ingest endpoints | intake + validation | Ravi · Ravi | Clara (QA) | parser | deploy `deploy-telemetry-ingest-prod` |

### flight-log-parser — service `flight-log-parser` (staging only)

| Component | Type | Owner / SME | Second (review) | Dependencies | Notes · observability |
|---|---|---|---|---|---|
| v2 decoder/validator (`flightlog`) | decode + validate logs | Ravi · Clara | Ravi | format v2 | page 98303 · span `log.parse_segment` (staging) |
| Replay event streamer | segments → replay events | Ravi · Grayson | Grayson | decoder | feeds Orbiter replay player |

### field-ops-app — tablet companion (in development)

| Component | Type | Owner / SME | Second (review) | Dependencies | Notes |
|---|---|---|---|---|---|
| Preflight checklist UI | tablet preflight flow | Sam · Sam | Mira + Theo | preflight API | `FLY-2` · field SME = Sam |
| Live mission view | live telemetry on tablet | Grayson · Theo | Grayson | gateway, chart store | UX SME = Theo |
| Mission replay view | replays on tablet | Grayson · Theo | Grayson | replay player | `ORB-2` |

### Cross-cutting (platform engineering)

| Component | Type | Owner / SME | Second (review) | Notes |
|---|---|---|---|---|
| CI/CD + deploys (`deploy-*`) | pipelines + release gates | Ada · Ada | Clara (QA gate) | deploys carry `git.commit.sha`, `version`, `git.tag` |
| Observability/tagging conventions | log/span/tag standards | Ravi · Ravi | Ada | `env:`, `service:`, `ticket:`, `deployment:` tags |
| Incident response | process + paging | Lena · Lena | owning SME | incident pages (e.g. page 98305) tie to tickets |
| Release / product planning | roadmap + backlog | Jo · Jo | Ada, Sam | pages 98310 (vision), 98311 (research) |

## 3. SME directory (component → expert → second)

| Domain | SME | Second | Backs up |
|---|---|---|---|
| Orbiter / live telemetry / replays | Grayson Bell | Ravi Mehta, Theo Laurent | all `orbiter-dashboard` + `field-ops-app` UI |
| Flyer / autonomy / trajectory | Mira Ito | Ada Turing, Sam Okafor | `flyer-autopilot` components |
| Data / log format / ingest / observability | Ravi Mehta | Ada Turing | `telemetry-ingest`, `flight-log-parser`, tagging |
| Quality / release gates / log validation | Clara Odum | Ravi Mehta | QA across repos |
| UX / interaction | Theo Laurent | Grayson Bell | all user-facing components |
| Field operations / flying / preflight | Sam Okafor | Lena Fischer | preflight + field-ops-app |
| Support / incidents | Lena Fischer | Sam Okafor | incident pages, replays-as-answers |
| Product / requirements | Jo Kwan | Ada Turing | feature scoping, roadmap |
| Business / exec | Noor Al-Farsi | Yuki Tanaka | strategy |
| Sales / customer feedback | Yuki Tanaka | Jo Kwan | requirements intake |

## 4. Relationship wiring (how entities connect)

Canonical chain for every component: **Component → Repository → Datadog `service` → Team → SME → tickets (`KEY-n`) → Confluence page → observability events → deploy**.

- **Component ↔ service:** each component maps to exactly one Datadog service (the runtime
  that hosts it); a service hosts several components.
- **Service ↔ repo ↔ team:** repo ↔ service are 1:1 for `orbiter-dashboard`,
  `telemetry-ingest`, `flight-log-parser`; `flyer-autopilot` exposes two services
  (`flyer-gateway`, `flyer-flight`); `field-ops-app` has no prod service yet (in dev).
- **Team ↔ SME:** the SME is the team lead for each repo (Orbiter → Grayson, Flyer → Mira,
  Platform → Ravi); QA (Clara) reviews; product (Jo) owns scope; Design (Theo) attaches to
  frontends.
- **Tickets ↔ service ↔ events:** every issue carries the service's `service:` tag; its
  logs/spans carry `ticket: <KEY-n>`; its deploy carries the `git.commit.sha` that
  containers/processes report.
- **Pages ↔ tickets ↔ services:** incident/feature pages name the ticket and the service
  (e.g. page 98305 "Incident: waypoint overshoot" ↔ FLY-1 ↔ `flyer-flight`).

All of these are enforced as the **cross-project consistency checklist** in
`software-specs.md`; seeds must keep them resolvable.
