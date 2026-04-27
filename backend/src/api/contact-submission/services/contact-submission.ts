import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import { deliverInternalNotificationViaStrapi } from '../../../services/internal-notifications/strapi-service';

const { ValidationError } = errors;

type CreateContactSubmissionInput = {
  leadType: 'corporate_training_request' | 'instructor_application' | 'solution_partner_application' | 'general_contact';
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  interestTopic?: string;
  expertiseAreas?: string;
  companySize?: string;
  partnershipDetails?: string;
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
      const leadType = input.leadType;
      const fullName = normalizeWhitespace(input.fullName);
      const email = normalizeEmail(input.email);
      const phone = normalizeWhitespace(input.phone);
      const company = normalizeWhitespace(input.company);
      const message = normalizeMultiline(input.message);

      if (!leadType || !fullName || !email || !phone || !message) {
        throw new ValidationError(
          'leadType, fullName, email, phone, and message are required'
        );
      }

      // Type-specific field validation
      if (leadType === 'corporate_training_request' && !input.interestTopic) {
        throw new ValidationError('interestTopic is required for corporate training requests');
      }
      if (leadType === 'instructor_application' && !input.expertiseAreas) {
        throw new ValidationError('expertiseAreas is required for instructor applications');
      }
      if (leadType === 'solution_partner_application' && !input.companySize) {
        throw new ValidationError('companySize is required for solution partner applications');
      }

      const submission = await strapi.db.query('api::contact-submission.contact-submission').create({
        data: {
          leadType,
          fullName,
          email,
          phone,
          company: company || null,
          message,
          interestTopic: normalizeWhitespace(input.interestTopic) || null,
          expertiseAreas: normalizeMultiline(input.expertiseAreas ?? '') || null,
          companySize: normalizeWhitespace(input.companySize) || null,
          partnershipDetails: normalizeMultiline(input.partnershipDetails ?? '') || null,
          submittedAt: new Date().toISOString(),
          status: 'new',
        },
      });

      const notificationKey = getNotificationKeyForLeadType(leadType);
      const notificationPayload = buildNotificationPayload(leadType, submission);

      try {
        await deliverInternalNotificationViaStrapi(strapi, {
          key: notificationKey,
          payload: notificationPayload,
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

function getNotificationKeyForLeadType(
  leadType: CreateContactSubmissionInput['leadType']
): 'lead_corporate_training' | 'lead_instructor_application' | 'lead_solution_partner' | 'contact_submission' {
  switch (leadType) {
    case 'corporate_training_request':
      return 'lead_corporate_training';
    case 'instructor_application':
      return 'lead_instructor_application';
    case 'solution_partner_application':
      return 'lead_solution_partner';
    case 'general_contact':
    default:
      return 'contact_submission';
  }
}

function buildNotificationPayload(
  leadType: CreateContactSubmissionInput['leadType'],
  submission: Record<string, unknown>
) {
  const base = {
    submissionId: submission.id as number,
    fullName: submission.fullName as string,
    email: submission.email as string,
    phone: submission.phone as string | undefined,
    company: submission.company as string | undefined,
    message: submission.message as string,
    submittedAt: submission.submittedAt as string,
  };

  switch (leadType) {
    case 'corporate_training_request':
      return {
        ...base,
        interestTopic: submission.interestTopic as string | undefined,
      };
    case 'instructor_application':
      return {
        ...base,
        expertiseAreas: submission.expertiseAreas as string | undefined,
      };
    case 'solution_partner_application':
      return {
        ...base,
        companySize: submission.companySize as string | undefined,
        partnershipDetails: submission.partnershipDetails as string | undefined,
      };
    case 'general_contact':
    default:
      return base;
  }
}
