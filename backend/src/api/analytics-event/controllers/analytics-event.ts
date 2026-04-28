import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { KNOWN_EVENT_IDS } from '../lib/constants';

const { ValidationError } = errors;

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
