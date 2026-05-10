import type { Core } from '@strapi/strapi';

/**
 * Register the auto-confirmation lifecycle hook.
 *
 * Uses Strapi 5's `strapi.db.lifecycles.subscribe` to hook into
 * `api::registration.registration.afterCreate` — fires after a
 * registration has been committed to the database.
 *
 * The hook checks event.autoConfirmationEnabled and calls the
 * confirmation service fire-and-forget (catch-log, never throws).
 */
const registerLifecycleHook = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.db.lifecycles.subscribe({
    models: ['api::registration.registration'],
    afterCreate: async (event: any) => {
      const registrationId = event.result?.id;

      if (!registrationId) {
        return;
      }

      // Load the event to check autoConfirmationEnabled
      try {
        const registration = await strapi.db.query('api::registration.registration').findOne({
          where: { id: registrationId },
          populate: {
            event: {
              select: ['autoConfirmationEnabled'],
            },
          },
          select: ['id'],
        });

        const autoConfirmationEnabled = registration?.event?.autoConfirmationEnabled;

        if (!autoConfirmationEnabled) {
          return;
        }
      } catch (error) {
        strapi.log.error('[iletisim-merkezi] lifecycle hook: failed to check autoConfirmationEnabled', { error });
        return;
      }

      // Fire-and-forget: send confirmation without awaiting
      strapi
        .plugin('iletisim-merkezi')
        .service('confirmationService')
        .sendAutoConfirmation(registrationId)
        .catch((error: unknown) => {
          strapi.log.error('[iletisim-merkezi] lifecycle hook: auto-confirmation failed', { registrationId, error });
        });
    },
  });
};

export default ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.log.info('[iletisim-merkezi] plugin registered');

  registerLifecycleHook({ strapi });
};
