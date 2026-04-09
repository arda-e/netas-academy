import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ApplicationError, NotFoundError, ValidationError } = errors;

type SendRegistrationEmailInput = {
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  statuses?: string[];
};

type RegistrationWithStudent = {
  id: number;
  status: string;
  student?: {
    id: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
  } | null;
};

const normalizeStatuses = (statuses?: string[]) =>
  Array.isArray(statuses) && statuses.length > 0 ? statuses : ['confirmed', 'pending'];

export default factories.createCoreService('api::event.event', () => ({
  async sendRegistrationEmail(documentId: string, input: SendRegistrationEmailInput) {
    const event = await strapi.db.query('api::event.event').findOne({
      where: { documentId },
      select: ['id', 'documentId', 'title', 'slug', 'startsAt', 'location'],
      populate: {
        registrations: {
          populate: {
            student: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (!strapi.plugin('email')?.provider) {
      throw new ApplicationError('Email provider is not configured');
    }

    const statuses = normalizeStatuses(input.statuses);
    const registrations = ((event.registrations ?? []) as RegistrationWithStudent[]).filter(
      (registration) =>
        statuses.includes(registration.status) &&
        registration.student?.email
    );

    if (registrations.length === 0) {
      throw new ValidationError('No matching registrations with email addresses were found for this event');
    }

    const sentEmails = new Set<string>();
    const sentRegistrationIds: number[] = [];

    for (const registration of registrations) {
      const email = registration.student?.email?.trim().toLowerCase();

      if (!email || sentEmails.has(email)) {
        continue;
      }

      await strapi.plugin('email').service('email').sendTemplatedEmail(
        {
          to: email,
          from: input.from,
          replyTo: input.replyTo,
        },
        {
          subject: input.subject,
          text: input.text ?? '',
          html: input.html ?? '',
        },
        {
          event: {
            documentId: event.documentId,
            title: event.title,
            slug: event.slug,
            startsAt: event.startsAt,
            location: event.location,
          },
          student: registration.student,
          registration: {
            id: registration.id,
            status: registration.status,
          },
        }
      );

      sentEmails.add(email);
      sentRegistrationIds.push(registration.id);
    }

    const now = new Date().toISOString();

    for (const registrationId of sentRegistrationIds) {
      await strapi.db.query('api::registration.registration').update({
        where: { id: registrationId },
        data: {
          lastEmailSentAt: now,
        },
      });
    }

    return {
      event: {
        documentId: event.documentId,
        title: event.title,
      },
      attemptedRecipients: registrations.length,
      sentRecipients: sentEmails.size,
      statuses,
      sentAt: now,
    };
  },
}));
