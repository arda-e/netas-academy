import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeInput = {
  email: string;
  consentAccepted: boolean;
  consentTextSnapshot?: string;
  sourcePage?: string;
  sourceContentType?: string;
  sourceContentSlug?: string;
};

export default factories.createCoreService(
  'api::newsletter-subscription.newsletter-subscription' as any,
  () => ({
    async subscribe(input: SubscribeInput) {
      const email = input.email.trim().toLowerCase();

      if (!email) {
        throw new ValidationError('email is required');
      }

      if (!EMAIL_REGEX.test(email)) {
        throw new ValidationError('email must be a valid email address');
      }

      if (!input.consentAccepted) {
        throw new ValidationError('consentAccepted must be true');
      }

      const now = new Date().toISOString();

      // Check for existing subscription by email
      const existing = await strapi.db
        .query('api::newsletter-subscription.newsletter-subscription')
        .findOne({
          where: { email },
          select: ['id', 'documentId', 'status'],
        });

      if (existing) {
        if (existing.status === 'active') {
          // Refresh lastSeenAt and source fields for active duplicates
          await strapi.db
            .query('api::newsletter-subscription.newsletter-subscription')
            .update({
              where: { id: existing.id },
              data: {
                lastSeenAt: now,
                sourcePage: input.sourcePage || null,
                sourceContentType: input.sourceContentType || null,
                sourceContentSlug: input.sourceContentSlug || null,
              },
            });

          return {
            success: true,
            message: 'Bu e-posta adresi zaten kayitli.',
            alreadySubscribed: true,
          };
        }

        // Reactivate passive/unsubscribed
        await strapi.db
          .query('api::newsletter-subscription.newsletter-subscription')
          .update({
            where: { id: existing.id },
            data: {
              status: 'active',
              lastSeenAt: now,
              subscribedAt: now,
              sourcePage: input.sourcePage || null,
              sourceContentType: input.sourceContentType || null,
              sourceContentSlug: input.sourceContentSlug || null,
            },
          });

        return {
          success: true,
          message: 'Aboneliginiz basariyla yeniden aktiflestirildi.',
          alreadySubscribed: false,
        };
      }

      // Create new subscription
      await strapi.db
        .query('api::newsletter-subscription.newsletter-subscription')
        .create({
          data: {
            email,
            consentAccepted: input.consentAccepted,
            consentTextSnapshot: input.consentTextSnapshot || null,
            status: 'active',
            sourcePage: input.sourcePage || null,
            sourceContentType: input.sourceContentType || null,
            sourceContentSlug: input.sourceContentSlug || null,
            subscribedAt: now,
            lastSeenAt: now,
          },
        });

      return {
        success: true,
        message: 'Aboneliginiz basariyla olusturuldu.',
        alreadySubscribed: false,
      };
    },
  })
);
