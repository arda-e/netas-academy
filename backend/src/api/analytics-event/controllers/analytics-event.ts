import { factories } from '@strapi/strapi';
import { KNOWN_EVENT_IDS } from '../lib/constants';

import { formatError, formatSuccess, validateBody } from '../../../utils/controller-helpers';

export default factories.createCoreController(
  'api::analytics-event.analytics-event' as any,
  () => ({
    async capture(ctx) {
      const body = ctx.request.body ?? {};

      const err = validateBody(body, ['eventId']);
      if (err) {
        ctx.body = err;
        ctx.status = err.status;
        return;
      }

      if (!KNOWN_EVENT_IDS.includes(body.eventId)) {
        const err = formatError(
          `eventId must be one of: ${KNOWN_EVENT_IDS.join(', ')}`
        );
        ctx.body = err;
        ctx.status = err.status;
        return;
      }

      const event = await strapi
        .service('api::analytics-event.analytics-event')
        .capture(body);

      ctx.body = formatSuccess(event);
    },
  })
);
