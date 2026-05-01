# Netas Academy Bug ve Gereksinim Raporu

Tarih: 2026-04-30  
Kapsam: Frontend UI/UX, etkinlik kayıt akışı, iletişim/KVKK akışı, eğitmen içerikleri, liste performansı ve operasyonel DB backup doğrulaması.  
Not: Bu doküman triage/iş listesi amacıyla hazırlanmıştır; kod düzeltmesi içermez.

## Repo Referans Haritası

- Uygulama shell'i: [frontend/src/app/layout.tsx](../../frontend/src/app/layout.tsx), [frontend/src/components/site-header.tsx](../../frontend/src/components/site-header.tsx), [frontend/src/components/site-footer.tsx](../../frontend/src/components/site-footer.tsx)
- Ortak breadcrumb ve sayfa shell'i: [frontend/src/components/breadcrumbs.tsx](../../frontend/src/components/breadcrumbs.tsx), [frontend/src/components/content/content-page-shell.tsx](../../frontend/src/components/content/content-page-shell.tsx), [frontend/src/components/hero-overlay.tsx](../../frontend/src/components/hero-overlay.tsx)
- Strapi veri istemcisi: [frontend/src/lib/strapi.ts](../../frontend/src/lib/strapi.ts)
- Frontend stilleri: [frontend/src/app/globals.css](../../frontend/src/app/globals.css), [frontend/src/components/content/responsive-layout.ts](../../frontend/src/components/content/responsive-layout.ts)
- Backend bootstrap ve public izinler: [backend/src/index.ts](../../backend/src/index.ts)
- Runtime/deploy veri kalıcılığı: [README.md](../../README.md), [docker-compose.yml](../../docker-compose.yml), [docker-compose.deploy.yml](../../docker-compose.deploy.yml), [backend/config/database.ts](../../backend/config/database.ts)

## BUG-001 - Breadcrumb ile sayfa başlığı üst üste geliyor

Tip: UI Bug  
Öncelik: Medium  
Ekran: İlgili detay/listeleme sayfaları

### Mevcut Durum

Breadcrumb alanı ile sayfa başlığı görsel olarak üst üste biniyor.

### Beklenen Durum

Breadcrumb ve başlık arasında yeterli boşluk olmalı; iki alan çakışmadan okunabilir olmalı.

### Kabul Kriterleri

- Breadcrumb ve başlık tüm ekran boyutlarında çakışmamalı.
- Mobil/tablet/desktop görünümleri kontrol edilmeli.

### İlgili Repo Yerleri

- Ortak breadcrumb render: [frontend/src/components/breadcrumbs.tsx](../../frontend/src/components/breadcrumbs.tsx)
- Ortak liste/detail hero shell: [frontend/src/components/content/content-page-shell.tsx](../../frontend/src/components/content/content-page-shell.tsx)
- Ana sayfa/hero breadcrumb varyantı: [frontend/src/components/hero-overlay.tsx](../../frontend/src/components/hero-overlay.tsx)
- İletişim hero kullanımı: [frontend/src/app/iletisim/page.tsx](../../frontend/src/app/iletisim/page.tsx)
- KVKK hero kullanımı: [frontend/src/app/kvkk/page.tsx](../../frontend/src/app/kvkk/page.tsx)
- Etkinlik detay hero kullanımı: [frontend/src/app/etkinlikler/[slug]/page.tsx](<../../frontend/src/app/etkinlikler/[slug]/page.tsx>)
- Etkinlik kayıt hero kullanımı: [frontend/src/app/etkinlikler/[slug]/kayit/page.tsx](<../../frontend/src/app/etkinlikler/[slug]/kayit/page.tsx>)

## BUG-002 - Eğitmen fotoğrafları güncel değil/değişmeli

Tip: Content / UI  
Öncelik: Low-Medium  
Ekran: Eğitmenler sayfası / Eğitmen detay sayfaları

### Mevcut Durum

Eğitmenlerin fotoğrafları mevcut haliyle uygun değil veya güncel değil.

### Beklenen Durum

Eğitmen fotoğrafları güncel/görsel standartlara uygun olanlarla değiştirilmelidir.

### Not

Yeni fotoğrafların kimden/nereden alınacağı netleştirilmeli.

### İlgili Repo Yerleri

- Eğitmen liste sayfası: [frontend/src/app/egitmenler/page.tsx](../../frontend/src/app/egitmenler/page.tsx)
- Eğitmen detay sayfası: [frontend/src/app/egitmenler/[slug]/page.tsx](<../../frontend/src/app/egitmenler/[slug]/page.tsx>)
- Eğitmen kartı fotoğraf render'ı: [frontend/src/components/teacher-card.tsx](../../frontend/src/components/teacher-card.tsx)
- Hakkımızda eğitmen carousel'i: [frontend/src/app/hakkimizda/page.tsx](../../frontend/src/app/hakkimizda/page.tsx), [frontend/src/components/teacher-carousel.tsx](../../frontend/src/components/teacher-carousel.tsx)
- Strapi media URL/alt helper'ları: [frontend/src/lib/strapi.ts](../../frontend/src/lib/strapi.ts)
- Teacher schema `profilePhoto`: [backend/src/api/teacher/content-types/teacher/schema.json](../../backend/src/api/teacher/content-types/teacher/schema.json)

