# i18n Translation Surface Map

**Status:** Reference — living document
**Locales:** `tr` (default, no prefix) · `en` (`/en/` prefix)
**Library:** `next-intl` (App Router)
**Source of truth for keys:** `frontend/src/messages/tr.json`

---

## How to use this document

This document maps every user-visible Turkish string in the frontend, organized **top-down by page and section** rather than by file location. Each entry lists:

- the proposed `next-intl` key (dot-notation, namespace-first)
- the current Turkish value (what to look for in source)
- the source file

Use the key column to build `messages/tr.json` and `messages/en.json`. Use the file column to find where each string lives and replace it with `t("key")`.

**Namespace convention:** `<page>.<section>.<element>` — e.g. `home.hero.title`, `courses.filters.topic.siber_guvenlik`.

---

## 1. Global Shell

Always rendered. Lives in the root layout and shared layout components.

### 1.1 Site Metadata — `app/layout.tsx`

| Key | Turkish value |
|-----|--------------|
| `site.meta.title` | `Netas Academy` |
| `site.meta.description` | `Course, event, teacher, and editorial portal for Netas Academy.` |

### 1.2 Navigation Labels — `config/navigation.ts`

These labels drive both the desktop/mobile header nav and the footer site plan. Changing a label here changes all occurrences.

| Key | Turkish value |
|-----|--------------|
| `nav.home` | `Ana Sayfa` |
| `nav.about` | `Hakkımızda` |
| `nav.events` | `Etkinlikler` |
| `nav.courses` | `Eğitim Kataloğu` |
| `nav.teachers` | `Eğitmenler` |
| `nav.solution_partner` | `Çözüm Ortağı` |
| `nav.blog` | `Blog` |
| `nav.news` | `Haberler` |
| `nav.contact` | `İletişim` |

### 1.3 Site Header — `components/site-header.tsx`

| Key | Turkish value |
|-----|--------------|
| `header.logo.aria_label` | `Netas Academy ana sayfası` |
| `header.mobile_menu.toggle_label_open` | `Menüyü aç` |
| `header.mobile_menu.toggle_label_close` | `Menüyü kapat` |
| `header.mobile_menu.button_text` | `Menü` |

### 1.4 Site Footer — `components/site-footer.tsx`

| Key | Turkish value |
|-----|--------------|
| `footer.brand.name` | `Netas Academy` |
| `footer.brand.tagline` | `Eğitim, etkinlik ve kurumsal gelişim içerikleri.` |
| `footer.site_plan.heading` | `Site Planı` |
| `footer.site_plan.aria_label` | `Site planı` |
| `footer.legal.aria_label` | `Yasal ve kurumsal bağlantılar` |
| `footer.legal.kvkk` | `KVKK` |
| `footer.legal.netas_website` | `Netaş Web Sitesi` |

---

## 2. Pages

### 2.1 Home (`/`) — `app/page.tsx`

#### Meta

| Key | Turkish value |
|-----|--------------|
| `home.meta.title` | `Netas Academy \| Kurumsal Eğitim ve Hakkımızda` |
| `home.meta.description` | `Netaş Akademi'nin ana sayfası ve hakkımızda anlatısı tek bir akışta; kurumsal eğitim yaklaşımımızı, uygulamalı öğrenme modelimizi ve öne çıkan programlarımızı keşfedin.` |

#### Hero section

Rendered via `components/hero-overlay.tsx`. The title is passed as JSX with `<br>` breaks — use a single string key; the line breaks are visual only.

| Key | Turkish value |
|-----|--------------|
| `home.hero.title` | `Kurumsal dönüşümü saha tecrübesiyle hızlandırın.` |
| `home.hero.description` | `Netaş Akademi, teknoloji birikimi ve saha deneyimini kurumsal öğrenmeye dönüştürerek ekiplerin değişime daha hızlı uyum sağlamasına yardımcı olur.` |
| `home.hero.cta_primary` | `Daha Fazla Keşfet` |

#### About section (`#hakkimizda`)

