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

## Anticipated anchor updates (later passes, not yet applied)

These are the specific test assertions that will change, pass by pass, as capped categories
get built out. They are listed here first so each edit is deliberate and auditable.

| Category (pass) | Seed growth | Test assertion to update |
|---|---|---|
| Confluence pages | per-component pages/blogposts in ENG (CQL `space="ENG"` grows past 5) | `mockapis/test/mock.test.js` ~L116 (`s.size === 5`) + PD L119 / DC `?spaceKey=PD` (`size 2`) |
| Containers | per-service-per-env containers (count grows past 5) | `datadog/mock/test/mock.test.js` ~L40 (`all.data.length === 5`) + L45 prod orbiter filter (`['orb-prod-7']`) |
| Logs | per-service log coverage (grows past 6) | `datadog/mock/test/mock.test.js` ~L87 (`logs.data.length === 6`) + L100 (`7`) + L91 overshoot single-hit |
| ORB backlog | new ORB tickets (max key grows past ORB-3) | `mockapis/test/mock.test.js` ~L72 (`assert.equal(key, 'ORB-4')`) |
| Spans | more orbiter-dashboard spans | `datadog/mock/test/mock.test.js` ~L115 (orbiter-dashboard count `=== 1`) |
| FLY statuses | a second FLY ticket in `In Progress` | `mockapis/test/mock.test.js` ~L99 (JQL total `1`) |

Not yet reached; they will be edited (and this ledger updated) only when the category's pass
actually needs the anchor to move.