## BUG-003 - Sitemap hover alanında içerik fazla uzun görünüyor

Tip: UI Bug  
Öncelik: Low  
Ekran: Sitemap / Site planı alanı

### Mevcut Durum

Sitemap üzerine gelindiğinde görünen içerik çok uzun ve görsel olarak taşmış/dağınık görünüyor.

### Beklenen Durum

Hover içeriği okunabilir uzunlukta olmalı; gerekirse metin kısaltılmalı, maksimum genişlik/yükseklik veya tooltip davranışı düzenlenmelidir.

### Kabul Kriterleri

- Hover içeriği ekran dışına taşmamalı.
- Uzun metinlerde kırılım veya kısaltma uygulanmalı.

### İlgili Repo Yerleri

- Footer site planı linkleri ve hover sınıfları: [frontend/src/components/site-footer.tsx](../../frontend/src/components/site-footer.tsx)
- Global container/panel stilleri: [frontend/src/app/globals.css](../../frontend/src/app/globals.css)

## BUG-004 - KVKK sayfasına gidince geri dönüşte kurumsal eğitim talebi formu sıfırlanıyor

Tip: Functional Bug / UX  
Öncelik: High  
Ekran: Kurumsal eğitim talep formu / KVKK sayfası

### Adımlar

1. Kurumsal eğitim talep formu doldurulur.
2. Talep onaylanmadan önce KVKK linkine gidilir.
3. KVKK sayfasında geri/back seçeneği bulunmaz.
4. Ana sayfaya yönlenilir.
5. Forma dönüldüğünde girilen bilgiler kaybolur.

### Mevcut Durum

Kullanıcı KVKK sayfasına geçtiğinde form state'i korunmuyor; kullanıcı bilgileri yeniden girmek zorunda kalıyor.

### Beklenen Durum

KVKK sayfasından forma geri dönülebilmeli ve girilmiş form bilgileri korunmalıdır.

### Kabul Kriterleri

- KVKK sayfasında geri dönüş aksiyonu bulunmalı.
- Form verileri sayfa geçişinde korunmalı.
- Kullanıcı ana sayfaya istemsiz yönlendirilmemeli.

### İlgili Repo Yerleri

- İletişim route wrapper ve varsayılan intent: [frontend/src/app/iletisim/page.tsx](../../frontend/src/app/iletisim/page.tsx)
- Kurumsal eğitim talebi form state'i: [frontend/src/components/contact/intent-lead-form.tsx](../../frontend/src/components/contact/intent-lead-form.tsx)
- Intent sözleşmesi ve başarı mesajları: [frontend/src/lib/lead-intents.ts](../../frontend/src/lib/lead-intents.ts)
- KVKK sayfası: [frontend/src/app/kvkk/page.tsx](../../frontend/src/app/kvkk/page.tsx)
- KVKK linkinin event formundaki kullanımı: [frontend/src/components/event-registration-form.tsx](../../frontend/src/components/event-registration-form.tsx)
- Contact submit proxy route: [frontend/src/app/api/contact-submissions/submit/route.ts](../../frontend/src/app/api/contact-submissions/submit/route.ts)
- Backend contact submit controller/service: [backend/src/api/contact-submission/controllers/contact-submission.ts](../../backend/src/api/contact-submission/controllers/contact-submission.ts), [backend/src/api/contact-submission/services/contact-submission.ts](../../backend/src/api/contact-submission/services/contact-submission.ts)

## BUG-005 - Hakkımızda sayfası bozuk görünüyor

Tip: UI / Functional Bug  
Öncelik: High  
Ekran: Hakkımızda sayfası

### Mevcut Durum

Hakkımızda sayfası görsel veya yapısal olarak bozulmuş durumda.

### Beklenen Durum

Sayfa tasarıma uygun, hatasız ve okunabilir şekilde açılmalıdır.

### Not

Bu ticket için ekran görüntüsü veya URL eklenmesi faydalı olur.

### İlgili Repo Yerleri

