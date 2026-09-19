# Brightline Robotics — the fictional organisation

## 1. Company

- **Name:** Brightline Robotics
- **Founded:** 2023 (series A 2024; ~120 employees by 2026)
- **Business:** inspection drones for field teams — telecom, solar, and pipeline operators fly
  autonomous corridor inspections and review live telemetry from a web dashboard.
- **Value proposition:** "no dedicated pilot needed." A field technician launches a mission
  from a tablet; Flyer flies the corridor; Orbiter streams live telemetry and keeps mission
  replays for post-flight review.
- **Markets/customers (fictional):** Westwind Utilities (telecom), Solaris Grid Services
  (solar farms), Northspan Pipelines (oil & gas). Customers renew on annual SaaS
  subscriptions + drone hardware.
- **Products:**
  - **Orbiter** — web fleet dashboard + mission replays (the "software" demo project).
  - **Flyer** — the drone autopilot (autonomy firmware + corridor flying).
  - **Telemetry platform** — ingest + flight-log format (data backbone).
  - **Field Ops app** — tablet companion for preflight + live mission (in development).

## 2. Departments & teams

| Department | Mission | Teams |
|---|---|---|
| **Engineering** | Build and run the software stack | `Orbiter` (web), `Flyer` (embedded/autopilot), `Platform` (data/telemetry), `QA` |
| **Product** | Own the roadmap and customer problems | Product Management |
| **Design** | Interaction + brand | Design |
| **Field Operations** | Fly missions, support customers, feed back issues | Pilots, Support |
| **Go-To-Market** | Sales + growth | Sales, Marketing |
| **People & Finance** | Payroll, hiring, budgets | People, Finance |

Backlog prefixes by team: `ORB` (Orbiter team), `FLY` (Flyer team), plus platform/ops work
tracked under `FLY`/`ORB` as relevant (see software specs).

## 3. People (staff) — the canonical user set

| accountId | Name | Email | Department | Team / Role | TimeZone |
|---|---|---|---|---|---|
| `5d8a01bce4b0a0d01a6f1001` | Ada Turing | ada@brightline.dev | Engineering | CTO / head of engineering | Europe/London |
| `5d8a01bce4b0a0d01a6f1002` | Grayson Bell | grayson@brightline.dev | Engineering | Orbiter lead engineer | America/New_York |
| `5d8a01bce4b0a0d01a6f1003` | Mira Ito | mira@brightline.dev | Engineering | Flyer lead engineer | Asia/Tokyo |
| `5d8a01bce4b0a0d01a6f1004` | Jo Kwan | jo@brightline.dev | Product | Head of product | Europe/Berlin |
| `5d8a01bce4b0a0d01a6f1005` | Noor Al-Farsi | noor@brightline.dev | Leadership | CEO | Asia/Dubai |
| `5d8a01bce4b0a0d01a6f1006` | Ravi Mehta | ravi@brightline.dev | Engineering | Platform/data engineer | Asia/Kolkata |
| `5d8a01bce4b0a0d01a6f1007` | Clara Odum | clara@brightline.dev | Engineering | QA engineer | Africa/Lagos |
| `5d8a01bce4b0a0d01a6f1008` | Theo Laurent | theo@brightline.dev | Design | Lead designer | Europe/Paris |
| `5d8a01bce4b0a0d01a6f1009` | Sam Okafor | sam@brightline.dev | Field Operations | Chief pilot / field ops lead | America/Chicago |
| `5d8a01bce4b0a0d01a6f100a` | Lena Fischer | lena@brightline.dev | Field Operations | Support lead | Europe/Berlin |
| `5d8a01bce4b0a0d01a6f100b` | Paolo Ricci | paolo@brightline.dev | People & Finance | Finance lead | Europe/Rome |
| `5d8a01bce4b0a0d01a6f100c` | Yuki Tanaka | yuki@brightline.dev | Go-To-Market | Sales | Asia/Tokyo |

## 4. Software projects (repos)

| Repo (key prefix) | Product | Language | Team | Purpose |
|---|---|---|---|---|
| **orbiter-dashboard** (`ORB`) | Orbiter | TypeScript/React | Orbiter | SPA: live telemetry, mission replays, fleet dashboards |
| **flyer-autopilot** (`FLY`) | Flyer | Go (firmware-adjacent) | Flyer | trajectory smoother, waypoint control, preflight |
| **telemetry-ingest** | Telemetry platform | Rust | Platform | flight-log ingestion, frame batching, backfill API (powers Orbiter) |
| **flight-log-parser** | Telemetry platform | Go | Platform | validates + decodes the v2 flight log |
| **field-ops-app** | Field Ops app | TypeScript/React Native | Orbiter + Flyer | tablet preflight checklist + live mission view |

## 5. Environments & release model

- Environments: **dev**, **staging**, **prod**.
- Cadence: daily pre-prod deploys; prod deploys gated (weekly for Orbiter, ship-stop for
  Flyer because of flight safety).
- Deploy tags: `deployment:<service>-<env>-<YYYY-MM-DD>`, `git.commit.sha:<sha>`,
  `version:<semver>`, `git.tag: <service>-<semver>` (e.g. `orbiter-1.4.2`,
  `flyer-gw-2.1.0`).

## 6. Operational flavour (consistency anchors)

- **Demo route:** the "figure eight" corridor (stock route used for demos and CI smoke).
- **Incidents:** e.g. `ORB-1` telemetry reconnect backfill (2026-08); `FLY-1` waypoint
  overshoot on tight turns (2026-09) — both with Confluence incident pages and Datadog
  logs/spans carrying `ticket: KEY-n`.
- **Support flow:** customers open tickets; support attaches Orbiter **mission replays**
  (`ORB-2`) instead of screen recordings.
- **Quarterly demo:** Q3 demo plan (2026-09) — corridor run livestreamed to Orbiter
  (Confluence `98304`).
