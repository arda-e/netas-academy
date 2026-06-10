import type { Core } from '@strapi/strapi';
import fs from 'node:fs';
import path from 'node:path';

const ensureDefaultTemplate = async (strapi: Core.Strapi) => {
  const uid = 'plugin::iletisim-merkezi.confirmation-template';

  const existing = await strapi.db.query(uid).findOne({ select: ['id'] });

  if (existing?.id) {
    return;
  }

  const htmlBody = fs.readFileSync(
    path.resolve(__dirname, '..', '..', '..', '..', '..', 'emails', '01_registration_confirmation.html'),
    'utf-8'
  );

  await strapi.db.query(uid).create({
    data: {
      htmlBody,
      enabled: true,
    },
  });

  strapi.log.info('[iletisim-merkezi] default confirmation template seeded');
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  await ensureDefaultTemplate(strapi);
};
