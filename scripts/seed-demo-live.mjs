#!/usr/bin/env node

const DEFAULT_BASE_URL = 'https://api.netasacademy.com';
const IS_APPLY = process.argv.includes('--apply');
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const STRAPI_BASE_URL = (process.env.STRAPI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

const demoEvents = [
  {
    slug: 'demo-ai-product-delivery-clinic',
    title: 'Demo: AI Product Delivery Clinic',
    summary: 'A practical session for product, design, and engineering teams shipping AI-enabled features.',
    details: [
      '<p>This clinic helps product teams align on a realistic AI delivery path before the feature reaches production.</p>',
      '<p>We cover use-case framing, evaluation signals, rollout guardrails, and the team rituals that keep shipping predictable.</p>',
      '<ul><li>Clarify the problem the AI feature should solve</li><li>Define simple evaluation signals before launch</li><li>Leave with a practical rollout checklist</li></ul>',
    ].join(''),
    startsAt: '2026-07-16T10:00:00.000Z',
    endsAt: '2026-07-16T12:00:00.000Z',
    eventType: 'etkinlik',
    keepRegistrationsOpen: true,
    location: 'Online',
    topicArea: 'yapay-zeka',
    format: 'online',
    dailySchedule: '13:00 - 15:00',
  },
  {
    slug: 'demo-cloud-reliability-roundtable',
    title: 'Demo: Cloud Reliability Roundtable',
    summary: 'A focused discussion on runtime visibility, incident readiness, and deployment guardrails.',
    details: [
      '<p>This roundtable is for teams who want a tighter operating model around production stability.</p>',
      '<p>We discuss monitoring thresholds, incident response ownership, and the deployment checkpoints that make change safer.</p>',
      '<ul><li>Compare monitoring signals that matter before an incident escalates</li><li>Review who owns response, recovery, and follow-up</li><li>Agree on one reliability improvement to trial next</li></ul>',
    ].join(''),
    startsAt: '2026-07-23T10:00:00.000Z',
    endsAt: '2026-07-23T11:30:00.000Z',
    eventType: 'etkinlik',
    keepRegistrationsOpen: true,
    location: 'Online',
    topicArea: 'bulut-altyapi',
    format: 'online',
    dailySchedule: '13:00 - 14:30',
  },
  {
    slug: 'demo-ai-governance-masterclass',
    title: 'Demo: AI Governance Masterclass',
    summary: 'A paid workshop on safe AI adoption, policy guardrails, and team-level operating models.',
    details: [
      '<p>This masterclass is for organizations that want to move from AI experimentation to accountable delivery.</p>',
      '<p>We review governance checkpoints, decision ownership, and lightweight review rituals that help teams keep pace without losing control.</p>',
      '<ul><li>Translate policy into practical delivery rules</li><li>Define who approves what in AI rollouts</li><li>Leave with a governance checklist for your team</li></ul>',
    ].join(''),
    startsAt: '2026-08-06T10:00:00.000Z',
    endsAt: '2026-08-06T13:00:00.000Z',
    eventType: 'egitim',
    keepRegistrationsOpen: true,
    location: 'Online',
    topicArea: 'yapay-zeka',
    format: 'online',
    price: 6500,
    dailySchedule: '13:00 - 16:00',
  },
  {
    slug: 'demo-secure-cloud-ops-lab',
    title: 'Demo: Secure Cloud Ops Lab',
    summary: 'A paid hands-on session covering production readiness, access control, and incident response.',
    details: [
      '<p>This lab focuses on the operational habits that keep cloud systems stable and auditable.</p>',
      '<p>Participants map access boundaries, watch for early warning signals, and practice making the first response decision under pressure.</p>',
      '<ul><li>Clarify access and ownership boundaries</li><li>Build a repeatable incident response sequence</li><li>Identify the first reliability improvement to ship</li></ul>',
    ].join(''),
    startsAt: '2026-08-13T10:00:00.000Z',
    endsAt: '2026-08-13T12:30:00.000Z',
    eventType: 'egitim',
    keepRegistrationsOpen: true,
    location: 'Online',
    topicArea: 'bulut-altyapi',
    format: 'online',
    price: 4800,
    dailySchedule: '13:00 - 15:30',
  },
];

function log(message, extra) {
  if (extra === undefined) {
    console.log(message);
    return;
  }

  console.log(`${message} ${JSON.stringify(extra)}`);
}

async function api(pathname, options = {}) {
  const response = await fetch(`${STRAPI_BASE_URL}${pathname}`, {
    ...options,
    headers: {
      ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${pathname} failed with ${response.status}: ${text.slice(0, 500)}`);
  }

  return body;
}

async function findEventBySlug(slug) {
  const query = `/api/events?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1${STRAPI_API_TOKEN ? '&publicationState=preview' : ''}`;
  const body = await api(query);
  return body?.data?.[0] ?? null;
}

function buildPayload(event) {
  return {
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    details: event.details,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    eventType: event.eventType,
    keepRegistrationsOpen: event.keepRegistrationsOpen,
    location: event.location,
    topicArea: event.topicArea,
    format: event.format,
    price: event.price,
    dailySchedule: event.dailySchedule,
    publishedAt: new Date().toISOString(),
  };
}

async function upsertEvent(event) {
  const existing = await findEventBySlug(event.slug);
  const data = buildPayload(event);

  if (!IS_APPLY) {
    log(existing ? 'Would update event' : 'Would create event', {
      slug: event.slug,
      title: event.title,
      published: Boolean(existing),
    });
    return { action: existing ? 'update' : 'create', slug: event.slug };
  }

  if (!STRAPI_API_TOKEN) {
    throw new Error('STRAPI_API_TOKEN is required when running with --apply');
  }

  if (existing?.documentId) {
    const body = await api(`/api/events/${existing.documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    return { action: 'updated', slug: event.slug, documentId: body?.data?.documentId ?? existing.documentId };
  }

  const body = await api('/api/events', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  return { action: 'created', slug: event.slug, documentId: body?.data?.documentId ?? null };
}

async function main() {
  log(`Target base URL: ${STRAPI_BASE_URL}`);
  log(`Mode: ${IS_APPLY ? 'apply' : 'dry-run'}`);

  const results = [];
  for (const event of demoEvents) {
    results.push(await upsertEvent(event));
  }

  log('Done', { results });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
