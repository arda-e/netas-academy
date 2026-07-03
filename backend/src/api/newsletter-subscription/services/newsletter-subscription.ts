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

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const buildConfirmationEmail = (email: string) => {
  const subject = 'Netas Academy E-bulten aboneliginiz alindi';
  const text = [
    'Merhaba,',
    '',
    'Aboneliginiz basariyla alindi. Netas Academy etkinlikleri, egitimleri ve duyurulari hakkinda sizi bilgilendirecegiz.',
    '',
    `Abone e-posta adresi: ${email}`,
    '',
    'Tesekkur ederiz,',
    'Netas Academy',
  ].join('\n');
  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6">',
    '<p>Merhaba,</p>',
    '<p>Aboneliginiz basariyla alindi. Netas Academy etkinlikleri, egitimleri ve duyurulari hakkinda sizi bilgilendirecegiz.</p>',
    `<p><strong>Abone e-posta adresi:</strong> ${escapeHtml(email)}</p>`,
    '<p>Tesekkur ederiz,<br />Netas Academy</p>',
    '</div>',
  ].join('');

  return { subject, text, html };
};

const sendConfirmationEmail = async (email: string) => {
  try {
    await strapi.plugin('email').service('email').send({
      to: email,
      ...buildConfirmationEmail(email),
    });
  } catch (error) {
    strapi.log.error('Newsletter confirmation email delivery failed', { error });
  }
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
              sourcePage: input.sourcePage || null,
              sourceContentType: input.sourceContentType || null,
              sourceContentSlug: input.sourceContentSlug || null,
            },
          });

        await sendConfirmationEmail(email);

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

      await sendConfirmationEmail(email);

      return {
        success: true,
        message: 'Aboneliginiz basariyla olusturuldu.',
        alreadySubscribed: false,
      };
    },
  })
);
