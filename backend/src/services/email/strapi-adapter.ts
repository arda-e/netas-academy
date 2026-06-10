import type { Core } from '@strapi/strapi';
import type { EmailSender, EmailMessage } from './index';

export function createStrapiEmailSender(strapi: Core.Strapi): EmailSender {
  return {
    send(message: EmailMessage): Promise<void> {
      strapi.log.info('[email-sender] Sending email', {
        to: message.to,
        subject: message.subject,
      });
      return strapi.plugin('email').service('email').send(message).then(() => {
        strapi.log.info('[email-sender] Email sent successfully', {
          to: message.to,
          subject: message.subject,
        });
      });
    },
  };
}