- Hakkımızda route ve içerik blokları: [frontend/src/app/hakkimizda/page.tsx](../../frontend/src/app/hakkimizda/page.tsx)
- Ortak sayfa shell'i: [frontend/src/components/content/content-page-shell.tsx](../../frontend/src/components/content/content-page-shell.tsx)
- Görsel hikaye bileşeni ve içerik kaynakları: [frontend/src/components/content/visual-story-section.tsx](../../frontend/src/components/content/visual-story-section.tsx), [frontend/src/lib/page-visual-sections.ts](../../frontend/src/lib/page-visual-sections.ts)
- Hakkımızda carousel bileşenleri: [frontend/src/components/teacher-carousel.tsx](../../frontend/src/components/teacher-carousel.tsx), [frontend/src/components/course-carousel.tsx](../../frontend/src/components/course-carousel.tsx)
- Veri kaynakları: [frontend/src/lib/strapi.ts](../../frontend/src/lib/strapi.ts)

## BUG-006 - Talep gönderimi sonrası başarı mesajı net değil

Tip: UX Improvement  
Öncelik: Medium  
Ekran: Talep gönderim sonrası ekran

### Mevcut Durum

Talep gönderildikten sonra gelen ekranda mesaj yeterince net değil. Kullanıcı talebin başarıyla alındığını açık şekilde göremiyor.

### Beklenen Durum

Talep gönderildikten sonra ekranda net şekilde "Talebiniz alınmıştır." mesajı gösterilmelidir.

### Kabul Kriterleri

- Başarı mesajı görünür ve anlaşılır olmalı.
- Mesaj yalnızca görsel bir alan içinde kaybolmamalı.
- Kullanıcıya sonraki adım bilgisi verilebilir: "En kısa sürede sizinle iletişime geçilecektir."

### İlgili Repo Yerleri

- Success state render'ı: [frontend/src/components/contact/intent-lead-form.tsx](../../frontend/src/components/contact/intent-lead-form.tsx)
- Intent bazlı success copy: [frontend/src/lib/lead-intents.ts](../../frontend/src/lib/lead-intents.ts)
- Backend submit yanıtı: [backend/src/api/contact-submission/controllers/contact-submission.ts](../../backend/src/api/contact-submission/controllers/contact-submission.ts)

## BUG-007 - Ana sayfa başlığı fazla büyük / layout iyileştirilmeli

Tip: UI Improvement  
Öncelik: Low-Medium  
Ekran: Ana sayfa

### Mevcut Durum

Ana sayfadaki başlık görsel olarak büyük duruyor ve sayfa dengesi etkileniyor.

### Beklenen Durum

Başlık boyutu küçültülmeli veya alan iki kolonlu yapıya alınarak daha dengeli görünüm sağlanmalıdır.

### Not

Bu madde tasarım iyileştirmesi olarak ele alınabilir.

### İlgili Repo Yerleri

- Ana sayfa hero kullanımı: [frontend/src/app/page.tsx](../../frontend/src/app/page.tsx)
- Hero font/spacing ve responsive değerleri: [frontend/src/components/hero-overlay.tsx](../../frontend/src/components/hero-overlay.tsx)
- Global page/container stilleri: [frontend/src/app/globals.css](../../frontend/src/app/globals.css)

## BUG-008 - Site planı ile başlıklar hizalı değil

Tip: UI Bug  
Öncelik: Low-Medium  
Ekran: Site planı / ilgili sayfa başlık alanları

### Mevcut Durum

Site planı alanı ile başlıklar hizalı görünmüyor.

### Beklenen Durum

Başlıklar ve site planı hizalama açısından tutarlı olmalıdır.

### Kabul Kriterleri

- Sol/sağ hizalar tasarım grid'ine uygun olmalı.
- Farklı ekran boyutlarında hizalama korunmalı.

### İlgili Repo Yerleri

- Footer site planı grid'i: [frontend/src/components/site-footer.tsx](../../frontend/src/components/site-footer.tsx)
- Ortak container ölçüleri: [frontend/src/app/globals.css](../../frontend/src/app/globals.css)
- Ortak hero/sayfa başlık alanı: [frontend/src/components/content/content-page-shell.tsx](../../frontend/src/components/content/content-page-shell.tsx)
- Header navigasyonu: [frontend/src/components/site-header.tsx](../../frontend/src/components/site-header.tsx)

## BUG-009 - Talep sonrası ekranda üst banner'daki "İletişim" linki beklenen sayfayı açmıyor

Tip: Functional Bug / UX  
Öncelik: Medium  
Ekran: Talep gönderim sonrası ekran / üst banner

### Adımlar

1. Talep gönderilir.
2. Talep sonrası ekranda üst banner'daki "İletişim" linkine tıklanır.
3. Temiz bir iletişim sayfası açılması beklenir.

### Mevcut Durum

İletişim linkine tıklanınca beklenen temiz iletişim sayfası açılmıyor. Mevcut URL zaten iletişim URL'i olduğu için davranış kullanıcı açısından kafa karıştırıcı.

### Beklenen Durum

Kullanıcı "İletişim" linkine tıkladığında net bir iletişim sayfası veya yeniden gönderim ekranı açılmalıdır.