| Key | Turkish value |
|-----|--------------|
| `home.about.eyebrow` | `Hakkımızda` |
| `home.about.heading` | `Kurumsal dönüşümü öğrenme deneyimine çeviren tek sayfalık bir anlatı sunar.` |
| `home.about.body` | `Netaş'ın teknoloji ve sektör tecrübesiyle şekillenen programlar, kurumların kendi ihtiyaçlarına göre yeniden kurgulanır. Amacımız, ekiplerinize yalnızca bilgi vermek değil, değişime daha hızlı uyum sağlayan bir çalışma kültürü kazandırmaktır.` |
| `home.about.cta_corporate` | `Kurumsal Eğitim Talep Et` |
| `home.about.cta_catalog` | `Eğitim Kataloğunu İncele` |
| `home.about.card_proven.title` | `Sahada Kanıtlanmış` |
| `home.about.card_proven.body` | `Yılların sektör deneyimiyle oluşturulmuş, teoriden pratiğe uzanan eğitim içerikleri.` |
| `home.about.card_custom.title` | `Kuruma Özel` |
| `home.about.card_custom.body` | `Her kurumun ihtiyacına göre şekillenen esnek program yapısı ve özelleştirilebilir içerikler.` |
| `home.about.card_transform.title` | `Dönüşüm Odaklı` |
| `home.about.card_transform.body` | `Bireysel öğrenmenin ötesinde, takım dinamiklerini güçlendiren ve iş birliğini artıran programlar.` |
| `home.about.card_netas.title` | `Netaş Güvencesi` |
| `home.about.card_netas.body` | `Kurumsal eğitim programları, teknoloji ve sektör birikiminin sahada karşılık bulan bir öğrenme modeline dönüşür.` |
| `home.about.card_applied.title` | `Uygulamalı Model` |
| `home.about.card_applied.heading` | `Gerçek iş problemleri üzerinden ilerleyen öğrenme tasarımı` |
| `home.about.card_applied.body` | `Vaka, senaryo ve etkileşimli çalışma biçimleriyle teori ve pratiği aynı akışta buluşturuyoruz. Katılımcıların öğrendiklerini kendi iş bağlamlarına taşımasını hedefliyoruz.` |
| `home.about.card_impact.title` | `Eğitim Etkisi` |
| `home.about.card_impact.body` | `Program sonunda daha hızlı adaptasyon, daha güçlü takım çalışması ve ölçülebilir öğrenme çıktıları hedeflenir.` |
| `home.about.card_flexible.title` | `Esnek Yapı` |
| `home.about.card_flexible.body` | `Açık sınıf, kapalı devre, hibrit ve uzaktan formatlar aynı kurumsal hedef için yeniden kurgulanabilir.` |

#### Teachers section

| Key | Turkish value |
|-----|--------------|
| `home.teachers.eyebrow` | `Eğitmen Kadrosu` |
| `home.teachers.heading` | `Saha deneyimi güçlü eğitmenlerimiz` |
| `home.teachers.body` | `Eğitmenlerimiz yalnızca anlatıcı değil, sahada dönüşüm projelerinde yer almış uzmanlardır. Katılımcılara örnekler, yöntemler ve uygulanabilir çerçeveler sunarak kuram ile pratik arasındaki köprüyü birlikte kurar.` |

#### Featured Courses section

| Key | Turkish value |
|-----|--------------|
| `home.courses.eyebrow` | `Öne Çıkan Eğitimler` |
| `home.courses.heading` | `Programlarımızı tek bir akışta keşfedin` |
| `home.courses.body` | `En güncel eğitim programlarımızı inceleyin. Her program, kurumların dönüşüm ihtiyaçlarına yanıt verecek şekilde yapılandırılır.` |

#### Contact CTA section

