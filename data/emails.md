# Emails — the mail universe (mailmock seed + cross-links)

Mail lives in `mailmock/` (Microsoft Graph / Outlook business-email mock, port 8100).
Its seeds are part of the same fiction: the org directory mirrors `organisation.md`
(staff + customers), and the seeded inboxes carry the same clues and contradictions as the
Jira/Confluence/Datadog layers. A workflow that digs through email finds the sub-story a
plain ticket search misses.

## The seeded conversation (all cross-referenced)

| Where | From → To | Subject | What it tells you (and how it sits relative to other layers) |
|---|---|---|---|
| Noor inbox | Ada → Noor | the pivot — the numbers | runway 18+ months, pipeline up; **contradicts** the 18-days on CRYPTO-1 and the 18-months claim on Confluence 98316 (see ledger pass 8 addendum) |
| Noor sent | Noor → team | Correction: runway | CEO meant 18 **hours**; "do not circulate any of these numbers externally" — the months/days/hours contradiction in email form |
| Ada inbox | Noor → Ada | Pivot exploration — options memo | ties to CRYPTO-1; "I still need a plan on the shelf" even though Ada opposes |
| Paolo inbox | LedgerBridge (vendor) | We power stablecoins — 15-min intro? | external sales pouncing on a rumoured direction; no NDA signed |
| Lena inbox | Margaret Hale (customer) | SLA question — the coin thing? | customers noticed the rumour; support must answer (echoes Lena's ORB-2 comment) |
| Mira inbox | Ada → Mira | Re: demo pipeline numbers | +30% QoQ, runway 18 months, "do not let pivot talk derail it" |
| Grayson inbox | CI | Build passed: orbiter-dashboard 1.4.2 | ops automation; matches deploy sha 9f2c8a1 / tag orbiter-1.4.2 |
| Sam sent | Sam → Lena | Re: preflight — the demo's hero | field opinion: preflight is what customers pay for (echoes Sam's FLY-2 comment) |
| Noor sent | Noor → board | Draft plan: Brightline USD | stablecoin plan draft; early/unapproved; points at Confluence 98316 |
| Jo inbox | Marta → Jo | September interviews — write-up | research says preflight + replays; "nobody asked for financial products" (contradicts the pivot) |

## Conventions

- Identities = `organisation.md` people (`name@brightline.dev`) + customers
  (`*.example.com`). External senders (vendors, board, CI) are not org users.
- Every write (send/draft/mark-read) persists to `mailmock/data/messages.json`; reads
  round-trip. `mailmock` `npm run reset` restores the seed.
- Cross-links: emails name tickets (`CRYPTO-1`) and pages (`98316`, `98315`) exactly as in
  `links.md`; deploy/CI email (Grayson's) matches Datadog sha/tag anchors.

## Live feed

`cd mailmock && npm run mock` + `npm run simulate` delivers further storyline emails on a
timer through the real sendMail API — the mailbox stays "alive" the same way the Jira and
Datadog simulators keep those surfaces moving.