### Öneri

Talep sonrası ekranda "Yeni talep gönder" butonu daha görünür hale getirilebilir. Üst menüdeki "İletişim" linki ise formu sıfırlayarak temiz iletişim sayfasına yönlendirebilir.

### İlgili Repo Yerleri

- Üst menü linkleri ve aktif route davranışı: [frontend/src/components/site-header.tsx](../../frontend/src/components/site-header.tsx)
- İletişim route ve query intent çözümü: [frontend/src/app/iletisim/page.tsx](../../frontend/src/app/iletisim/page.tsx)
- Success state ve "Yeni Başvuru Yap" aksiyonu: [frontend/src/components/contact/intent-lead-form.tsx](../../frontend/src/components/contact/intent-lead-form.tsx)
- Intent URL builder: [frontend/src/lib/lead-intents.ts](../../frontend/src/lib/lead-intents.ts)

## BUG-010 - Eğitmen sayfalarında "Hakkında" alanı HTML olarak görünüyor

Tip: Content Rendering Bug  
Öncelik: High  
Ekran: Eğitmen detay sayfaları

### Mevcut Durum

Eğitmen sayfalarında "Hakkında" içeriği HTML tag'leriyle birlikte düz metin olarak görünüyor.

### Beklenen Durum

HTML içerik ya doğru şekilde render edilmeli ya da sanitize edilerek düz metne çevrilmelidir.

### Kabul Kriterleri

- Kullanıcı HTML tag'i görmemeli.
- İçerik okunabilir formatta gösterilmeli.
- XSS güvenlik riski açısından sanitize kontrolü yapılmalı.

### İlgili Repo Yerleri

- Eğitmen detayındaki `bio` render'ı: [frontend/src/app/egitmenler/[slug]/page.tsx](<../../frontend/src/app/egitmenler/[slug]/page.tsx>)
- Mevcut sanitize rich-text component'i: [frontend/src/components/content/rich-text-content.tsx](../../frontend/src/components/content/rich-text-content.tsx)
- Teacher schema `bio` richtext alanı: [backend/src/api/teacher/content-types/teacher/schema.json](../../backend/src/api/teacher/content-types/teacher/schema.json)
- Teacher fetch query: [frontend/src/lib/strapi.ts](../../frontend/src/lib/strapi.ts)

## BUG-011 - Etkinlikler sayfasında filtre alanının üst boşluğu sıfırlanmış

Tip: UI Bug  
Öncelik: Low  
Ekran: Etkinlikler liste sayfası

### Mevcut Durum

Filtre alanının üst boşluğu yok/sıfırlanmış görünüyor.

### Beklenen Durum

Filtre alanı ile üstündeki içerik arasında tasarıma uygun spacing bulunmalıdır.

### İlgili Repo Yerleri

- Etkinlik liste sayfasındaki filtre wrapper'ı: [frontend/src/app/etkinlikler/page.tsx](../../frontend/src/app/etkinlikler/page.tsx)
- Ortak page-section spacing: [frontend/src/components/content/content-page-shell.tsx](../../frontend/src/components/content/content-page-shell.tsx), [frontend/src/app/globals.css](../../frontend/src/app/globals.css)

## BUG-012 - Geçmiş tarihli etkinliğe kayıt olunabiliyor

Tip: Functional Bug  
Öncelik: Critical / High  
Ekran: Etkinlik detay / kayıt ekranı

### Mevcut Durum

Takvim açısından geçmişte kalmış bir etkinlik için kullanıcı kayıt olabiliyor.

### Beklenen Durum

Geçmiş tarihli etkinliklerde kayıt aksiyonu kapatılmalıdır.

### Kabul Kriterleri

- Etkinlik tarihi geçmişse kayıt butonu gösterilmemeli veya disabled olmalı.
- Kullanıcıya "Bu etkinlik sona ermiştir." benzeri açıklama gösterilmeli.
- Backend tarafında da geçmiş etkinlik kaydı engellenmeli.

### İlgili Repo Yerleri

- Frontend kayıt açık/kapalı hesabı: [frontend/src/lib/event-registration.ts](../../frontend/src/lib/event-registration.ts)
- Backend kayıt açık/kapalı hesabı: [backend/src/utils/event-registration.ts](../../backend/src/utils/event-registration.ts)
- Etkinlik detay kayıt CTA'sı: [frontend/src/app/etkinlikler/[slug]/page.tsx](<../../frontend/src/app/etkinlikler/[slug]/page.tsx>)
- Etkinlik kayıt route'u: [frontend/src/app/etkinlikler/[slug]/kayit/page.tsx](<../../frontend/src/app/etkinlikler/[slug]/kayit/page.tsx>)
- Frontend registration form/hook: [frontend/src/components/event-registration-form.tsx](../../frontend/src/components/event-registration-form.tsx), [frontend/src/hooks/use-event-registration-form.ts](../../frontend/src/hooks/use-event-registration-form.ts)
- Registration proxy route: [frontend/src/app/api/registrations/register/route.ts](../../frontend/src/app/api/registrations/register/route.ts)
- Backend registration controller/service: [backend/src/api/registration/controllers/registration.ts](../../backend/src/api/registration/controllers/registration.ts), [backend/src/api/registration/services/registration.ts](../../backend/src/api/registration/services/registration.ts)
- Event schema `startsAt` / `keepRegistrationsOpen`: [backend/src/api/event/content-types/event/schema.json](../../backend/src/api/event/content-types/event/schema.json)

