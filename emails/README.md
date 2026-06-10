# Learning Academy Türkçe HTML E-posta Şablonları

Bu klasör, Strapi üzerinden Brevo ile gönderilebilecek dört adet Outlook uyumlu ve responsive HTML e-posta şablonu içerir.

## Dosyalar

1. `01_registration_confirmation.html` — webinar veya kurs kaydı sonrası gönderilecek kayıt onayı.
2. `02_contact_inquiry_received.html` — iletişim formu gönderildikten sonra gönderilecek talep alındı bildirimi.
3. `03_course_or_webinar_update.html` — bir yönetici tarafından webinar veya kurs katılımcılarına gönderilecek program güncellemesi.
4. `04_catalog_announcement_marketing.html` — yeni kurs, katalog yeniliği veya akademi haberleri için pazarlama duyurusu.

## Logo bölümü

Tüm şablonların üst kısmına logo alanı eklendi.

- Modern istemciler için varsayılan logo kaynağı: `logo.svg`
- Outlook Windows / MSO için fallback değişkeni: `{{params.logoPngUrl}}`

Önemli: Outlook Windows sürümleri SVG görselleri güvenilir şekilde göstermeyebilir. Bu nedenle üretimde `params.logoPngUrl` için mutlak URL ile erişilebilen PNG veya JPG fallback logo kullanmanız önerilir. Örnek:

```json
"logoPngUrl": "https://academy.example.com/assets/logo.png"
```

E-posta istemcileri yerel dosya yollarını genellikle yükleyemediği için `logo.svg` dosyasını da üretimde CDN veya Strapi media URL üzerinden sunmanız gerekir. İsterseniz HTML içinde `src="logo.svg"` değerini `src="{{params.logoSvgUrl}}"` olarak değiştirebilirsiniz.

## Brevo / Strapi kullanımı

Şablonlar Brevo `params` değişkenleriyle hazırlanmıştır. Strapi tarafında Brevo Transactional Email API çağrısında `params` nesnesine aşağıdaki alanları gönderebilirsiniz.

Ortak alanlar:

- `params.academyName`
- `params.academyUrl`
- `params.logoPngUrl`
- `params.firstName`
- `params.preheader`
- `params.supportEmail`

Pazarlama şablonunda Brevo standart değişkenleri de bulunur:

- `{{mirror}}`
- `{{unsubscribe}}`
- `{{update_profile}}`

## Önerilen konu satırları

- Kayıt onayı: `Kaydınız alındı: {{params.programTitle}}`
- İletişim talebi: `Talebinizi aldık — {{params.ticketId}}`
- Program güncellemesi: `Güncelleme: {{params.programTitle}}`
- Katalog duyurusu: `{{params.academyName}} kataloğunda yeni: {{params.courseTitle}}`

## 01_registration_confirmation.html parametreleri

- `params.academyName`
- `params.academyUrl`
- `params.logoPngUrl`
- `params.firstName`
- `params.preheader`
- `params.programTitle`
- `params.programType`
- `params.programDate`
- `params.programTime`
- `params.timezone`
- `params.deliveryMode`
- `params.duration`
- `params.registrationId`
- `params.joinUrl`
- `params.calendarUrl`
- `params.preparationNote`
- `params.supportEmail`

## 02_contact_inquiry_received.html parametreleri

- `params.academyName`
- `params.academyUrl`
- `params.logoPngUrl`
- `params.firstName`
- `params.preheader`
- `params.responseWindow`
- `params.inquiryTopic`
- `params.submittedAt`
- `params.ticketId`
- `params.supportEmail`

## 03_course_or_webinar_update.html parametreleri

- `params.academyName`
- `params.academyUrl`
- `params.logoPngUrl`
- `params.firstName`
- `params.preheader`
- `params.programTitle`
- `params.updateTitle`
- `params.updateSummary`
- `params.programDateTime`
- `params.deadline`
- `params.actionRequired`
- `params.updateDetails`
- `params.resourceUrl`
- `params.sentByName`
- `params.sentByTitle`
- `params.supportEmail`

## 04_catalog_announcement_marketing.html parametreleri

- `params.academyName`
- `params.academyUrl`
- `params.logoPngUrl`
- `params.firstName`
- `params.preheader`
- `params.announcementLabel`
- `params.headline`
- `params.introText`
- `params.courseTitle`
- `params.courseDescription`
- `params.startDate`
- `params.level`
- `params.format`
- `params.benefitOne`
- `params.benefitTwo`
- `params.benefitThree`
- `params.ctaText`
- `params.ctaUrl`
- `params.catalogUrl`
- Brevo standart değişkenleri: `{{mirror}}`, `{{unsubscribe}}`, `{{update_profile}}`

## Örnek Brevo payload

```json
{
  "to": [{ "email": "learner@example.com", "name": "Ayşe Yılmaz" }],
  "subject": "Kaydınız alındı: Veri Stratejisi Temelleri",
  "params": {
    "academyName": "Learning Academy",
    "academyUrl": "https://academy.example.com",
    "logoPngUrl": "https://academy.example.com/assets/logo.png",
    "firstName": "Ayşe",
    "preheader": "Kontenjanınız onaylandı. Tarih, saat ve katılım bilgilerini görüntüleyin.",
    "programTitle": "Veri Stratejisi Temelleri",
    "programType": "webinar",
    "programDate": "12 Haziran 2026",
    "programTime": "14:00",
    "timezone": "TRT",
    "deliveryMode": "Canlı çevrim içi",
    "duration": "90 dakika",
    "registrationId": "REG-10491",
    "joinUrl": "https://academy.example.com/join/REG-10491",
    "calendarUrl": "https://academy.example.com/calendar/REG-10491.ics",
    "preparationNote": "Oturumdan önce bağlantınızı test edin ve varsa ön okuma materyallerini inceleyin.",
    "supportEmail": "support@example.com"
  }
}
```

## Outlook uyumluluğu notları

- Layout, Outlook masaüstü istemcileri için tablo tabanlıdır.
- Butonlar Outlook için VML fallback içerir.
- `PixelsPerInch` ayarı 96 DPI için eklenmiştir.
- Mobilde genişlik ve hizalama için medya sorguları kullanılmıştır.
- Pazarlama gönderilerinde izin bazlı liste kullanın ve abonelikten çıkma / tercih güncelleme bağlantılarını koruyun.
