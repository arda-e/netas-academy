import type { Core } from '@strapi/strapi';

const PUBLIC_READ_ACTIONS = [
  'api::teacher.teacher.find',
  'api::teacher.teacher.findOne',
  'api::course.course.find',
  'api::course.course.findOne',
  'api::event.event.find',
  'api::event.event.findOne',
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
  'api::blog-author.blog-author.find',
  'api::blog-author.blog-author.findOne',
  'plugin::upload.content-api.find',
  'plugin::upload.content-api.findOne',
];

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

const ensurePublicReadPermissions = async (strapi: Core.Strapi) => {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
    select: ['id', 'name', 'description'],
  });

  if (!publicRole?.id) {
    return;
  }

  const roleService = strapi.plugin('users-permissions').service('role');
  const role = await roleService.findOne(publicRole.id);
  const permissions = role.permissions ?? {};

  let changed = false;

  for (const action of PUBLIC_READ_ACTIONS) {
    const [type, controller, actionName] = action.split('.');
    const current = permissions?.[type]?.controllers?.[controller]?.[actionName];

    if (!current?.enabled) {
      permissions[type] ??= { controllers: {} };
      permissions[type].controllers ??= {};
      permissions[type].controllers[controller] ??= {};
      permissions[type].controllers[controller][actionName] = {
        enabled: true,
        policy: '',
      };
      changed = true;
    }
  }

  if (!changed) {
    return;
  }

  await roleService.updateRole(publicRole.id, {
    name: role.name,
    description: role.description,
    permissions,
  });
};

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

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensurePublicReadPermissions(strapi);
    await ensureNotificationRoutingDefaults(strapi);
  },
};
