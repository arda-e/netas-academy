import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

export default factories.createCoreController('api::registration.registration' as any, () => ({
  async register(ctx) {
    const body = ctx.request.body ?? {};

    if (!body.eventDocumentId || !body.student?.firstName || !body.student?.email) {
      throw new ValidationError('eventDocumentId, student.firstName, and student.email are required');
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
