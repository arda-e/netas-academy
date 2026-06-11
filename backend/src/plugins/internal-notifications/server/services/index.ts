import type { Core } from '@strapi/strapi';

import { deliverInternalNotification as deliverCore } from '../../../../services/internal-notifications/service-core';
import { createStrapiEmailSender } from '../../../../services/email/strapi-adapter';
import type { NotificationRoutingRecord } from '../../../../services/internal-notifications/service-core';
import type { InternalNotificationEnvelope } from '../../../../services/internal-notifications/types';

const NOTIFICATION_ROUTING_UID = 'api::notification-routing.notification-routing';

const services = {
  deliverInternalNotification: ({ strapi }: { strapi: Core.Strapi }) => ({
    deliver: <K extends InternalNotificationEnvelope['key']>(envelope: InternalNotificationEnvelope<K>) =>
      deliverCore({
        envelope,
        loadRoutingByKey: async (key) => {
          return strapi.db.query(NOTIFICATION_ROUTING_UID).findOne({
            where: { key },
            select: ['key', 'label', 'enabled', 'customEmails'],
          }) as NotificationRoutingRecord | null;
        },
        sendEmail: async ({ to, subject, text }) => {
          await createStrapiEmailSender(strapi).send({ to: to.join(', '), subject, text });
        },
        warn: (message, meta) => strapi.log.warn(message, meta),
        error: (message, meta) => strapi.log.error(message, meta),
      }),
  }),
};

export default services;
