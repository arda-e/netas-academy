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
}));