## BUG-013 - Etkinlik liste kartlarında border kalınlığı tutarsız

Tip: UI Bug  
Öncelik: Low  
Ekran: Etkinlik liste sayfası

### Mevcut Durum

Etkinlik liste sayfasında bir kartın border kalınlığı diğer kartlara göre daha kalın görünüyor.

### Beklenen Durum

Tüm kartlar aynı border stiline sahip olmalıdır.

### İlgili Repo Yerleri

- Event list kart sınıfı: [frontend/src/components/content/events.tsx](../../frontend/src/components/content/events.tsx)
- Ortak card shell sınıfları: [frontend/src/components/content/content-card-shell.tsx](../../frontend/src/components/content/content-card-shell.tsx)
- Global `panel-surface` border standardı: [frontend/src/app/globals.css](../../frontend/src/app/globals.css)

## REQ-014 - Etkinlik kaydında TCKN zorunluluğu kaldırılmalı

Tip: Requirement / Form Validation  
Öncelik: Medium-High  
Ekran: Etkinlik kayıt formu

### Mevcut Durum

Etkinlik kaydında TCKN alanı zorunlu görünüyor.

### Beklenen Durum

Etkinlik kaydında TCKN zorunluluğu kaldırılmalıdır. TCKN yalnızca eğitim veya kurs kayıtlarında gerekli olmalıdır.

### Kabul Kriterleri

- Etkinlik kayıt formunda TCKN zorunlu olmamalı.
- Eğitim/kurs kayıtlarında TCKN zorunluluğu devam etmeli.
- Backend validasyonları da bu ayrımı desteklemeli.

### İlgili Repo Yerleri

- Event registration form TCKN alanı: [frontend/src/components/event-registration-form.tsx](../../frontend/src/components/event-registration-form.tsx)
- Frontend TCKN validasyonu ve payload: [frontend/src/hooks/use-event-registration-form.ts](../../frontend/src/hooks/use-event-registration-form.ts)
- TCKN helper: [frontend/src/lib/tckn.ts](../../frontend/src/lib/tckn.ts), [backend/src/utils/tckn.ts](../../backend/src/utils/tckn.ts)
- Backend event registration controller/service: [backend/src/api/registration/controllers/registration.ts](../../backend/src/api/registration/controllers/registration.ts), [backend/src/api/registration/services/registration.ts](../../backend/src/api/registration/services/registration.ts)
- Eğitim/kurs başvuru tarafında TCKN zorunluluğu: [backend/src/api/course-application/controllers/course-application.ts](../../backend/src/api/course-application/controllers/course-application.ts), [backend/src/api/course-application/services/course-application.ts](../../backend/src/api/course-application/services/course-application.ts)
- Event type kaynağı: [backend/src/api/event/content-types/event/schema.json](../../backend/src/api/event/content-types/event/schema.json), [frontend/src/lib/strapi.ts](../../frontend/src/lib/strapi.ts)

## PERF-015 - Liste filtre API yanıt süreleri iyileştirilmeli

Tip: Performance  
Öncelik: Medium  
Ekran: Liste filtreleri

### Mevcut Durum

Liste filtre API'leri yaklaşık 300 ms sürede dönüyor.

### Beklenen Durum

Filtre API performansı gözden geçirilmeli ve mümkünse daha hızlı yanıt verecek şekilde optimize edilmelidir.

### Not

300 ms kabul edilebilir olabilir; ancak UX hedefi daha düşükse cache, index, payload azaltma veya debounce kontrolü değerlendirilebilir.

### İlgili Repo Yerleri

