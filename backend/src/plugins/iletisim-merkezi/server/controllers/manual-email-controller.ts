import type { Core } from '@strapi/strapi';

const manualEmailController = ({ strapi }: { strapi: Core.Strapi }) => ({
  async send(ctx: any) {
    const { documentId } = ctx.params;
    const body = ctx.request.body ?? {};

    if (!documentId) {
      ctx.status = 400;
      ctx.body = { error: 'documentId is required' };
      return;
    }

    if (!body.subject || !body.htmlBody) {
      ctx.status = 400;
      ctx.body = { error: 'subject and htmlBody are required' };
      return;
    }

    const result = await strapi
      .plugin('iletisim-merkezi')
      .service('manualEmailService')
      .sendManualEmail(documentId, body.subject, body.htmlBody, body.statuses);

    ctx.body = { data: result };
  },

  async sendTest(ctx: any) {
    const { documentId } = ctx.params;
    const body = ctx.request.body ?? {};

    if (!documentId) {
      ctx.status = 400;
      ctx.body = { error: 'documentId is required' };
      return;
    }

    if (!body.subject || !body.htmlBody) {
      ctx.status = 400;
      ctx.body = { error: 'subject and htmlBody are required' };
      return;
    }

    // Get admin email from the authenticated user's JWT
    const adminEmail = ctx.state.user?.email;

    if (!adminEmail) {
      ctx.status = 400;
      ctx.body = { error: 'Authenticated admin email not found' };
      return;
    }

    const result = await strapi
      .plugin('iletisim-merkezi')
      .service('manualEmailService')
      .sendTestEmail(documentId, body.subject, body.htmlBody, adminEmail);

    ctx.body = { data: result };
  },
});

export default manualEmailController;
