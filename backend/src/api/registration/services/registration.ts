import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import { deliverInternalNotificationViaStrapi } from '../../../services/internal-notifications/strapi-service';
import { createCheckoutHandoff } from '../../../services/payment-orchestration/service';
import { runSplCheck } from '../../../services/spl-check/service';

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
  status?: 'pending' | 'payment_pending' | 'blocked' | 'confirmed' | 'cancelled' | 'waitlisted' | 'attended';
  notes?: string;
  kvkkConsent?: boolean;
};

type SanitizedRegistration = {
  id: number;
  status: string;
  nextAction?: 'registration_received' | 'render_checkout' | 'payment_retry';
  payment?: Awaited<ReturnType<typeof createCheckoutHandoff>>;
  event: {
    documentId: string;
    title: string;
  };
};

const toAmountMinor = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const numeric = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return Math.round(numeric * 100);
};

export default factories.createCoreService('api::registration.registration' as any, () => ({
  async registerStudentForEvent(input: RegisterStudentInput): Promise<SanitizedRegistration> {
    const normalizedTckn = normalizeTcknValue(input.student.tckn ?? "");

    const event = await strapi.db.query('api::event.event').findOne({
      where: { documentId: input.eventDocumentId },
      select: ['id', 'documentId', 'title', 'slug', 'startsAt', 'keepRegistrationsOpen', 'eventType', 'price', 'location'],
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

    // SPL sanctions check runs before writes. Blocked results are stored silently
    // so the public response does not reveal sanctions-screening details.
    const splResult = await runSplCheck({
      applicationNumber: `EVT-${event.documentId}`,
      firstName: input.student.firstName,
      lastName: input.student.lastName ?? null,
      email: input.student.email,
      phone: input.student.phone ?? null,
      tckn: normalizedTckn || null,
    });

    if (splResult.decision === 'manual_review') {
      strapi.log.warn('[registration] SPL check returned manual_review — registration will proceed for staff review', {
        eventDocumentId: input.eventDocumentId,
        firstName: input.student.firstName,
        lastName: input.student.lastName,
        statusCode: splResult.statusCode,
        errorReason: splResult.errorReason,
      });
    }

    // Wrap the entire registration flow in a transaction to prevent race conditions.
    // Notification delivery is moved outside the transaction (fire-and-forget).
    const eventAmountMinor = toAmountMinor(event.price);
    const registrationStatus =
      splResult.decision === 'blocked' ? 'blocked' : eventAmountMinor > 0 ? 'payment_pending' : input.status ?? 'pending';

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
          registrationStatus,
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

    let payment: SanitizedRegistration['payment'] | undefined;
    if (registration.registrationStatus === 'payment_pending') {
      payment = await createCheckoutHandoff({
        parent: {
          parentType: 'registration',
          parentEntityId: registration.id,
          parentDocumentId: registration.documentId ?? null,
        },
        amountMinor: eventAmountMinor,
        currency: 'TRY',
        payer: {
          firstName: registration.student.firstName,
          lastName: registration.student.lastName,
          email: registration.student.email,
          phone: registration.student.phone,
          identityNumber: normalizedTckn || null,
        },
        title: registration.event.title,
        idempotencyKey: `registration:${registration.id}`,
      });
    }

    // Fire-and-forget notification (outside transaction)
    try {
      await deliverInternalNotificationViaStrapi(strapi, {
        key: 'event_registration',
        payload: {
          registrationId: registration.id,
          status: registration.registrationStatus,
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
    const response: SanitizedRegistration = {
      id: registration.id,
      status: registration.registrationStatus,
      event: {
        documentId: registration.event.documentId,
        title: registration.event.title,
      },
    };

    if (registration.registrationStatus === 'blocked' || registration.registrationStatus === 'payment_pending') {
      response.nextAction =
        payment?.status === 'checkout_created'
          ? 'render_checkout'
          : registration.registrationStatus === 'payment_pending'
            ? 'payment_retry'
            : 'registration_received';
      if (payment) {
        response.payment = payment;
      }
    }

    return response;
  },

  async completePaidRegistration(input: { registrationId: number }) {
    const registration = await strapi.db.query('api::registration.registration').findOne({
      where: { id: input.registrationId },
      populate: {
        event: true,
        student: true,
      },
    });

    if (!registration) {
      throw new NotFoundError('Registration not found');
    }

    if (registration.registrationStatus === 'confirmed') {
      return { completed: false, parentStatus: 'confirmed' };
    }

    await strapi.db.query('api::registration.registration').update({
      where: { id: input.registrationId },
      data: { registrationStatus: 'confirmed' },
    });

    return { completed: true, parentStatus: 'confirmed' };
  },
}));
