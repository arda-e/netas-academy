import type { Core } from '@strapi/strapi';

const templateController = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getTemplate(ctx: any) {
    const template = await strapi
      .plugin('iletisim-merkezi')
      .service('templateService')
      .get();

    ctx.body = { data: template };
  },

  async updateTemplate(ctx: any) {
    const body = ctx.request.body ?? {};

    if (body.htmlBody === undefined) {
      ctx.status = 400;
      ctx.body = { error: 'htmlBody is required' };
      return;
    }

    const result = await strapi
      .plugin('iletisim-merkezi')
      .service('templateService')
      .update(body.htmlBody, body.enabled);

    ctx.body = { data: result };
  },

  async resetTemplate(ctx: any) {
    const result = await strapi
      .plugin('iletisim-merkezi')
      .service('templateService')
      .reset();

    ctx.body = { data: result };
  },
});

export default templateController;
