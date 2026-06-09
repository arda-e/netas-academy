import type { Core } from '@strapi/strapi';
import type { EmailSender, EmailMessage } from './index';

export function createStrapiEmailSender(strapi: Core.Strapi): EmailSender {
  return {
    send(message: EmailMessage): Promise<void> {
      return strapi.plugin('email').service('email').send(message);
    },
  };
}
