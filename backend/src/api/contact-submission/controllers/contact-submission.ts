import { factories } from '@strapi/strapi';

import { formatError, formatSuccess, validateBody } from '../../../utils/controller-helpers';

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
        const err = formatError(
          'leadType is required and must be one of: corporate_training_request, instructor_application, solution_partner_application, general_contact'
        );
        ctx.body = err;
        ctx.status = err.status;
        return;
      }

      const err = validateBody(body, ['fullName', 'email', 'phone', 'message']);
      if (err) {
        ctx.body = err;
        ctx.status = err.status;
        return;
      }

      if (!body.kvkkConsent) {
        const err = formatError('kvkkConsent must be true');
        ctx.body = err;
        ctx.status = err.status;
        return;
      }

      const submission = await strapi
        .service('api::contact-submission.contact-submission')
        .createSubmission(body);

      ctx.body = formatSuccess(submission);
    },
  })
);
