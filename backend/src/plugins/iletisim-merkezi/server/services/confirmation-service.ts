import type { Core } from '@strapi/strapi';
import { replaceTemplateVariables } from './utils/template';
import type { EmailSender } from '../../../../services/email';

const TEMPLATE_UID = 'plugin::iletisim-merkezi.confirmation-template';

const confirmationService = ({ strapi, emailSender }: { strapi: Core.Strapi; emailSender: EmailSender }) => ({
  /**
   * Send an auto-confirmation email for a registration.
   * Fire-and-forget: errors are caught and logged, never thrown.
   */
  async sendAutoConfirmation(registrationId: number) {
    try {
      // Load registration with event and student
      const registration = await strapi.db.query('api::registration.registration').findOne({
        where: { id: registrationId },
        populate: {
          event: {
            select: ['id', 'documentId', 'title', 'startsAt', 'location', 'meetingLink', 'autoConfirmationEnabled'],
          },
          student: {
            select: ['id', 'firstName', 'lastName', 'email'],
          },
        },
      });

      if (!registration) {
        strapi.log.warn(`[iletisim-merkezi] auto-confirmation: registration ${registrationId} not found`);
        return;
      }

      const event = registration.event;
      const student = registration.student;

      if (!event?.autoConfirmationEnabled) {
        // Auto-confirmation not enabled for this event — skip
        return;
      }

      if (!student?.email) {
        strapi.log.warn(`[iletisim-merkezi] auto-confirmation: student has no email for registration ${registrationId}`);
        return;
      }

      // Load template
      const template = await strapi.db.query(TEMPLATE_UID).findOne({ select: ['htmlBody', 'enabled'] });

      if (!template?.enabled) {
        strapi.log.warn('[iletisim-merkezi] auto-confirmation: confirmation template is disabled');
        return;
      }

      const htmlBody = template.htmlBody || '';

      // Replace template variables
      const html = replaceTemplateVariables(htmlBody, {
        title: event.title,
        startsAt: event.startsAt,
        location: event.location,
        meetingLink: event.meetingLink,
      });

      // Send email
      await emailSender.send({
        to: student.email,
        subject: `Kaydınız Onaylandı — ${event.title}`,
        html,
      });

      // Update lastEmailSentAt
      await strapi.db.query('api::registration.registration').update({
        where: { id: registrationId },
        data: { lastEmailSentAt: new Date().toISOString() },
      });

      strapi.log.info(`[iletisim-merkezi] auto-confirmation sent to ${student.email} for event "${event.title}"`);
    } catch (error) {
      strapi.log.error(`[iletisim-merkezi] auto-confirmation failed for registration ${registrationId}`, { error });
    }
  },
});

export default confirmationService;
