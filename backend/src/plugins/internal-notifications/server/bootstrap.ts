import type { Core } from '@strapi/strapi';

const DEFAULT_NOTIFICATION_ROUTINGS = [
  {
    key: 'contact_submission',
    label: 'Iletisim Formu Bildirimi',
    enabled: true,
    customEmails: [],
  },
  {
    key: 'event_registration',
    label: 'Etkinlik Kayit Bildirimi',
    enabled: true,
    customEmails: [],
  },
  {
    key: 'course_application_submitted',
    label: 'Kurs Basvurusu Onay Bildirimi',
    enabled: true,
    customEmails: [],
  },
  {
    key: 'course_application_manual_review',
    label: 'Kurs Basvurusu Manuel Inceleme Bildirimi',
    enabled: true,
    customEmails: [],
  },
  {
    key: 'course_payment_pending',
    label: 'Kurs Odeme Bekliyor Bildirimi',
    enabled: true,
    customEmails: [],
  },
  {
    key: 'lead_corporate_training',
    label: 'Kurumsal Egitim Talebi Bildirimi',
    enabled: true,
    customEmails: [],
  },
  {
    key: 'lead_instructor_application',
    label: 'Egitmen Basvurusu Bildirimi',
    enabled: true,
    customEmails: [],
  },
  {
    key: 'lead_solution_partner',
    label: 'Cozum Ortakligi Basvurusu Bildirimi',
    enabled: true,
    customEmails: [],
  },
] as const;

const ensureNotificationRoutingDefaults = async (strapi: Core.Strapi) => {
  for (const entry of DEFAULT_NOTIFICATION_ROUTINGS) {
    const existing = await strapi.db.query('api::notification-routing.notification-routing').findOne({
      where: { key: entry.key },
      select: ['id', 'key'],
    });

    if (existing?.id) {
      continue;
    }

    await strapi.db.query('api::notification-routing.notification-routing').create({
      data: entry,
    });
  }
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  await ensureNotificationRoutingDefaults(strapi);
};
