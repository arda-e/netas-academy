import type { Core } from "@strapi/strapi";

import { deliverInternalNotification } from "./service-core";
import type { InternalNotificationEnvelope } from "./types";

const NOTIFICATION_ROUTING_UID = "api::notification-routing.notification-routing";

const NOTIFICATION_ROUTING_POPULATE = {
  adminRoles: {
    populate: {
      users: {
        fields: ["email"],
      },
    },
  },
} as const;

export const deliverInternalNotificationViaStrapi = <K extends InternalNotificationEnvelope["key"]>(
  strapi: Core.Strapi,
  envelope: InternalNotificationEnvelope<K>,
) =>
  deliverInternalNotification({
    envelope,
    loadRoutingByKey: (key) =>
      strapi.db.query(NOTIFICATION_ROUTING_UID).findOne({
        where: { key },
        select: ["key", "label", "enabled", "customEmails"],
        populate: NOTIFICATION_ROUTING_POPULATE,
      }),
    sendEmail: ({ to, subject, text }) =>
      strapi.plugin("email").service("email").send({
        to,
        subject,
        text,
      }),
    warn: (message, meta) => strapi.log.warn(message, meta),
    error: (message, meta) => strapi.log.error(message, meta),
  });
