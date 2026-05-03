import { factories } from '@strapi/strapi';

import { isValidTckn } from '../../../utils/tckn';
import { formatError, formatSuccess, validateBody } from '../../../utils/controller-helpers';

export default factories.createCoreController('api::registration.registration' as any, () => ({
  async register(ctx) {
    const body = ctx.request.body ?? {};
    const tckn = typeof body.student?.tckn === 'string' ? body.student.tckn : '';

    const err = validateBody(body, ['eventDocumentId', 'student.firstName', 'student.lastName', 'student.email', 'student.tckn']);
    if (err) {
      ctx.body = err;
      ctx.status = err.status;
      return;
    }

    if (!isValidTckn(tckn)) {
      const err = formatError('Invalid TCKN');
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
