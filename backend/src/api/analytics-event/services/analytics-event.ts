import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { sanitizeProperties } from '../lib/constants';

const { ValidationError } = errors;

const MAX_STRING_LENGTH = 1000;

const STRING_FIELDS = [
  'sessionId',
  'pagePath',
  'sourcePage',
  'ctaId',
  'contentType',
  'contentSlug',
  'backendReference',
] as const;

function validateInput(input: Record<string, unknown>): void {
  for (const field of STRING_FIELDS) {
    const value = input[field];
    if (value !== undefined && value !== null && typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
      throw new ValidationError(
        `${field} exceeds maximum length of ${MAX_STRING_LENGTH} characters`
      );
    }
  }
}

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

export default factories.createCoreService(
  'api::analytics-event.analytics-event' as any,
  () => ({
    async capture(input: CaptureInput) {
      validateInput(input as Record<string, unknown>);

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
