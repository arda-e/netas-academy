import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::event.event', () => ({
  async registrationStatus(ctx) {
    const { documentId } = ctx.params;

    if (!documentId) {
      ctx.body = { error: 'documentId is required', status: 400 };
      ctx.status = 400;
      return;
    }

    const event = await strapi.db.query('api::event.event').findOne({
      where: { documentId },
      select: ['startsAt', 'keepRegistrationsOpen'],
    });

    if (!event) {
      ctx.body = { error: 'Event not found', status: 404 };
      ctx.status = 404;
      return;
    }

    const { isEventRegistrationOpen } = require('../../../utils/event-registration');
    const isOpen = isEventRegistrationOpen(event);
    const keepRegistrationsOpen = event.keepRegistrationsOpen ?? false;

    ctx.body = { data: { isOpen, startsAt: event.startsAt, keepRegistrationsOpen } };
  },
}));
