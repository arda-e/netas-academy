import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

const KNOWN_EVENT_IDS = [
  'lead_tab_view',
  'lead_tab_change',
  'lead_form_start',
  'lead_submit_success',
  'lead_submit_fail',
  'lead_contextual_entry',
  'lead_catalog_click',
  'lead_related_content_click',
] as const;

const ALLOWED_PROPERTY_KEYS = [
  'page_path',
  'source_page',
  'cta_id',
  'content_type',
  'content_slug',
  'session_id',
] as const;

const PII_PATTERNS = ['email', 'phone', 'name', 'tckn', 'address', 'password'];

function containsPII(key: string): boolean {
  const lower = key.toLowerCase();
  return PII_PATTERNS.some((pattern) => lower.includes(pattern));
}

function sanitizeProperties(properties: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!properties || typeof properties !== 'object') {
    return {};
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (containsPII(key)) {
      continue;
    }
    sanitized[key] = value;
  }

  return sanitized;
}

export default factories.createCoreController(
  'api::analytics-event.analytics-event' as any,
  () => ({
    async capture(ctx) {
      const body = ctx.request.body ?? {};

      if (!body.eventId) {
        throw new ValidationError('eventId is required');
      }

      if (!KNOWN_EVENT_IDS.includes(body.eventId)) {
        throw new ValidationError(
          `eventId must be one of: ${KNOWN_EVENT_IDS.join(', ')}`
        );
      }

      const event = await strapi
        .service('api::analytics-event.analytics-event')
        .capture(body);

      ctx.body = { data: event };
    },
  })
);
