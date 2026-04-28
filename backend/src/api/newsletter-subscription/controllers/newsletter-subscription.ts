import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

export default factories.createCoreController(
  'api::newsletter-subscription.newsletter-subscription' as any,
  () => ({
    async subscribe(ctx) {
      const body = ctx.request.body ?? {};

      if (!body.email) {
        throw new ValidationError('email is required');
      }

      if (!body.consentAccepted) {
        throw new ValidationError('consentAccepted must be true');
      }

      const result = await strapi
        .service('api::newsletter-subscription.newsletter-subscription')
        .subscribe(body);

      ctx.body = { data: result };
    },
  })
);
