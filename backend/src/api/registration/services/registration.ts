import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { NotFoundError, ValidationError } = errors;

type RegisterStudentInput = {
  eventDocumentId: string;
  student: {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    tckn: string;
  };
  status?: 'pending' | 'confirmed' | 'cancelled' | 'waitlisted' | 'attended';
  notes?: string;
};

export default factories.createCoreService('api::registration.registration' as any, () => ({
  async registerStudentForEvent(input: RegisterStudentInput) {
    const event = await strapi.db.query('api::event.event').findOne({
      where: { documentId: input.eventDocumentId },
      select: ['id', 'documentId', 'title', 'slug'],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const student = await strapi.service('api::student.student').upsertByEmail(input.student);

    const existingRegistration = await strapi.db.query('api::registration.registration').findOne({
      where: {
        event: { id: event.id },
        student: { id: student.id },
      },
      populate: {
        event: true,
        student: true,
      },
    });

    if (existingRegistration) {
      throw new ValidationError('Student is already registered for this event');
    }

    return strapi.db.query('api::registration.registration').create({
      data: {
        status: input.status ?? 'pending',
        notes: input.notes ?? null,
        event: event.id,
        student: student.id,
      },
      populate: {
        event: true,
        student: true,
      },
    });
  },
}));
