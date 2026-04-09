import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import { isValidTckn } from '../../../utils/tckn';

const { ValidationError } = errors;

export default factories.createCoreController('api::registration.registration' as any, () => ({
  async register(ctx) {
    const body = ctx.request.body ?? {};
    const tckn = typeof body.student?.tckn === 'string' ? body.student.tckn : '';

    if (!body.eventDocumentId || !body.student?.firstName || !body.student?.email || !tckn) {
      throw new ValidationError('eventDocumentId, student.firstName, student.email, and student.tckn are required');
    }

    if (!isValidTckn(tckn)) {
      throw new ValidationError('Invalid TCKN');
    }

    const registration = await strapi
      .service('api::registration.registration')
      .registerStudentForEvent({
        eventDocumentId: body.eventDocumentId,
        student: body.student,
        status: body.status,
        notes: body.notes,
      });

    ctx.body = { data: registration };
  },
}));
