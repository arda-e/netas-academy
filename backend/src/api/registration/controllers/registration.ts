import { factories } from '@strapi/strapi';

import { formatSuccess, validateBody } from '../../../utils/controller-helpers';

export default factories.createCoreController('api::registration.registration' as any, () => ({
  async register(ctx) {
    const body = ctx.request.body ?? {};

    const err = validateBody(body, ['eventDocumentId', 'student.firstName', 'student.lastName', 'student.email']);
    if (err) {
      ctx.body = err;
      ctx.status = err.status;
      return;
    }

    const registration = await strapi
      .service('api::registration.registration')
      .registerStudentForEvent({
        eventDocumentId: body.eventDocumentId,
        student: body.student,
        status: body.status,
        notes: body.notes,
        kvkkConsent: body.kvkkConsent === true,
      });

    ctx.body = registration;
  },
}));
