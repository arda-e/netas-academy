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

const PII_PATTERNS = ['email', 'phone', 'name', 'tckn', 'address', 'password'];

type CaptureInput = {
  eventId: string;
  sessionId?: string;
  pagePath?: string;
  sourcePage?: string;
  ctaId?: string;
  contentType?: string;
  contentSlug?: string;
  backendReference?: string;
  properties?: Record<string, unknown>;
};

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

export default factories.createCoreService(
  'api::analytics-event.analytics-event' as any,
  () => ({
    async capture(input: CaptureInput) {
      if (!input.eventId) {
        throw new ValidationError('eventId is required');
      }

      if (!KNOWN_EVENT_IDS.includes(input.eventId as typeof KNOWN_EVENT_IDS[number])) {
        throw new ValidationError(
          `eventId must be one of: ${KNOWN_EVENT_IDS.join(', ')}`
        );
      }

      const sanitizedProperties = sanitizeProperties(input.properties);

      const event = await strapi.db
        .query('api::analytics-event.analytics-event')
        .create({
          data: {
            eventId: input.eventId,
            timestamp: new Date().toISOString(),
            sessionId: input.sessionId || null,
            pagePath: input.pagePath || null,
            sourcePage: input.sourcePage || null,
            ctaId: input.ctaId || null,
            contentType: input.contentType || null,
            contentSlug: input.contentSlug || null,
            backendReference: input.backendReference || null,
            properties: sanitizedProperties,
          },
        });

      return {
        success: true,
        message: 'Event captured.',
        eventId: event.id,
      };
    },
  })
);