- Strapi fetch helper ve liste query'leri: [frontend/src/lib/strapi.ts](../../frontend/src/lib/strapi.ts)
- Etkinlik filtre UI ve query param davranışı: [frontend/src/app/etkinlikler/page.tsx](../../frontend/src/app/etkinlikler/page.tsx)
- Kurs katalog arama/filtreleme yüzeyi: [frontend/src/components/courses/course-catalog-list.tsx](../../frontend/src/components/courses/course-catalog-list.tsx), [frontend/src/app/egitimler/page.tsx](../../frontend/src/app/egitimler/page.tsx)
- Blog arama yüzeyi: [frontend/src/app/blog-yazilari/blog-search.tsx](../../frontend/src/app/blog-yazilari/blog-search.tsx), [frontend/src/app/blog-yazilari/page.tsx](../../frontend/src/app/blog-yazilari/page.tsx)
- Event backend schema/route/controller: [backend/src/api/event/content-types/event/schema.json](../../backend/src/api/event/content-types/event/schema.json), [backend/src/api/event/routes/event.ts](../../backend/src/api/event/routes/event.ts), [backend/src/api/event/controllers/event.ts](../../backend/src/api/event/controllers/event.ts)

## BUG-016 - Etkinlik kaydı sonrası kayıt tamamlandı mesajı gösterilmeli

Tip: UX Improvement  
Öncelik: Medium  
Ekran: Etkinlik kayıt sonrası ekran

### Mevcut Durum

Etkinlik kaydı tamamlandıktan sonra kullanıcıya yeterince net başarı mesajı gösterilmiyor.

### Beklenen Durum

Kayıt tamamlandıktan sonra "Kaydınız tamamlanmıştır." benzeri net bir mesaj gösterilmelidir.

### Kabul Kriterleri

- Başarılı kayıt sonrası kullanıcı açıkça bilgilendirilmeli.
- Başarısız kayıt durumunda ayrı hata mesajı gösterilmeli.

### İlgili Repo Yerleri

- Success/error render'ı: [frontend/src/components/event-registration-form.tsx](../../frontend/src/components/event-registration-form.tsx)
- Success/error copy ve submit akışı: [frontend/src/hooks/use-event-registration-form.ts](../../frontend/src/hooks/use-event-registration-form.ts)
- Registration proxy route: [frontend/src/app/api/registrations/register/route.ts](../../frontend/src/app/api/registrations/register/route.ts)
- Backend registration response: [backend/src/api/registration/controllers/registration.ts](../../backend/src/api/registration/controllers/registration.ts), [backend/src/api/registration/services/registration.ts](../../backend/src/api/registration/services/registration.ts)

## BUG-017 - Etkinlik kayıt formunda isim zorunlu, soyad zorunlu değil

Tip: Form Validation Bug  
Öncelik: Medium  
Ekran: Etkinlik kayıt formu / diğer formlar

### Mevcut Durum

Etkinlik kaydında isim alanı zorunlu, ancak soyad alanı zorunlu değil.

### Beklenen Durum

Standart olarak tüm formlarda isim ve soyadı alanları zorunlu olmalıdır.

### Kabul Kriterleri

- İsim alanı zorunlu olmalı.
- Soyad alanı zorunlu olmalı.
- Tüm ilgili formlarda validasyon standardı tutarlı olmalı.

### İlgili Repo Yerleri

- Frontend event registration fields: [frontend/src/components/event-registration-form.tsx](../../frontend/src/components/event-registration-form.tsx)
- Frontend event registration submit validation: [frontend/src/hooks/use-event-registration-form.ts](../../frontend/src/hooks/use-event-registration-form.ts)
- Backend event registration required fields: [backend/src/api/registration/controllers/registration.ts](../../backend/src/api/registration/controllers/registration.ts), [backend/src/api/registration/services/registration.ts](../../backend/src/api/registration/services/registration.ts)
- Student schema ve upsert davranışı: [backend/src/api/student/content-types/student/schema.json](../../backend/src/api/student/content-types/student/schema.json), [backend/src/api/student/services/student.ts](../../backend/src/api/student/services/student.ts)
- Contact form ad-soyad standardı: [frontend/src/components/contact/intent-lead-form.tsx](../../frontend/src/components/contact/intent-lead-form.tsx), [frontend/src/lib/lead-intents.ts](../../frontend/src/lib/lead-intents.ts)

## REQ-018 - Etkinlikte "Durum Bilgisi" kavramının karşılığı netleştirilmeli

Tip: Requirement Clarification  
Öncelik: Medium  
Ekran: Etkinlik detay / liste / yönetim ekranları

### Mevcut Durum

"Durum Bilgisi" kavramının etkinlik bağlamında ne ifade ettiği net değil.

### Beklenen Durum

Etkinlik için durum bilgisinin hangi değerleri alacağı ve kullanıcıya nasıl gösterileceği netleştirilmelidir.

### Açık Noktalar

- Etkinlik durumları neler olacak?
  - Yayında
  - Taslak
  - Kayıt açık
  - Kayıt kapalı
  - Kontenjan dolu
  - Sona erdi
  - İptal edildi
- Bu durumlar kullanıcı tarafında mı, admin tarafında mı gösterilecek?
- Durum otomatik mi hesaplanacak, manuel mi yönetilecek?

### İlgili Repo Yerleri

