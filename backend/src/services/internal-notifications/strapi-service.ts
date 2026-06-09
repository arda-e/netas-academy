import type { Core } from "@strapi/strapi";

import { deliverInternalNotification as deliverCore } from "./service-core";
import { createStrapiEmailSender } from "../email/strapi-adapter";
import type { InternalNotificationEnvelope } from "./types";

const NOTIFICATION_ROUTING_UID = 'api::notification-routing.notification-routing';

export const deliverInternalNotificationViaStrapi = <K extends InternalNotificationEnvelope["key"]>(
  strapi: Core.Strapi,
  envelope: InternalNotificationEnvelope<K>,
) => {
  return deliverCore({
    envelope,
    loadRoutingByKey: async (key) => {
      return strapi.db.query(NOTIFICATION_ROUTING_UID).findOne({
        where: { key },
        select: ['key', 'label', 'enabled', 'customEmails'],
      });
    },
    sendEmail: async ({ to, subject, text }) => {
      await createStrapiEmailSender(strapi).send({ to: to.join(', '), subject, text });
    },
    warn: (message, meta) => strapi.log.warn(message, meta),
    error: (message, meta) => strapi.log.error(message, meta),
  });
};
