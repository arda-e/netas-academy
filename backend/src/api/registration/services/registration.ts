import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import { isEventRegistrationOpen } from '../../../utils/event-registration';
import { normalizeTcknValue, maskTcknValue } from '../../../utils/tckn';
import { deliverInternalNotificationViaStrapi } from '../../../services/internal-notifications/strapi-service';

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
    const normalizedTckn = normalizeTcknValue(input.student.tckn);

    const event = await strapi.db.query('api::event.event').findOne({
      where: { documentId: input.eventDocumentId },
      select: ['id', 'documentId', 'title', 'slug', 'startsAt', 'keepRegistrationsOpen'],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (!isEventRegistrationOpen(event)) {
      throw new ValidationError('Event registration is closed');
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

    const registration = await strapi.db.query('api::registration.registration').create({
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

    try {
      await deliverInternalNotificationViaStrapi(strapi, {
        key: 'event_registration',
        payload: {
          registrationId: registration.id,
          status: registration.status,
          notes: registration.notes,
          event: {
            documentId: registration.event.documentId,
            title: registration.event.title,
            slug: registration.event.slug,
            startsAt: registration.event.startsAt,
            location: registration.event.location,
          },
          student: {
            firstName: registration.student.firstName,
            lastName: registration.student.lastName,
            email: registration.student.email,
            phone: registration.student.phone,
            tckn: maskTcknValue(normalizedTckn),
          },
        },
      });
    } catch (error) {
      strapi.log.error('Event registration notification delivery failed', {
        registrationId: registration.id,
        error,
      });
    }

    return registration;
  },
}));