| Key | Turkish value |
|-----|--------------|
| `home.contact_cta.eyebrow` | `İletişim` |
| `home.contact_cta.heading` | `Kurumsal eğitim ihtiyacınızı birlikte şekillendirelim` |
| `home.contact_cta.body` | `Eğitim kapsamını, ekip yapınızı ve hedeflediğiniz çıktıları paylaşın. İhtiyacınıza uygun bir kurumsal program kurgulayalım.` |
| `home.contact_cta.button` | `Kurumsal Eğitim Talebi` |

---

### 2.2 Courses Listing (`/egitimler`) — `app/egitimler/page.tsx`

#### Meta (generated from `generateMetadata`)

The page currently uses the course title as metadata title; the fallback is a static string.

| Key | Turkish value |
|-----|--------------|
| `courses.meta.not_found` | `Egitim Bulunamadi` *(used in course detail's `generateMetadata` fallback)* |

#### Hero

| Key | Turkish value |
|-----|--------------|
| `courses.hero.title` | `Eğitim Kataloğu` |
| `courses.hero.description_strong` | `Uzman eğitmenlerin hazırladığı programları` |
| `courses.hero.description_rest` | `inceleyin, kurumunuza en uygun öğrenme yolunu seçin.` |
| `courses.hero.chip_corporate` | `Kurumsal programlar` |
| `courses.hero.chip_live` | `Canlı oturumlar` |
| `courses.hero.chip_applied` | `Uygulamalı öğrenme` |
| `courses.hero.pdf_label` | `Katalog PDF indir` |
| `courses.hero.pdf_status` | `Yakında aktif` |

#### Filters

Topic area filter chips come from `lib/content-taxonomy.ts`.

| Key | Turkish value |
|-----|--------------|
| `taxonomy.topic.siber_guvenlik` | `Siber Güvenlik` |
| `taxonomy.topic.yazilim_gelistirme` | `Yazılım` |
| `taxonomy.topic.veri_bilimi` | `Veri Analitiği` |
| `taxonomy.topic.bulut_altyapi` | `Bulut` |
| `taxonomy.topic.is_surecleri` | `Süreçler` |
| `taxonomy.topic.yapay_zeka` | `Yapay Zeka` |

Course level labels (used in cards and detail pages):

| Key | Turkish value |
|-----|--------------|
| `taxonomy.level.temel` | `Temel` |
| `taxonomy.level.orta` | `Orta` |
| `taxonomy.level.ileri` | `İleri` |

#### Empty state

| Key | Turkish value |
|-----|--------------|
| `courses.list.empty` | `Bu kriterlere uygun eğitim bulunamadı.` |
| `courses.list.empty_default` | `Gösterilecek eğitim verisi şu an kullanılabilir değil.` |

---

### 2.3 Course Detail (`/egitimler/[slug]`) — `app/egitimler/[slug]/page.tsx`

#### Breadcrumb

| Key | Turkish value |
|-----|--------------|
| `courses.detail.breadcrumb` | `Eğitim Kataloğu` |

#### Corporate request CTA (in hero trailing area)

| Key | Turkish value |
|-----|--------------|
| `courses.detail.corporate_cta_label` | `Bu Eğitimi Kurumsal Olarak Talep Et` |
| `courses.detail.corporate_cta_sub` | `Talep formuna git` |

#### Content sections

| Key | Turkish value |
|-----|--------------|
| `courses.detail.section.description` | `Eğitim Açıklaması` |
| `courses.detail.section.description_empty` | `Bu eğitim için detaylı içerik yakında eklenecek.` |
| `courses.detail.section.business_value` | `Kurumsal Değer` |
| `courses.detail.section.business_value_empty` | `Bu eğitimin kurumsal değer bilgisi yakında eklenecek.` |
| `courses.detail.section.outcomes` | `Beklenen Çıktılar` |
| `courses.detail.section.scope` | `Kapsam ve İçerik` |
| `courses.detail.section.related_events` | `İlişkili Etkinlikler` |

---

### 2.4 Events Listing (`/etkinlikler`) — `app/etkinlikler/page.tsx`

#### Hero

| Key | Turkish value |
|-----|--------------|
| `events.hero.title` | `Etkinlikler` |
| `events.hero.description_strong` | `Yaklaşan buluşmaları, webinarları ve özel oturumları` |
| `events.hero.description_rest` | `takip edin; katılım için gerekli detaylara tek ekrandan ulaşın.` |

#### Filters and sort controls

| Key | Turkish value |
|-----|--------------|
| `events.filters.type.etkinlik` | `Etkinlik` |
| `events.filters.type.egitim` | `Eğitim` |
| `events.filters.type.kurs` | `Kurs` |
| `events.sort.label_asc` | `Önce yeni` |
| `events.sort.label_desc` | `Önce eski` |
| `events.sort.aria_label_asc` | `Sırala: önce yeni` |
| `events.sort.aria_label_desc` | `Sırala: önce eski` |
| `events.sort.prefix` | `Sırala:` |

#### Card defaults (from `components/content/events.tsx`)

| Key | Turkish value |
|-----|--------------|
| `events.card.summary_empty` | `Bu etkinlik icin aciklama yakinda eklenecek.` |
| `events.list.empty` | `Gosterilecek etkinlik verisi su an kullanilabilir degil.` |

---

### 2.5 Event Detail (`/etkinlikler/[slug]`) — `app/etkinlikler/[slug]/page.tsx`

This page renders via `EventDetail` (from `components/content/events.tsx`) which wraps `ContentDetailShell`. The title, summary, and date/location come from Strapi (translatable CMS content in Phase 2). No additional static UI strings are in the detail shell itself beyond what's covered in §3.4.

---

### 2.6 Event Registration (`/etkinlikler/[slug]/kayit`) — `app/etkinlikler/[slug]/kayit/page.tsx`

The form is rendered by `EventRegistrationForm` — covered in §4.2.

---

### 2.7 Teachers Listing (`/egitmenler`) — `app/egitmenler/page.tsx`

#### Hero

| Key | Turkish value |
|-----|--------------|
| `teachers.hero.title` | `Eğitmenlerimiz` |
| `teachers.hero.description_strong` | `Alanında uzman eğitmen kadromuzla` |
| `teachers.hero.description_rest` | `tanışın. Her biri saha deneyimini sınıfa taşıyan, sektörün önde gelen profesyonellerinden oluşan ekibimizle öğrenme yolculuğunuza yön verin.` |

#### Empty state

| Key | Turkish value |
|-----|--------------|
| `teachers.list.empty` | `Henüz eğitmen profili eklenmemiş.` |

---

### 2.8 Teacher Detail (`/egitmenler/[slug]`) — `app/egitmenler/[slug]/page.tsx`

Teacher name and bio come from Strapi (Phase 2 content translation). The breadcrumb label pointing back to the listing uses the teacher's name (dynamic). No additional static strings beyond shared components.

---

### 2.9 Blog Listing (`/blog-yazilari`) — `app/blog-yazilari/page.tsx`

#### Hero

| Key | Turkish value |
|-----|--------------|
| `blog.hero.title` | `Blog` |
| `blog.hero.description` | `Sektörel bakış açıları, uygulama notları ve eğitim odaklı içgörülerle hazırlanan yazı arşivini keşfedin.` |

#### Empty state

| Key | Turkish value |
|-----|--------------|
| `blog.list.empty` | `Aramanızla eşleşen blog yazısı bulunamadı.` |

---

### 2.10 Blog Post Detail (`/blog-yazilari/[slug]`) — `app/blog-yazilari/[slug]/page.tsx`

Body content comes from Strapi (Phase 2). Related posts section heading is in `components/content/blog-related-posts.tsx` (covered in §3.6).

---

### 2.11 News (`/haberler`) — `app/haberler/page.tsx`

| Key | Turkish value |
|-----|--------------|
| `news.hero.title` | `Haberler` |
| `news.hero.description` | `Akademi gündemini, yeni duyuruları ve öne çıkan gelişmeleri takip edebileceğiniz kurumsal haber alanı.` |

> **Note:** `haberler` is deferred scope per the i18n requirements. Include its hero strings for completeness but mark them low-priority. The `NewsList` is currently rendered with an empty array (no Strapi content type yet).

---

### 2.12 Contact (`/iletisim`) — `app/iletisim/page.tsx`

#### Hero

| Key | Turkish value |
|-----|--------------|
| `contact.hero.title` | `İletişim` |
| `contact.hero.breadcrumb` | `İletişim` |
| `contact.hero.description` | `Eğitim kataloğu, etkinlikler ve kurumsal iş birlikleri hakkında bize yazın.` |

The form is rendered by `IntentLeadForm` — covered in §4.1.

---

### 2.13 Solution Partner (`/cozum-ortagi`) — `app/cozum-ortagi/page.tsx`

#### Meta

| Key | Turkish value |
|-----|--------------|
| `solution_partner.meta.title` | `Çözüm Ortağı \| Netaş Academy` |
| `solution_partner.meta.description` | `Netaş Academy ile eğitim, danışmanlık, workshop ve sektörel uzmanlık alanlarında çözüm ortaklığı yapmak için başvurun.` |

#### Hero

| Key | Turkish value |
|-----|--------------|
| `solution_partner.hero.title` | `Çözüm Ortaklığı` |
| `solution_partner.hero.breadcrumb` | `Çözüm Ortaklığı` |

#### Accordion — collaboration areas

The accordion items are defined as a static array in the page file (`collaborationAreas`). Each item has a `title` and `body`.

| Key | Turkish value |
|-----|--------------|
| `solution_partner.accordion.heading` | `Hangi Alanlarda Çözüm Ortaklığı Yapabiliriz` |
| `solution_partner.accordion.training.title` | `Eğitim Programları` |
| `solution_partner.accordion.training.body` | `Kurumların ihtiyaçlarına göre şekillendirilen açık ve kapalı devre eğitim programlarının tasarımı ve uygulanması süreçlerinde iş birliği yapabiliriz.` |
| `solution_partner.accordion.consulting.title` | `Danışmanlık Hizmetleri` |
| `solution_partner.accordion.consulting.body` | `Kurumsal gelişim, organizasyonel dönüşüm ve insan kaynakları stratejileri alanlarında danışmanlık hizmetlerini birlikte yürütebiliriz.` |
| `solution_partner.accordion.workshop.title` | `Workshop ve Fasilitasyon` |
| `solution_partner.accordion.workshop.body` | `Takım çalıştayları, strateji atölyeleri ve yaratıcı problem çözme oturumlarının fasilitasyonu konusunda ortak çalışmalar gerçekleştirebiliriz.` |
| `solution_partner.accordion.expertise.title` | `Sektörel / Konu Bazlı Uzmanlık` |
| `solution_partner.accordion.expertise.body` | `Belirli bir sektör veya konu alanındaki derin uzmanlığınızı Netaş Academy çatısı altında eğitim ve içerik programlarına dönüştürebiliriz.` |

#### CTA section

| Key | Turkish value |
|-----|--------------|
| `solution_partner.cta.heading` | `Başvurunuzu İnceleyelim` |
| `solution_partner.cta.body` | `Eğitim, danışmanlık, workshop veya sektörel uzmanlık alanlarında Netaş Academy ile olası iş birliği fikrinizi bizimle paylaşabilirsiniz.` |
| `solution_partner.cta.button` | `Çözüm Ortağı Başvurusu` |

---

### 2.14 KVKK (`/kvkk`) — `app/kvkk/page.tsx`

This page is a legal disclosure document. Its body text is long-form legal prose in Turkish. **Translating legal copy requires legal review**, not just string extraction. Flag this page as needing a separate translation review process rather than automated key extraction.

Static UI strings that are safe to extract:

| Key | Turkish value |
|-----|--------------|
| `kvkk.back_button` | `Geri Dön` |

---

## 3. Shared UI Components

These components are reused across multiple pages. Their strings are extracted once and referenced from whichever page renders them.

### 3.1 Hero Overlay — `components/hero-overlay.tsx`

The hero title, description, and CTA labels are **passed as props** from each page (covered in the per-page sections above). The only static strings inside this component itself are navigation aria-labels for the background image carousel controls.

| Key | Turkish value |
|-----|--------------|
| `common.carousel.prev` | `Önceki içerik` |
| `common.carousel.next` | `Sonraki içerik` |

### 3.2 Breadcrumbs — `components/breadcrumbs.tsx`

| Key | Turkish value |
|-----|--------------|
| `common.breadcrumbs.aria_label` | `Sayfa yolu` |

### 3.3 Search Field — `components/content/search-field.tsx`

| Key | Turkish value |
|-----|--------------|
| `common.search.aria_label` | `Ara` |
| `common.search.placeholder` | `Ara...` |

### 3.4 Content Detail Shell — `components/content/content-detail-shell.tsx`

The title and summary are passed as props from each page. No static strings live in this component.

### 3.5 Teacher Carousel — `components/teacher-carousel.tsx`

| Key | Turkish value |
|-----|--------------|
| `common.teacher_carousel.prev` | `Onceki egitmenler` |
| `common.teacher_carousel.next` | `Sonraki egitmenler` |

### 3.6 Course Carousel — `components/course-carousel.tsx`

| Key | Turkish value |
|-----|--------------|
| `common.course_carousel.prev` | `Onceki egitimler` |
| `common.course_carousel.next` | `Sonraki egitimler` |

### 3.7 Blog Related Posts — `components/content/blog-related-posts.tsx`

| Key | Turkish value |
|-----|--------------|
| `blog.related_posts.heading` | `İlgili Yazılar` |
| `blog.related_posts.summary_empty` | `Bu yazı için özet yakında eklenecek.` |

---

## 4. Forms

Forms are client components that contain the densest concentration of translatable strings: labels, placeholders, validation messages, submission states, and success/error feedback.

### 4.1 Contact / Lead Form — `components/contact/intent-lead-form.tsx` + `lib/lead-intents.ts`

#### Tab labels and intent metadata (`lib/lead-intents.ts` — `LEAD_INTENTS` object)

| Key | Turkish value |
|-----|--------------|
| `contact.tab.corporate` | `Kurumsal Eğitim Talebi` |
| `contact.tab.instructor` | `Eğitmen Başvurusu` |
| `contact.tab.partner` | `Çözüm Ortağı Başvurusu` |
| `contact.tab.general` | `Genel İletişim` |
| `contact.success.corporate` | `Kurumsal eğitim talebiniz alınmıştır. Eğitim kataloğumuza göz atabilir veya ekibinizle iletişime geçeceğiz.` |
| `contact.success.corporate_cta` | `Eğitim Kataloğunu İncele` |
| `contact.success.instructor` | `Eğitmen başvurunuz alınmıştır. Uzmanlık alanınıza uygun fırsatlar için sizinle iletişime geçeceğiz.` |
| `contact.success.partner` | `Çözüm ortaklığı başvurunuz alınmıştır. İş geliştirme ekibimiz sizinle iletişime geçecektir.` |
| `contact.success.general` | `Mesajınız alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.` |

#### Common form fields (`components/contact/intent-lead-form.tsx`)

| Key | Turkish value |
|-----|--------------|
| `contact.field.full_name.label` | `Ad Soyad*` |
| `contact.field.email.label` | `E-Posta*` |
| `contact.field.phone.label` | `Telefon*` |
| `contact.field.company.label` | `Şirket` |
| `contact.field.message.label` | `Mesajınız*` |
| `contact.kvkk.text` | `Kişisel verileriniz sizinle iletişime geçmek amacıyla alınmaktadır.` |
| `contact.kvkk.link` | `Aydınlatma Metni` |
| `contact.kvkk.suffix` | `'ni okudum, onaylıyorum.*` |
| `contact.submit.idle` | `Gönder` |
| `contact.submit.pending` | `Gönderiliyor...` |
| `contact.new_submission` | `Yeni Başvuru Yap` |

#### Intent-specific fields (`components/contact/intent-field-sections.tsx`)

| Key | Turkish value |
|-----|--------------|
| `contact.field.interest_topic.label` | `İlgi Duyulan Eğitim / Konu*` |
| `contact.field.interest_topic.placeholder` | `Örn. Veri Bilimi, Liderlik, Siber Güvenlik` |
| `contact.field.expertise_areas.label` | `Uzmanlık Alanlarınız*` |
| `contact.field.expertise_areas.placeholder` | `Örn. Python, Makine Öğrenmesi, Derin Öğrenme` |
| `contact.field.company_size.label` | `Şirket Büyüklüğü*` |
| `contact.field.company_size.placeholder` | `Örn. 10-50, 50-100, 100+` |
| `contact.field.partnership_details.label` | `Ortaklık Detayları` |
| `contact.field.partnership_details.placeholder` | `Ortaklık motivasyonunuzu ve beklentilerinizi kısaca paylaşın.` |

#### Validation messages (`lib/lead-intents.ts` — Zod schemas)

| Key | Turkish value |
|-----|--------------|
| `contact.validation.full_name_required` | `Ad Soyad zorunludur` |
| `contact.validation.email_invalid` | `Geçerli bir e-posta adresi girin` |
| `contact.validation.phone_required` | `Telefon numarası zorunludur` |
| `contact.validation.message_required` | `Mesaj alanı zorunludur` |
| `contact.validation.kvkk_required` | `KVKK metnini onaylamanız gerekmektedir` |
| `contact.validation.interest_topic_required` | `İlgi duyulan eğitim/konu zorunludur` |
| `contact.validation.expertise_areas_required` | `Uzmanlık alanlarınız zorunludur` |
| `contact.validation.company_size_required` | `Şirket büyüklüğü zorunludur` |

#### Error messages (`components/contact/intent-lead-form.tsx` — `getErrorMessage`)

| Key | Turkish value |
|-----|--------------|
| `contact.error.invalid_lead_type` | `Geçersiz başvuru türü. Lütfen sayfayı yenileyip tekrar deneyin.` |
| `contact.error.required_fields` | `Lütfen zorunlu alanların tamamını doldurun.` |
| `contact.error.kvkk_consent` | `KVKK metnini onaylamanız gerekmektedir.` |
| `contact.error.submit_failed` | `Form gönderilemedi. Lütfen tekrar deneyin.` |

---

### 4.2 Event Registration Form — `components/event-registration-form.tsx`

| Key | Turkish value |
|-----|--------------|
| `event_reg.field.first_name.label` | `Adınız*` |
| `event_reg.field.last_name.label` | `Soyadınız*` |
| `event_reg.field.email.label` | `E-Posta*` |
| `event_reg.field.phone.label` | `Telefon` |
| `event_reg.field.tckn.label` | `TCKN*` |
| `event_reg.field.tckn.placeholder` | `11 haneli kimlik numarası` |
| `event_reg.field.notes.label` | `Ek Notlar` |
| `event_reg.field.notes.placeholder` | `Katılım beklentiniz, kurumunuz veya iletmek istediginiz notlar...` |
| `event_reg.kvkk.law_reference` | `6698 Sayılı Kişisel Verileri Koruma Kanunu Uyarınca` |
| `event_reg.kvkk.link` | `Aydınlatma Metni'ni` |
| `event_reg.kvkk.suffix` | `okudum ve anladım.` |
| `event_reg.footer_note` | `Kaydınız tamamlandığında durum bilgisi bu form üzerinde gösterilir. Gerekli durumlarda sizinle paylaştığınız iletişim bilgileri üzerinden iletişime geçilebilir.` |
| `event_reg.submit.idle` | `Kaydi Tamamla` |
| `event_reg.submit.pending` | `Kayit Gonderiliyor...` |

> **Note:** success and error messages for this form come from the `useEventRegistrationForm` hook — scan `hooks/use-event-registration-form.ts` for those strings.

---

### 4.3 Newsletter Subscription Form — `components/newsletter-subscription-form.tsx`

| Key | Turkish value |
|-----|--------------|
| `newsletter.field.email.label` | `E-posta adresiniz` |
| `newsletter.field.email.placeholder` | `E-posta adresiniz` |
| `newsletter.submit.idle` | `Abone Ol` |
| `newsletter.submit.pending` | `Gönderiliyor...` |
| `newsletter.success` | `Aboneliğiniz başarıyla alındı. Teşekkür ederiz!` |
| `newsletter.error.generic` | `Abonelik sırasında bir hata oluştu.` |
| `newsletter.error.unexpected` | `Beklenmeyen bir hata oluştu.` |

---

## 5. Data-Layer Strings

These strings live in TypeScript logic files, not JSX. They require `t()` calls outside of component render trees — use `getTranslations()` (server) or `useTranslations()` (client) at the call site, then pass the resolved string down as a prop.

### 5.1 Event type display labels — `app/etkinlikler/page.tsx`, `components/content/events.tsx`

These functions produce labels from Strapi `eventType` enum values. Both files contain equivalent switch statements — consolidate into a single helper.

| Key | Turkish value |
|-----|--------------|
| `taxonomy.event_type.etkinlik` | `Etkinlik` |
| `taxonomy.event_type.egitim` | `Eğitim` |
| `taxonomy.event_type.kurs` | `Kurs` |

### 5.2 Date formatting — `lib/date-formatting.ts`

Date formatting is locale-sensitive. Rather than extracting string keys, pass the active locale to `Intl.DateTimeFormat` so it formats dates in the correct language automatically. No string keys needed here — but the `locale` parameter must be threaded through.

### 5.3 Page visual sections — `lib/page-visual-sections.ts`

The home page visual story section (`VisualStorySection`) is seeded from this file. Scan it for heading, body, and label strings — they follow the same pattern as `home.about.*` above.

---

## 6. Key Namespace Summary

Agents building `messages/tr.json` should organize keys under these top-level namespaces:

```
site         — global metadata
nav          — navigation labels (shared by header and footer)
header       — header-only chrome (aria-labels, mobile menu)
footer       — footer-only chrome
common       — reusable component strings (carousel, breadcrumbs, search)
home         — home page sections
courses      — /egitimler and /egitimler/[slug]
events       — /etkinlikler and /etkinlikler/[slug]
event_reg    — event registration form
teachers     — /egitmenler and /egitmenler/[slug]
blog         — /blog-yazilari and /blog-yazilari/[slug]
news         — /haberler
contact      — /iletisim + IntentLeadForm + lead-intents
solution_partner — /cozum-ortagi
kvkk         — /kvkk
newsletter   — newsletter subscription form
taxonomy     — content-taxonomy.ts labels (topic areas, levels, event types)
```

Flat files (`messages/tr.json`, `messages/en.json`) use dot-notation nesting:

```json
{
  "nav": {
    "home": "Ana Sayfa",
    "courses": "Eğitim Kataloğu"
  },
  "home": {
    "hero": {
      "title": "Kurumsal dönüşümü saha tecrübesiyle hızlandırın.",
      "description": "...",
      "cta_primary": "Daha Fazla Keşfet"
    }
  }
}
```

---

## 7. Files Not Covered Here

The following files were identified in the original discovery plan but contain **no user-visible strings** (only CSS class strings, type literals, or internal identifiers):

- `components/content/content-card-shell.tsx` — title, summary, kicker passed as props from callers
- `components/content/content-page-shell.tsx` — title, description passed as props from callers
- `components/content/content-grid.tsx` — `emptyMessage` passed as prop
- `components/content/route-loading.tsx` — loading skeletons, no text
- `components/content/rich-text-content.tsx` — renders Strapi rich-text, no static strings
- `components/content/visual-story-section.tsx` — all content passed as props
- `components/content/content-superheading.tsx` — text passed as prop

Strings in `components/ui/` (button, input, textarea, etc.) are headless primitives — no user-facing copy.
