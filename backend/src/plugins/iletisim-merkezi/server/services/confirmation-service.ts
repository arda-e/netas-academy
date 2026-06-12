import type { Core } from '@strapi/strapi';
import { renderTemplate } from '../../../../services/email-templates/renderer';
import type { EmailSender } from '../../../../services/email';

const TEMPLATE_UID = 'plugin::iletisim-merkezi.confirmation-template';

const ACADEMY_NAME = 'Netas Academy';
const TIMEZONE = 'TSİ (UTC+3)';
const SUPPORT_EMAIL = 'destek@netasacademy.com';
const LOGO_PNG_URL = ''; // TODO: set production URL

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
            select: ['id', 'documentId', 'title', 'startsAt', 'endsAt', 'eventType', 'location', 'meetingLink', 'autoConfirmationEnabled'],
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

      // Check global enable/disable switch
      const template = await strapi.db.query(TEMPLATE_UID).findOne({ select: ['enabled'] });

      if (!template?.enabled) {
        strapi.log.warn('[iletisim-merkezi] auto-confirmation: confirmation template is disabled');
        return;
      }

      // Compute template params
      const programTitle = event.title ?? '';
      const programDate = event.startsAt
        ? new Date(event.startsAt).toLocaleDateString('tr-TR', { dateStyle: 'full' })
        : '';
      const programTime = event.startsAt
        ? new Date(event.startsAt).toLocaleTimeString('tr-TR', { timeStyle: 'short' })
        : '';
      const eventTypeMap: Record<string, string> = { etkinlik: 'Etkinlik', egitim: 'Eğitim', kurs: 'Kurs' };
      const programType = eventTypeMap[event.eventType ?? ''] ?? 'Etkinlik';
      let duration = '';
      if (event.startsAt && event.endsAt) {
        const mins = Math.round((new Date(event.endsAt).getTime() - new Date(event.startsAt).getTime()) / 60000);
        const hours = Math.floor(mins / 60);
        const rem = mins % 60;
        duration = hours > 0 && rem === 0 ? `${hours} saat` : hours > 0 ? `${hours} saat ${rem} dakika` : `${mins} dakika`;
      }
      const deliveryMode = event.meetingLink ? 'Çevrimiçi' : (event.location ?? 'Yüz Yüze');
      const joinUrl = event.meetingLink ?? '';

      const params: Record<string, string> = {
        firstName: student.firstName ?? '',
        programTitle,
        programDate,
        programTime,
        programType,
        duration,
        deliveryMode,
        joinUrl,
        registrationId: String(registration.id),
        calendarUrl: '',
        academyName: ACADEMY_NAME,
        logoPngUrl: LOGO_PNG_URL,
        preheader: `${programTitle} etkinliğine kaydınız alındı.`,
        preparationNote: '',
        supportEmail: SUPPORT_EMAIL,
        timezone: TIMEZONE,
      };

      const html = await renderTemplate('01_registration_confirmation.html', params);

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
