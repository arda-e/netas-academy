import type { Core } from '@strapi/strapi';

const TEMPLATE_UID = 'plugin::iletisim-merkezi.confirmation-template';

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

const templateService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async get() {
    const entry = await strapi.db.query(TEMPLATE_UID).findOne({ select: ['id', 'htmlBody', 'enabled'] });
    return entry ?? null;
  },

  async update(htmlBody: string, enabled?: boolean) {
    const existing = await strapi.db.query(TEMPLATE_UID).findOne({ select: ['id'] });

    if (existing?.id) {
      return strapi.db.query(TEMPLATE_UID).update({
        where: { id: existing.id },
        data: { htmlBody, enabled: enabled ?? true },
      });
    }

    return strapi.db.query(TEMPLATE_UID).create({
      data: { htmlBody, enabled: enabled ?? true },
    });
  },

  async reset() {
    const existing = await strapi.db.query(TEMPLATE_UID).findOne({ select: ['id'] });

    if (existing?.id) {
      return strapi.db.query(TEMPLATE_UID).update({
        where: { id: existing.id },
        data: { htmlBody: DEFAULT_TEMPLATE, enabled: true },
      });
    }

    return strapi.db.query(TEMPLATE_UID).create({
      data: { htmlBody: DEFAULT_TEMPLATE, enabled: true },
    });
  },
});

export default templateService;
