import templateService from './template-service';
import confirmationService from './confirmation-service';
import manualEmailService from './manual-email-service';
import { createStrapiEmailSender } from '../../../../services/email/strapi-adapter';

export default {
  templateService,
  confirmationService: ({ strapi }) =>
    confirmationService({ strapi, emailSender: createStrapiEmailSender(strapi) }),
  manualEmailService: ({ strapi }) =>
    manualEmailService({ strapi, emailSender: createStrapiEmailSender(strapi) }),
};
