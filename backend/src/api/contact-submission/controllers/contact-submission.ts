import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

export default factories.createCoreController(
  'api::contact-submission.contact-submission' as any,
  () => ({
    async submit(ctx) {
      const body = ctx.request.body ?? {};

      if (
        !body.firstName ||
        !body.lastName ||
        !body.email ||
        !body.phone ||
        !body.subject ||
        !body.message
      ) {
        throw new ValidationError(
          'firstName, lastName, email, phone, subject, and message are required'
        );
      }

      const submission = await strapi
        .service('api::contact-submission.contact-submission')
        .createSubmission(body);

      ctx.body = { data: submission };
    },
  })
);
