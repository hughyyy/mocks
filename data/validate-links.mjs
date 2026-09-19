#!/usr/bin/env node
/**
 * Cross-link + anchor validator for the mock API suite seeds.
 *
 * Loads the actual seed files from `mockapis/seed/*` and `datadog/mock/seed/*`,
 * then asserts the cross-link map documented in `data/links.md` (ticket ↔ page ↔
 * service ↔ deploy sha ↔ observability event) plus the hard anchor invariants from
 * `data/HANDOFF.md` §1. Exits non-zero with a report on any failure.
 *
 * Run: `node data/validate-links.mjs`  (from the repo root).
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)));
const MOCKAPI_SEED = join(root, '..', 'mockapis', 'seed');
const DD_SEED = join(root, '..', 'datadog', 'mock', 'seed');

const read = async (p) => JSON.parse(await readFile(p, 'utf8'));
const readJsonl = async (p) =>
  (await readFile(p, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l));

// ---- load seeds ----
const users = await read(join(MOCKAPI_SEED, 'users.json'));
const projects = await read(join(MOCKAPI_SEED, 'projects.json'));
const issues = await read(join(MOCKAPI_SEED, 'issues.json'));
const comments = await read(join(MOCKAPI_SEED, 'comments.json'));
const spaces = await read(join(MOCKAPI_SEED, 'spaces.json'));
const content = await read(join(MOCKAPI_SEED, 'content.json'));

const services = await read(join(DD_SEED, 'services.json'));
const catalogEntities = await read(join(DD_SEED, 'catalog-entities.json'));
const catalogRelations = await read(join(DD_SEED, 'catalog-relations.json'));
const containers = await read(join(DD_SEED, 'containers.json'));
const processes = await read(join(DD_SEED, 'processes.json'));
const events = await readJsonl(join(DD_SEED, 'events.jsonl'));

const issueKeys = new Set(issues.map((i) => i.key));
const issueById = new Map(issues.map((i) => [i.id, i]));
const serviceNames = new Set(services.map((s) => s.name));
const pageIds = new Set(content.map((c) => c.id));
const emailById = new Map(users.map((u) => [u.id, u.email]));
const emailRev = new Map(users.map((u) => [u.email, u.id]));

const errors = [];
let checks = 0;
const check = (cond, msg) => {
  checks += 1;
  if (!cond) errors.push(msg);
};

// =========================================================
// 1. Event / infra tag resolution (ticket / service / git sha)
// =========================================================
const deployShas = new Set(
  events.filter((e) => e.kind === 'ci-pipeline' || e.kind === 'ci-job').map((e) => e.gitSha),
);

const tagOf = (tags, prefix) => (tags || []).filter((t) => t.startsWith(`${prefix}:`)).map((t) => t.slice(prefix.length + 1));

for (const ev of events) {
  for (const key of tagOf(ev.tags, 'ticket')) {
    check(issueKeys.has(key), `events.jsonl ${ev.id}: ticket tag "${key}" does not resolve to an issue`);
  }
  for (const svc of tagOf(ev.tags, 'service')) {
    check(serviceNames.has(svc), `events.jsonl ${ev.id}: service tag "${svc}" not in services.json`);
  }
  for (const sha of tagOf(ev.tags, 'git.commit.sha')) {
    check(deployShas.has(sha), `events.jsonl ${ev.id}: git.commit.sha "${sha}" has no deploy (ci) event`);
  }
  for (const v of Object.values(ev.attributes || {})) {
    if (typeof v === 'string' && /^(ORB|FLY)-\d+$/.test(v)) {
      check(issueKeys.has(v), `events.jsonl ${ev.id}: attributes ticket "${v}" does not resolve to an issue`);
    }
  }
}

for (const c of [...containers, ...processes]) {
  for (const svc of tagOf(c.tags, 'service')) {
    check(serviceNames.has(svc), `${c.id ?? c.pid}: service tag "${svc}" not in services.json`);
  }
  for (const sha of tagOf(c.tags, 'git.commit.sha')) {
    check(deployShas.has(sha), `${c.id ?? c.pid}: git.commit.sha "${sha}" matches no deploy event`);
  }
}

for (const rel of catalogRelations) {
  check(serviceNames.has(rel.source), `relation ${rel.id}: source "${rel.source}" not a service`);
  check(serviceNames.has(rel.target), `relation ${rel.id}: target "${rel.target}" not a service`);
}

// =========================================================
// 2. Page → ticket references resolve
// =========================================================
for (const page of content) {
  const mentioned = [...page.bodyStorage.matchAll(/\b(ORB|FLY)-\d+\b/g)].map((m) => m[0]);
  for (const key of new Set(mentioned)) {
    check(issueKeys.has(key), `content ${page.id} ("${page.title}"): references non-existent ticket "${key}"`);
  }
}

// =========================================================
// 3. Comments + users resolve to seeded entities
// =========================================================
for (const c of comments) {
  check(issueById.has(c.ownerId), `comment ${c.id}: ownerId ${c.ownerId} is not a seeded issue`);
  check(emailRev.has(c.authorId), `comment ${c.id}: author "${c.authorId}" not a seeded user`);
}
for (const i of issues) {
  check(emailRev.has(i.assigneeId), `issue ${i.key}: assignee "${i.assigneeId}" not a seeded user`);
  check(emailRev.has(i.reporterId), `issue ${i.key}: reporter "${i.reporterId}" not a seeded user`);
}

// =========================================================
// 4. Anchor invariants (HANDOFF §1) — must hold byte-for-byte
// =========================================================
const logs = events.filter((e) => e.kind === 'log');
const spans = events.filter((e) => e.kind === 'span');

check(projects.some((p) => p.key === 'ORB') && projects.some((p) => p.key === 'FLY'), 'projects ORB/FLY missing');

const orb1 = issues.find((i) => i.key === 'ORB-1');
check(orb1.summary === 'Live telemetry chart loses history after reconnect', 'ORB-1 summary mismatch');
check(orb1.status === 'In Progress' && orb1.issueType === 'Bug' && orb1.priority === 'High', 'ORB-1 status/type/priority mismatch');
check(JSON.stringify(orb1.labels) === JSON.stringify(['telemetry', 'orbiter', 'reconnect']), 'ORB-1 labels mismatch');
check(orb1.assigneeId === 'ada@brightline.dev' && orb1.reporterId === 'grayson@brightline.dev', 'ORB-1 assignee/reporter mismatch');
check(/backfill/.test(orb1.description), 'ORB-1 description lacks "backfill"');

const orb1Comments = comments.filter((c) => c.ownerType === 'issue' && c.ownerId === orb1.id)
  .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
check(orb1Comments.length === 2, `ORB-1 must have exactly 2 comments (has ${orb1Comments.length})`);
check(orb1Comments[1]?.id === 10001, 'comment id 10001 must be ORB-1 second comment');

check(issues.some((i) => i.key === 'ORB-2' && i.summary === 'Self-serve mission replays for support'), 'ORB-2 anchor');
check(issues.some((i) => i.key === 'ORB-3'), 'ORB-3 missing');
check(issues.some((i) => i.key === 'FLY-1' && i.status === 'In Progress'), 'FLY-1 must be In Progress');
check(issues.some((i) => i.key === 'FLY-2'), 'FLY-2 missing');
check(issues.some((i) => i.key === 'FLY-3'), 'FLY-3 missing');

// FLY In Progress == 1 ; ORB next key stays ORB-4 (max ORB key is ORB-3)
const flyInProgress = issues.filter((i) => i.projectKey === 'FLY' && i.status === 'In Progress');
check(flyInProgress.length === 1 && flyInProgress[0].key === 'FLY-1', `exactly one FLY In Progress expected (got ${flyInProgress.map((i) => i.key).join(',') || 'none'})`);
const maxOrb = Math.max(...issues.filter((i) => i.projectKey === 'ORB').map((i) => Number(i.id)));
check(maxOrb === 10003, `max ORB issue id must be 10003 (next key ORB-4); got ${maxOrb}`);

// Confluence anchors
check(spaces.find((s) => s.key === 'ENG')?.id === '100' && spaces.find((s) => s.key === 'PD')?.id === '101', 'ENG/PD space ids');
const engContent = content.filter((c) => c.spaceId === '100');
const pdContent = content.filter((c) => c.spaceId === '101');
check(engContent.length === 5, `ENG must have exactly 5 content records (has ${engContent.length})`);
check(pdContent.length === 2, `PD must have exactly 2 content records (has ${pdContent.length})`);
check(Math.max(...content.map((c) => Number(c.id))) === 98311, 'next content id must be 98312');
check(content.find((c) => c.id === '98302').bodyStorage.includes('gateway'), '98302 body must contain "gateway"');
check(content.find((c) => c.id === '98303').bodyStorage.includes('newline-delimited'), '98303 body must contain "newline-delimited"');
check(content.find((c) => c.id === '98304').bodyStorage.includes('figure eight'), '98304 body must contain "figure eight"');

// Datadog anchors
check(containers.length === 5, `containers list count must be 5 (has ${containers.length})`);
check(containers.some((c) => c.name === 'orbiter-dashboard' && c.host === 'orb-prod-7' && c.imageTags.includes('1.4.2')), 'container orb-prod-7/1.4.2 anchor');
check(logs.length === 6, `logs count must be 6 before ingest (has ${logs.length})`);
check(logs.some((l) => l.message.includes('overshoot') && (l.attributes?.ticket ?? tagOf(l.tags, 'ticket')[0]) === 'FLY-1'), 'overshoot log with ticket FLY-1');
check(spans.some((s) => s.traceId === 'fedcba9876543210' && s.service === 'flyer-flight' && s.status === 'error'), 'trace fedcba9876543210 flyer-flight error span');
const liveTrace = spans.filter((s) => s.traceId === '1234567890abcdef');
check(liveTrace.length === 3, `trace 1234567890abcdef must have 3 spans (has ${liveTrace.length})`);
const orbiterCi = events.find((e) => e.kind === 'ci-pipeline' && e.pipeline === 'deploy-orbiter-prod');
check(orbiterCi?.gitSha === '9f2c8a1' && orbiterCi?.gitTag === 'orbiter-1.4.2', 'deploy-orbiter-prod sha/tag anchor');
check(catalogEntities.length >= 4, 'catalog needs >= 4 entities');
const orbiterRelTargets = catalogRelations.filter((r) => r.source === 'orbiter-dashboard').map((r) => r.target);
check(orbiterRelTargets.includes('flyer-gateway') && orbiterRelTargets.includes('telemetry-ingest'), 'orbiter-dashboard relations expose flyer-gateway + telemetry-ingest');

// =========================================================
// 5. Issue → service resolution (every issue about a service carries service:<name>)
// =========================================================
// Legacy anchors predate service: labels; resolve via the component map in data/links.md.
const ISSUE_SERVICE = {
  'ORB-1': 'orbiter-dashboard', 'ORB-2': 'orbiter-dashboard', 'ORB-3': 'orbiter-dashboard',
  'FLY-1': 'flyer-flight', 'FLY-2': 'flyer-gateway', 'FLY-3': 'telemetry-ingest',
  'FLY-4': 'telemetry-ingest', 'FLY-5': 'flight-log-parser', 'FLY-6': 'flyer-gateway',
  'FLY-7': 'flyer-flight', 'FLY-8': 'telemetry-ingest',
};
for (const i of issues) {
  const fromLabel = (i.labels || []).find((l) => l.startsWith('service:'));
  const resolved = fromLabel ? fromLabel.slice('service:'.length) : ISSUE_SERVICE[i.key];
  check(Boolean(resolved), `issue ${i.key}: no service resolved`);
  check(!resolved || serviceNames.has(resolved), `issue ${i.key}: resolved service "${resolved}" not in services.json`);
}

// =========================================================
// Report
// =========================================================
if (errors.length) {
  console.error(`\nvalidate-links: ${errors.length} FAILED of ${checks} checks\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`validate-links: all ${checks} checks passed (${issues.length} issues, ${content.length} pages, ${events.length} events, ${containers.length} containers).`);
