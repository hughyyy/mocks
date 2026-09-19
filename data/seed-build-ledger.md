# Seed build-out ledger — deliberate anchor updates

Records every change to the **asserted seed anchors** (counts/keys/statuses the contract
tests assert) made during the category-by-category seed build-out, because
`HANDOFF.md` §1 requires updates to a hard-asserted count/status to be **deliberate and
noted**. Policy chosen by the user: **full build-out, update anchors deliberately**
(i.e. grow capped categories too, and update the specific test assertion with a note here).

Each pass records: category, seed change, test file + line updated, and why.
Suites must stay green after every pass (`npm test` + `npm run smoke` + coverage unchanged).

## Pass 1 — Users + teams (`mockapis/seed/users.json`, `data/organisation.md`, `data/components.md`)

- **Seed change:** expanded the canonical user set from 12 staff → 24 staff + 3 customer
  contacts (27 records). Added 12 backfill staff (Nina Petrov, Hiroshi Nakata, Priya Nair,
  Dani Osei, Marta Kowalski, Luca Moretti, Aisha Rahman, Tom Becker, Elena Rossi, Zoe Chen,
  Omar Idris, Grace Adeyemi) under the `a6f10xx` accountId space, and 3 `accountType:
  customer` contacts (Margaret Hale, Diego Fuentes, Ethan Cole) under `02b4f1xx`.
- **Test anchors changed:** **none.** The user set has no count/contents anchor; `userBean`
  passes `accountType` through (`u.accountType ?? 'atlassian'`), the `user/search` test only
  asserts the first `ada` hit and `length >= 1`, and group endpoints are static. Suites green
  without edits.
- **Docs:** `organisation.md` §3 staff table + new §"Customer contacts"; `components.md` §3
  SME directory gained backfill rows (each SME now has a named second).
- **Validator impact:** unchanged (assignee/reporter/author emails all still resolve; all 27
  ids/emails unique).

## Pass 2 — Issues (backlog): ORB un-frozen (`mockapis/seed/issues.json`, `+comments.json`, `+changelog.json`, `mockapis/test/mock.test.js`)

- **Seed change:** grew the ORB backlog from 3 → 8 tickets. Seeded the previously
  documented-only `ORB-4` (sessions/auth, In Progress) and added `ORB-5` (chart-store
  backfill progress, Nina), `ORB-6` (archive-client backfill retry, Grayson), `ORB-7`
  (replay-player seek/scrub, Nina), `ORB-8` (fleet overview aggregation, Grayson). Added
  comments 10016–10021 and changelog entry 7 (ORB-4 To Do → In Progress). All carry
  `service:orbiter-dashboard`; the FLY side, `ORB-1..3` and every other anchor is untouched.
- **Test anchors changed (deliberate, noted):**
  - `mockapis/test/mock.test.js` ~L74 — `assert.equal(key, 'ORB-4')` → `assert.equal(key,
    'ORB-9')`. With ORB-1..8 seeded, `nextIssueKey` returns ORB-9. Comment added inline.
  - This is the first anchor edit of the build-out; it is the one §1's "next key ORB-4"
    entry described, and it is now recorded here instead of being latent.
- **Docs:** `tickets.md` ORB table + ORB-4..8 sections; `links.md` ORB rows + id ranges.
- **Validator impact:** updated `ISSUE_SERVICE` handling is not needed — new issues carry
  `service:orbiter-dashboard` labels, so the label branch resolves them. No validator file
  change; check count stays 204 (issues 10001–10016, comments 10000–10021 all resolve).

## Anticipated anchor updates (later passes, not yet applied)

These are the specific test assertions that will change, pass by pass, as capped categories
get built out. They are listed here first so each edit is deliberate and auditable.

| Category (pass) | Seed growth | Test assertion to update |
|---|---|---|
| Confluence pages | per-component pages/blogposts in ENG (CQL `space="ENG"` grows past 5) | `mockapis/test/mock.test.js` ~L116 (`s.size === 5`) + PD L119 / DC `?spaceKey=PD` (`size 2`) |
| Containers | per-service-per-env containers (count grows past 5) | `datadog/mock/test/mock.test.js` ~L40 (`all.data.length === 5`) + L45 prod orbiter filter (`['orb-prod-7']`) |
| Logs | per-service log coverage (grows past 6) | `datadog/mock/test/mock.test.js` ~L87 (`logs.data.length === 6`) + L100 (`7`) + L91 overshoot single-hit |
| Spans | more orbiter-dashboard spans | `datadog/mock/test/mock.test.js` ~L115 (orbiter-dashboard count `=== 1`) |
| FLY statuses | a second FLY ticket in `In Progress` | `mockapis/test/mock.test.js` ~L99 (JQL total `1`) |

Applied so far: **pass 2 ORB next-key** (`ORB-4` → `ORB-9`).
