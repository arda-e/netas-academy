import type { Core } from '@strapi/strapi';

import { deliverInternalNotification as deliverCore } from '../../../../services/internal-notifications/service-core';
import type { NotificationRoutingRecord } from '../../../../services/internal-notifications/service-core';
import type { InternalNotificationEnvelope } from '../../../../services/internal-notifications/types';

const NOTIFICATION_ROUTING_UID = 'api::notification-routing.notification-routing';

const services = {
  deliverInternalNotification: ({ strapi }: { strapi: Core.Strapi }) => ({
    deliver: <K extends InternalNotificationEnvelope['key']>(envelope: InternalNotificationEnvelope<K>) =>
      deliverCore({
        envelope,
        loadRoutingByKey: async (key) => {
          console.log(`[internal-notifications] querying routing for key=${key}`);
          const result = await strapi.db.query(NOTIFICATION_ROUTING_UID).findOne({
            where: { key },
            select: ['key', 'label', 'enabled', 'customEmails'],
          }) as NotificationRoutingRecord | null;
          console.log(`[internal-notifications] db result:`, result);
          return result;
        },
        sendEmail: async ({ to, subject, text }) => {
          const toStr = to.join(', ');
          console.log(`[internal-notifications] calling strapi email send to="${toStr}" subject="${subject}"`);
          try {
            await strapi.plugin('email').service('email').send({ to: toStr, subject, text });
            console.log(`[internal-notifications] strapi email send returned OK`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[internal-notifications] strapi email send threw: ${msg}`);
            throw err;
          }
        },
        warn: (message, meta) => strapi.log.warn(message, meta),
        error: (message, meta) => strapi.log.error(message, meta),
      }),
  }),
};

export default services;
