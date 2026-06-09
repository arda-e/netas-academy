import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import { deliverInternalNotificationViaStrapi } from '../../../services/internal-notifications/strapi-service';

import { isEventRegistrationOpen } from '../../../utils/event-registration';
import { isValidTckn, normalizeTcknValue, maskTcknValue } from '../../../utils/tckn';


const { NotFoundError, ValidationError } = errors;

type RegisterStudentInput = {
  eventDocumentId: string;
  student: {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    tckn?: string;
  };
  status?: 'pending' | 'confirmed' | 'cancelled' | 'waitlisted' | 'attended';
  notes?: string;
  kvkkConsent?: boolean;
};

type SanitizedRegistration = {
  id: number;
  status: string;
  event: {
    documentId: string;
    title: string;
  };
};

export default factories.createCoreService('api::registration.registration' as any, () => ({
  async registerStudentForEvent(input: RegisterStudentInput): Promise<SanitizedRegistration> {
    const normalizedTckn = normalizeTcknValue(input.student.tckn ?? "");

    const event = await strapi.db.query('api::event.event').findOne({
      where: { documentId: input.eventDocumentId },
      select: ['id', 'documentId', 'title', 'slug', 'startsAt', 'keepRegistrationsOpen', 'eventType'],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (!isEventRegistrationOpen(event)) {
      throw new ValidationError('Event registration is closed');
    }

    // TCKN is required only for egitim/kurs events, not etkinlik
    // Positive matching so null/undefined eventType (legacy records) defaults to etkinlik behavior
    if (event.eventType === 'egitim' || event.eventType === 'kurs') {
      const tckn = typeof input.student.tckn === 'string' ? input.student.tckn : '';
      if (!isValidTckn(tckn)) {
        throw new ValidationError('Invalid TCKN');
      }
    }

    // KVKK consent is required only for egitim/kurs events, not etkinlik
    if (
      (event.eventType === 'egitim' || event.eventType === 'kurs') &&
      input.kvkkConsent !== true
    ) {
      throw new ValidationError('kvkkConsent must be true');
    }

    // Wrap the entire registration flow in a transaction to prevent race conditions.
    // Notification delivery is moved outside the transaction (fire-and-forget).
    const registration = await strapi.db.transaction(async () => {
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

      // Idempotent: if already registered, return success with sanitized data
      if (existingRegistration) {
        return existingRegistration;
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
    });

    // Fire-and-forget notification (outside transaction)
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

    // Return sanitized response — no student PII
    return {
      id: registration.id,
      status: registration.status,
      event: {
        documentId: registration.event.documentId,
        title: registration.event.title,
      },
    };
  },
}));
