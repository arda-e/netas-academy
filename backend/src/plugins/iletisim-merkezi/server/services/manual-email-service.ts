import type { Core } from '@strapi/strapi';

type RegistrationWithStudent = {
  id: number;
  status: string;
  lastEmailSentAt?: string | null;
  student?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
};

const DEFAULT_STATUSES = ['confirmed'];

const manualEmailService = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Send a manual email to filtered registrants of an event.
   */
  async sendManualEmail(
    eventDocumentId: string,
    subject: string,
    htmlBody: string,
    statuses?: string[]
  ) {
    const filterStatuses = Array.isArray(statuses) && statuses.length > 0 ? statuses : DEFAULT_STATUSES;

    // Fetch event with registrations populated
    const event = await strapi.db.query('api::event.event').findOne({
      where: { documentId: eventDocumentId },
      select: ['id', 'documentId', 'title', 'slug', 'startsAt', 'meetingLink'],
      populate: {
        registrations: {
          populate: {
            student: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error(`Event not found: ${eventDocumentId}`);
    }

    const registrations = ((event.registrations ?? []) as RegistrationWithStudent[]).filter(
      (r) => filterStatuses.includes(r.status) && r.student?.email
    );

    if (registrations.length === 0) {
      throw new Error('No matching registrations with email addresses were found');
    }

    // Append meeting link if available (R7)
    let finalHtml = htmlBody;
    if (event.meetingLink) {
      finalHtml += `\n\n<p><strong>Etkinlik Katılım Linki:</strong> <a href="${event.meetingLink}">${event.meetingLink}</a></p>`;
    }

    // Deduplicate by student email (R10)
    const sentEmails = new Set<string>();
    const sentIds: number[] = [];
    let skippedCount = 0;
    const failedEmails: string[] = [];

    for (const registration of registrations) {
      const email = registration.student?.email?.trim().toLowerCase();

      if (!email || sentEmails.has(email)) {
        skippedCount++;
        continue;
      }

      try {
        await strapi.plugin('email').service('email').send({
          to: email,
          subject,
          html: finalHtml,
        });

        sentEmails.add(email);
        sentIds.push(registration.id);
      } catch (error) {
        failedEmails.push(email);
        strapi.log.error(`[iletisim-merkezi] manual email failed for ${email}`, { error });
      }
    }

    // Update lastEmailSentAt for each sent registration
    const now = new Date().toISOString();
    for (const registrationId of sentIds) {
      await strapi.db.query('api::registration.registration').update({
        where: { id: registrationId },
        data: { lastEmailSentAt: now },
      });
    }

    return {
      event: {
        documentId: event.documentId,
        title: event.title,
      },
      attemptedRecipients: registrations.length,
      sentRecipients: sentEmails.size,
      skippedRecipients: skippedCount,
      failedRecipients: failedEmails.length,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      statuses: filterStatuses,
      sentAt: now,
    };
  },

  /**
   * Send a test email to the admin's own email — no registration updates.
   */
  async sendTestEmail(
    eventDocumentId: string,
    subject: string,
    htmlBody: string,
    adminEmail: string
  ) {
    const event = await strapi.db.query('api::event.event').findOne({
      where: { documentId: eventDocumentId },
      select: ['documentId', 'title', 'startsAt', 'meetingLink'],
    });

    if (!event) {
      throw new Error(`Event not found: ${eventDocumentId}`);
    }

    let finalHtml = htmlBody;
    if (event.meetingLink) {
      finalHtml += `\n\n<p><strong>Etkinlik Katılım Linki:</strong> <a href="${event.meetingLink}">${event.meetingLink}</a></p>`;
    }

    await strapi.plugin('email').service('email').send({
      to: adminEmail,
      subject: `[TEST] ${subject}`,
      html: finalHtml,
    });

    return {
      sentTo: adminEmail,
      event: {
        documentId: event.documentId,
        title: event.title,
      },
      sentAt: new Date().toISOString(),
    };
  },
});

export default manualEmailService;
