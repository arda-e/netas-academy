import type { Core } from '@strapi/strapi';

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a56db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; }
    .footer { padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; }
    .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .details dt { font-weight: bold; margin-top: 10px; }
    .details dd { margin-left: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Kaydınız Onaylandı</h1>
    </div>
    <div class="content">
      <p>Merhaba,</p>
      <p><strong>{{ event.title }}</strong> etkinliğine kaydınız başarıyla alınmıştır.</p>

      <dl class="details">
        <dt>Etkinlik</dt>
        <dd>{{ event.title }}</dd>
        <dt>Tarih</dt>
        <dd>{{ event.startsAt }}</dd>
        <dt>Yer</dt>
        <dd>{{ event.location }}</dd>
      </dl>

      <p>Etkinlik detayları ve güncellemeler için lütfen web sitemizi ziyaret edin.</p>
      <p>İyi günler dileriz.</p>
    </div>
    <div class="footer">
      <p>Netas Academy</p>
    </div>
  </div>
</body>
</html>`;

const ensureDefaultTemplate = async (strapi: Core.Strapi) => {
  const uid = 'plugin::iletisim-merkezi.confirmation-template';

  const existing = await strapi.db.query(uid).findOne({ select: ['id'] });

  if (existing?.id) {
    return;
  }

  await strapi.db.query(uid).create({
    data: {
      htmlBody: DEFAULT_TEMPLATE,
      enabled: true,
    },
  });

  strapi.log.info('[iletisim-merkezi] default confirmation template seeded');
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  await ensureDefaultTemplate(strapi);
};
