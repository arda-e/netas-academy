import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

const VALID_LEAD_TYPES = [
  'corporate_training_request',
  'instructor_application',
  'solution_partner_application',
  'general_contact',
] as const;

export default factories.createCoreController(
  'api::contact-submission.contact-submission' as any,
  () => ({
    async submit(ctx) {
      const body = ctx.request.body ?? {};

      if (!body.leadType || !VALID_LEAD_TYPES.includes(body.leadType)) {
        throw new ValidationError(
          'leadType is required and must be one of: corporate_training_request, instructor_application, solution_partner_application, general_contact'
        );
      }

      if (!body.fullName || !body.email || !body.phone || !body.message) {
        throw new ValidationError(
          'fullName, email, phone, and message are required'
        );
      }

      if (!body.kvkkConsent) {
        throw new ValidationError('kvkkConsent must be true');
      }

      const submission = await strapi
        .service('api::contact-submission.contact-submission')
        .createSubmission(body);

      ctx.body = { data: submission };
    },
  })
);
