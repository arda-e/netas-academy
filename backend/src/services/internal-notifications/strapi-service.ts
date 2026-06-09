import type { Core } from "@strapi/strapi";

import { deliverInternalNotification as deliverCore } from "./service-core";
import type { InternalNotificationEnvelope } from "./types";

const NOTIFICATION_ROUTING_UID = 'api::notification-routing.notification-routing';

export const deliverInternalNotificationViaStrapi = <K extends InternalNotificationEnvelope["key"]>(
  strapi: Core.Strapi,
  envelope: InternalNotificationEnvelope<K>,
) => {
  return deliverCore({
    envelope,
    loadRoutingByKey: async (key) => {
      console.log(`[internal-notifications] querying routing for key=${key}`);
      const result = await strapi.db.query(NOTIFICATION_ROUTING_UID).findOne({
        where: { key },
        select: ['key', 'label', 'enabled', 'customEmails'],
      });
      console.log(`[internal-notifications] db result:`, result);
      return result;
    },
    sendEmail: async ({ to, subject, text }) => {
      const toStr = to.join(', ');
      console.log(`[internal-notifications] sending email to="${toStr}" subject="${subject}"`);
      await strapi.plugin('email').service('email').send({ to: toStr, subject, text });
      console.log(`[internal-notifications] email sent OK`);
    },
    warn: (message, meta) => strapi.log.warn(message, meta),
    error: (message, meta) => strapi.log.error(message, meta),
  });
};
