import type { Core } from "@strapi/strapi";

import type { InternalNotificationEnvelope } from "./types";

export const deliverInternalNotificationViaStrapi = <K extends InternalNotificationEnvelope["key"]>(
  strapi: Core.Strapi,
  envelope: InternalNotificationEnvelope<K>,
) => {
  const deliver = strapi.plugin("internal-notifications").service("deliverInternalNotification") as (e: InternalNotificationEnvelope<K>) => Promise<any>;
  return deliver(envelope);
};