- Event schema mevcut alanları: [backend/src/api/event/content-types/event/schema.json](../../backend/src/api/event/content-types/event/schema.json)
- Registration schema mevcut durum enum'u: [backend/src/api/registration/content-types/registration/schema.json](../../backend/src/api/registration/content-types/registration/schema.json)
- Frontend event type ve registration window tipi: [frontend/src/lib/strapi.ts](../../frontend/src/lib/strapi.ts), [frontend/src/lib/event-registration.ts](../../frontend/src/lib/event-registration.ts)
- Backend registration window helper: [backend/src/utils/event-registration.ts](../../backend/src/utils/event-registration.ts)
- Etkinlik liste/detay/kayıt gösterimleri: [frontend/src/app/etkinlikler/page.tsx](../../frontend/src/app/etkinlikler/page.tsx), [frontend/src/app/etkinlikler/[slug]/page.tsx](<../../frontend/src/app/etkinlikler/[slug]/page.tsx>), [frontend/src/app/etkinlikler/[slug]/kayit/page.tsx](<../../frontend/src/app/etkinlikler/[slug]/kayit/page.tsx>)

## OPS-019 - Periyodik DB backup altyapısının çalıştığı doğrulanmalı

Tip: DevOps / Infrastructure  
Öncelik: High  
Alan: Database backup / Disaster recovery

### Mevcut Durum

Periyodik DB backup altyapısı kurulmuş durumda; ancak çalışıp çalışmadığı doğrulanmalı.

### Beklenen Durum

Backup job'larının düzenli çalıştığı, backup dosyalarının oluştuğu ve restore edilebilir olduğu doğrulanmalıdır.

### Kabul Kriterleri

- Backup job schedule kontrol edilmeli.
- Son başarılı backup zamanı görülebilmeli.
- Backup dosyasının erişilebilir olduğu doğrulanmalı.
- En az bir test restore yapılmalı.
- Migration ve disaster recovery senaryoları için kullanılabilirlik doğrulanmalı.

### İlgili Repo Yerleri

- Lokal Docker veri kalıcılığı: [docker-compose.yml](../../docker-compose.yml)
- Deploy Docker veri kalıcılığı: [docker-compose.deploy.yml](../../docker-compose.deploy.yml)
- SQLite config: [backend/config/database.ts](../../backend/config/database.ts)
- Repo runtime notları: [README.md](../../README.md)
- Image içinde backend `.tmp` ve upload dizinleri: [Dockerfile](../../Dockerfile)

### Triage Notu

Repo içinde periyodik backup schedule/job tanımı görünmüyor. Bu madde için canlı ortamda cron/systemd timer, compose host dizini, backup hedefi ve restore prosedürü ayrıca doğrulanmalıdır.

## Kısa Önceliklendirme Önerisi

### Önce çözülmesi gerekenler

1. BUG-012 - Geçmiş tarihli etkinliğe kayıt olunabilmesi
2. BUG-004 - KVKK dönüşünde form bilgilerinin kaybolması ✅
3. BUG-005 - Hakkımızda sayfasının bozuk olması ✅
4. BUG-010 - Eğitmen hakkında alanında HTML görünmesi ✅
5. OPS-019 - DB backup altyapısının çalıştığının doğrulanması

### Sonraki sprint/UI düzenlemeleri

- BUG-001 - Breadcrumb/başlık çakışması
- ~~BUG-008 - Site planı hizalama~~ ✅ (afa725e)
- ~~BUG-003 - Sitemap hover uzunluğu~~ ✅ (59cd682)
- ~~BUG-013 - Kart border tutarsızlığı~~ ✅ (b9d8c63)
- ~~BUG-011 - Filtre üst boşluğu~~ ✅ (5703e3b)
- BUG-007 - Ana sayfa başlık düzenlemesi

### Requirement netleştirme gerekenler

- REQ-018 - Etkinlikte "Durum Bilgisi" kavramı
- REQ-014 - TCKN zorunluluğunun etkinlik/eğitim/kurs bazında ayrıştırılması
- BUG-017 - Formlarda isim/soyad zorunluluk standardı  ✅

---

## Çözülen Maddeler (2026-04-30)

### BUG-010 — Eğitmen "Hakkında" alanında HTML görünmesi ✅

**Commit:** `59a110d`  
**Dosya:** `frontend/src/app/egitmenler/[slug]/page.tsx`

**Değişiklik:** `teacher.bio` alanı düz `<p>{teacher.bio}</p>` ile render ediliyordu. Strapi `richtext` alanı HTML döndüğü için etiketler ham metin olarak görünüyordu. Mevcut `RichTextContent` bileşeni (`isomorphic-dompurify` ile XSS-safe sanitizasyon + `dangerouslySetInnerHTML` + Tailwind prose stilleri) kullanılarak düzeltildi.

