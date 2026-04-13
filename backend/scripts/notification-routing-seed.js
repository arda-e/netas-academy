'use strict';

async function ensureNotificationRoutingSeedDefaults(strapi, routings, result) {
  for (const routing of routings) {
    const existing = await strapi.db.query('api::notification-routing.notification-routing').findOne({
      where: { key: routing.key },
      select: ['id', 'key'],
    });

    if (existing && existing.id) {
      continue;
    }

    await strapi.db.query('api::notification-routing.notification-routing').create({
      data: routing,
    });

    result.notificationRoutings.created += 1;
  }
}

module.exports = {
  ensureNotificationRoutingSeedDefaults,
};
