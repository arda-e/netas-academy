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
  'api::site-setting.site-setting.find',
  'plugin::upload.content-api.find',
  'plugin::upload.content-api.findOne',
];

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

    // Safety net: unique constraint on (student_id, event_id) to prevent
    // duplicate registrations at the database level.
    try {
      await strapi.db.connection.raw(
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_student_event ON registrations (student_id, event_id)'
      );
    } catch (error) {
      strapi.log.warn('Could not create unique index on registrations(student_id, event_id)', { error });
    }
  },
};