```diff
- <p className="text-[15px] leading-7 ...">{teacher.bio}</p>
+ <RichTextContent content={teacher.bio} />
```

### BUG-011 — Etkinlikler filtre alanının üst boşluğu ✅

**Commit:** `5703e3b`  
**Dosya:** `frontend/src/app/etkinlikler/page.tsx`

**Değişiklik:** Filtre barında `-mt-6 sm:-mt-8` negatif margin kullanılıyordu (boşluğu sıfırlıyordu). İlk denemede `mt-6 sm:mt-8` çok fazla boşluk yarattı. Son haliyle `mt-2 sm:mt-4` değerleri ile hero ile filtre arasında sıkı ama görünür bir boşluk sağlandı.

```diff
- <div className="-mt-6 mb-6 ... sm:-mt-8 sm:mb-8 ...">
+ <div className="mt-2 mb-6 ... sm:mt-4 sm:mb-8 ...">
```

### BUG-013 — Etkinlik kartlarında border kalınlığı tutarsızlığı ✅

**Commit:** `b9d8c63`  
**Dosya:** `frontend/src/components/content/events.tsx`

**Değişiklik:** Event kartlarında `border-[3px]` arbitrary değeri kullanılıyordu. Tüm kartlarda ortak olan shadcn `Card` bileşeninin varsayılan `border` (1px) değeri ile tutarlılık sağlandı.

```diff
- className="border-[3px] bg-white"
+ className="bg-white"
```

### BUG-003 — Sitemap hover alanında içerik taşması ✅

**Commit:** `59cd682`  
**Dosya:** `frontend/src/components/site-footer.tsx`

**Değişiklik:** Site planı linkleri tek sütun `flex flex-col` yerine 2 sütunlu grid yapısına (`grid grid-cols-1 sm:grid-cols-2`) geçirildi. Linklerdeki `px-3` padding `pl-0 pr-3` olarak değiştirilerek "Site Planı" başlığı ile sola hizalandı. Uzun metinler için `block truncate` eklendi.

```diff
- <div className="flex flex-col gap-1">
+ <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">

- className="rounded-sm border border-transparent px-3 py-1.5 ..."
+ className="block truncate rounded-sm border border-transparent pl-0 pr-3 py-1.5 ..."
```

### BUG-008 — Site planı ile başlıklar hizalı değil ✅

**Commit:** `afa725e`  
**Dosya:** `frontend/src/components/site-footer.tsx`

**Değişiklik:** Footer grid kolon oranları `[minmax(180px,0.8fr)_minmax(0,2fr)_auto]` şeklinde dengesizdi (site planı marka kolonundan ~2.5 kat geniş). `[1fr_1fr_auto]` ile marka ve site planı kolonları eşit genişliğe getirilerek yatay hizalama sağlandı.

```diff
- lg:grid-cols-[minmax(180px,0.8fr)_minmax(0,2fr)_auto]
+ lg:grid-cols-[1fr_1fr_auto]
```

### BUG-005 — Hakkımızda sayfası bozuk görünüyor ✅

**Commit:** `uncommitted` (working tree)  
**Dosyalar:** `frontend/src/app/hakkimizda/page.tsx`, `frontend/src/components/teacher-carousel.tsx`, `frontend/src/components/course-carousel.tsx`

**Kök Neden:** Hakkımızda sayfası, Server Component'ten Client Component'lere (`TeacherCarousel`, `CourseCarousel`) inline arrow function (`getCardTestId`) prop'u geçiyordu. Next.js 16 React Server Components mimarisinde fonksiyonlar serileştirilebilir olmadığı için server/client sınırından geçemez ve sayfa HTTP 500 hatası ile crash oluyordu.

**Değişiklik:** Her iki carousel bileşeninde `getCardTestId?: (slug: string) => string` fonksiyon prop'u kaldırıldı, yerine `cardTestIdPrefix?: string` string prop'u eklendi. Carousel bileşenleri `data-testid` değerini `${cardTestIdPrefix}.${slug}` formatında kendisi oluşturacak şekilde güncellendi. Hakkımızda sayfasında artık fonksiyon değil string prefix geçiliyor. Kullanılmayan `join` import'u da temizlendi.

```diff
// teacher-carousel.tsx & course-carousel.tsx
- getCardTestId?: (slug: string) => string;
+ cardTestIdPrefix?: string;

- data-testid={getCardTestId?.(slug)}
+ data-testid={cardTestIdPrefix ? `${cardTestIdPrefix}.${slug}` : undefined}

// hakkimizda/page.tsx
- import { join } from "@/lib/testids";
- getCardTestId={(slug) => join('page', 'hakkimizda', 'teacher-carousel', 'card', slug)}
+ cardTestIdPrefix="page.hakkimizda.teacher-carousel.card"
```
