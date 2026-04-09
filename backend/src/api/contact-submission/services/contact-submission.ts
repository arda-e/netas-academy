import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

const CONTACT_RECIPIENTS = ['einanc@netas.com.tr', 'pcaglar@netas.com.tr'];

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

      return strapi.db.query('api::contact-submission.contact-submission').create({
        data: {
          firstName,
          lastName,
          fullName,
          email,
          phone,
          company: company || null,
          subject,
          message,
          recipientEmails: CONTACT_RECIPIENTS,
          submittedAt: new Date().toISOString(),
          status: 'new',
        },
      });
    },
  })
);
