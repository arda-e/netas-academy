import type { Core } from '@strapi/strapi';

import { deliverInternalNotification as deliverCore } from '../../../../services/internal-notifications/service-core';
import type { NotificationRoutingRecord } from '../../../../services/internal-notifications/service-core';
import type { InternalNotificationEnvelope } from '../../../../services/internal-notifications/types';

const NOTIFICATION_ROUTING_UID = 'api::notification-routing.notification-routing';

const NOTIFICATION_ROUTING_POPULATE = {
  adminRoles: {
    populate: {
      users: {
        fields: ['email'],
      },
    },
  },
} as const;

const services = {
  deliverInternalNotification: ({ strapi }: { strapi: Core.Strapi }) => {
    return <K extends InternalNotificationEnvelope['key']>(envelope: InternalNotificationEnvelope<K>) =>
      deliverCore({
        envelope,
        loadRoutingByKey: (key) =>
          strapi.db.query(NOTIFICATION_ROUTING_UID).findOne({
            where: { key },
            select: ['key', 'label', 'enabled', 'customEmails'],
            populate: NOTIFICATION_ROUTING_POPULATE,
          }) as Promise<NotificationRoutingRecord | null>,
        sendEmail: ({ to, subject, text }) =>
          strapi.plugin('email').service('email').send({
            to,
            subject,
            text,
          }),
        warn: (message, meta) => strapi.log.warn(message, meta),
        error: (message, meta) => strapi.log.error(message, meta),
      });
  },
};

export default services;
