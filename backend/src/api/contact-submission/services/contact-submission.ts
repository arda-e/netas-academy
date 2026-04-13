import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import { deliverInternalNotificationViaStrapi } from '../../../services/internal-notifications/strapi-service';

const { ValidationError } = errors;

type CreateContactSubmissionInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  message: string;
};

const normalizeWhitespace = (value?: string | null) => value?.trim().replace(/\s+/g, ' ') || '';
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizeMultiline = (value: string) =>
  value
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

export default factories.createCoreService(
  'api::contact-submission.contact-submission' as any,
  () => ({
    async createSubmission(input: CreateContactSubmissionInput) {
      const firstName = normalizeWhitespace(input.firstName);
      const lastName = normalizeWhitespace(input.lastName);
      const email = normalizeEmail(input.email);
      const phone = normalizeWhitespace(input.phone);
      const company = normalizeWhitespace(input.company);
      const subject = normalizeWhitespace(input.subject);
      const message = normalizeMultiline(input.message);
      const fullName = [firstName, lastName].filter(Boolean).join(' ');

      if (!firstName || !lastName || !email || !phone || !subject || !message) {
        throw new ValidationError(
          'firstName, lastName, email, phone, subject, and message are required'
        );
      }

      const submission = await strapi.db.query('api::contact-submission.contact-submission').create({
        data: {
          firstName,
          lastName,
          fullName,
          email,
          phone,
          company: company || null,
          subject,
          message,
          submittedAt: new Date().toISOString(),
          status: 'new',
        },
      });

      try {
        await deliverInternalNotificationViaStrapi(strapi, {
          key: 'contact_submission',
          payload: {
            submissionId: submission.id,
            fullName: submission.fullName,
            email: submission.email,
            phone: submission.phone,
            company: submission.company,
            subject: submission.subject,
            message: submission.message,
            submittedAt: submission.submittedAt,
          },
        });
      } catch (error) {
        strapi.log.error('Contact submission notification delivery failed', {
          submissionId: submission.id,
          error,
        });
      }

      return submission;
    },
  })
);
