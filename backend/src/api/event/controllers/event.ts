import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

export default factories.createCoreController('api::event.event', () => ({
  async sendRegistrationEmail(ctx) {
    const { documentId } = ctx.params;
    const body = ctx.request.body ?? {};

    if (!documentId || !body.subject || (!body.text && !body.html)) {
      throw new ValidationError('documentId, subject, and either text or html are required');
    }

    const result = await strapi.service('api::event.event').sendRegistrationEmail(documentId, {
      subject: body.subject,
      text: body.text,
      html: body.html,
      from: body.from,
      replyTo: body.replyTo,
      statuses: body.statuses,
    });

    ctx.body = { data: result };
  },

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
