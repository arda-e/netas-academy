---
date: 2026-04-21
topic: netas-academy-web-gereksinimleri
focus: academy-portal-growth-and-discovery
mode: repo-grounded
---

# Ideation: Netaş Academy Web Gereksinimleri

## Grounding Context

### Codebase Context

- Mevcut yüzey zaten `frontend/src/app/page.tsx`, `frontend/src/app/hakkimizda/page.tsx`, `frontend/src/app/egitimler/page.tsx`, `frontend/src/app/etkinlikler/page.tsx` ve `frontend/src/app/iletisim/page.tsx` ile çalışan bir academy vitrini sunuyor.
- `frontend/src/components/site-header.tsx` navigasyonda Hakkımızda, Etkinlikler, Eğitimler, Blog Yazıları, Haberler ve İletişim başlıklarını zaten taşıyor; yani IA sıfırdan değil, derinleştirme ihtiyacı var.
- `frontend/src/lib/strapi.ts` yalnızca öğretmen, eğitim, etkinlik ve blog verisini çekiyor. Newsletter, site search, payment, katalog, partner/eğitmen başvuru tipleri veya başarı hikayesi için ayrı veri modeli/fetch akışı görünmüyor.
- `backend/src/api/contact-submission/services/contact-submission.ts` ve `backend/src/api/registration/services/registration.ts` iletişim ve etkinlik kaydının backend’de gerçekten işlendiğini doğruluyor.
- `backend/src/api/event/services/event.ts` etkinlik katılımcılarına e-posta gönderimi için mevcut bir servis sunuyor; bu da confirmation, reminder ve ICS gibi uzantıları daha gerçekçi kılıyor.
- `backend/scripts/seed-demo.js` içeriği halen küçük bir katalog boyutuna işaret ediyor: yaklaşık 3 eğitmen, 5 eğitim, 8 etkinlik ve 4 blog yazısı.

### External Context

- Baymard araştırmaları küçük kataloglu sitelerde önce net navigasyon ve kategorilendirmenin, sonra site içi aramanın daha yüksek getiri verdiğini gösteriyor.
- Eventbrite örnekleri ve yardım içerikleri, kayıt sonrası confirmation ekranı/e-postası ile add-to-calendar davranışının kullanıcı beklentisine yakın olduğunu gösteriyor.
- HubSpot’un form ve newsletter önerileri, düşük niyetli abonelik formlarında mümkün olan en az alanın istenmesi ve değerin anında verilmesi gerektiğini vurguluyor.
- HubSpot’un customer success story rehberi, dönüşüm içeriğinin ürün özelliklerinden çok başlangıç problemi, çözüm yolu ve sonuç dönüşümü üzerinden daha ikna edici olduğunu gösteriyor.

## Priority Update After Goal Clarification

Kullanıcı geri bildirimiyle sitenin ana amacı netleşti: **kurumsal eğitim satmak**. Webinar, etkinlik, blog ve haberler ana ürün değil; güven üretme, ilgi toplama ve nurture etme amacıyla çalışan destekleyici sütunlar.

Bu güncellemeyle birlikte:

- Ana conversion `etkinlik kaydı` değil, `kurumsal eğitim talebi / görüşme talebi / brief bırakma` oldu.
- Ana sayfa, eğitim detayları ve iletişim yüzeyi daha satış odaklı yorumlanmalı.
- Etkinlikler ve webinarlar funnel’ın üst ve orta katmanında kalmalı.
- PDF katalog, önceki değerlendirmeye göre daha yukarı çıktı; çünkü kurum içi paylaşım ve teklif öncesi dolaşım için anlamlı bir satış materyali.

Bu netlikle güncellenmiş öncelik sırası:

1. Niyet Bazlı Başvuru Mimarisi
2. Güven Odaklı Ana Sayfa Anlatısı
3. Eğitim Etki Hikayeleri
4. İçerik Taşıma ve Keşif Temeli
5. PDF Katalog
6. Hafif Abonelik ve Duyuru Hattı
7. Ölçüm Omurgası ve Başarı Tanımı
8. Etkinlik Yaşam Döngüsü Tamamlama

Not: Aşağıdaki “Ranked Ideas” bölümü ilk ideation turunun sıralamasını korur; planlama yapılacaksa yukarıdaki güncellenmiş sıra esas alınmalı.

## Ranked Ideas

### 1. Niyet Bazlı Başvuru Mimarisi
**Description:** İletişim yüzeyi tek form olmaktan çıkarılıp `Kurumsal Eğitim Talebi`, `Çözüm Ortağı Başvurusu`, `Eğitmen Başvurusu`, `Genel İletişim` ve gerekirse `Etkinlik İçin İlgi Bırak` gibi net intent akışlarına ayrılır. Her akışın alanları, teşekkür mesajı ve bildirim routing’i farklı olur.

**Rationale:** Kod tabanında iletişim formu ve backend submission modeli zaten var; en hızlı değer üretecek genişleme, daha fazla form eklemek değil, niyeti ayrıştırıp lead kalitesini yükseltmek. Kullanıcının listesinde özellikle çözüm ortağı ve eğitmen için iki ayrı başvuru alanı istenmiş durumda.

**Downsides:** Yeni başvuru tipleri içerik modeli, notification routing ve operasyonel sahiplik ister. Fazla detaylı tasarlanırsa küçük ekip için yönetim yükü artar.

**Confidence:** 92%

**Complexity:** Medium

**Status:** Unexplored

### 2. Güven Odaklı Ana Sayfa Anlatısı
**Description:** Ana sayfa açılışı ürün-benzeri “portal yönetimi” mesajından çıkıp “Netaş Academy kimdir, neden güvenilir, kimlerle çalışır, nasıl bir öğrenme deneyimi sunar” eksenine taşınır. Akış; kısa bir about-us banner, yaklaşım, eğitmenler, başarı/etki hikayeleri ve oradan eğitimlere/etkinliklere geçiş şeklinde kurgulanır.

**Rationale:** `frontend/src/app/page.tsx` şu an akademi sitesinden çok altyapı vitrini gibi konuşuyor. Kullanıcının da belirttiği gibi about-us ile giriş yapmak, özellikle kurumsal ve ilk kez gelen ziyaretçiler için daha doğru bir güven başlangıcı sağlar.

**Downsides:** İyi copy ve güçlü görsel/kanıt malzemesi gerektirir. Sadece düzen değişirse ama içerik derinleşmezse etkisi sınırlı kalır.

**Confidence:** 90%

**Complexity:** Low-Medium

**Status:** Unexplored

### 3. Eğitim Etki Hikayeleri
**Description:** Eğitim detail sayfalarına “Bu eğitim ile ne yarattık?” katmanı eklenir. Bu alan; müşteri problemi, uygulanan eğitim, çıktı/kazanım, mümkünse kısa metrik veya alıntı ile ilerleyen tekrar kullanılabilir bir başarı hikayesi modeli olur.

**Rationale:** Mevcut course sayfaları eğitmen ve açıklama veriyor, fakat kurumsal alıcının asıl sorusu olan “bize ne değişiklik yaratır?” tarafı eksik. Kullanıcının doğrudan istediği “müşteride bu eğitim ile ne yarattık” sorusuna en net cevap bu.

**Downsides:** Gerçek vaka toplama, izin alma ve editoryal doğruluk gerekir. Yeterli örnek çıkmazsa boş alanlar güven azaltabilir.

**Confidence:** 88%

**Complexity:** Medium

**Status:** Unexplored

### 4. Etkinlik Yaşam Döngüsü Tamamlama
**Description:** Mevcut kayıt akışı confirmation page/e-mail, ICS dosyası veya add-to-calendar linkleri, etkinlik öncesi hatırlatma ve sonrasında follow-up adımlarını kapsayacak şekilde tamamlanır. Sonraki fazda anket ve kampanya yönetimi bu akışın üstüne eklenebilir.

**Rationale:** Etkinlik kaydı bugün zaten çalışıyor; `backend/src/api/event/services/event.ts` e-posta gönderimine hazır bir zemin sunuyor. Bu yüzden ICS ve reminder tarafı, sıfırdan modül kurmaktan çok mevcut sistemi tamamlama işi.

**Downsides:** E-posta provider ayarı, tarih/saat/timezone doğruluğu ve template kalitesi kritik olur. Kötü confirmation deneyimi güveni zedeleyebilir.

**Confidence:** 91%

**Complexity:** Medium

**Status:** Unexplored

### 5. Hafif Abonelik ve Duyuru Hattı
**Description:** Etkinliğe hemen kayıt olmayan ama academy’den haber almak isteyenler için düşük sürtünmeli bir `Bülten ve duyurulardan haberdar olmak ister misiniz?` akışı kurulur. Bu akış footer, etkinlik listesi, event detail ve teşekkür ekranlarında görünür; ilk aşamada e-posta + açık rıza yeterlidir.

**Rationale:** Şu an site yalnızca “iletişim formu gönder” veya “etkinliğe kaydol” davranışını yakalıyor. Aradaki sıcak ama kararsız kitle tamamen kayboluyor. Kullanıcının bülten talebi doğrudan bu boşluğu kapatıyor.

**Downsides:** Kolayca mini CRM projesine dönüşebilir. Başlangıçta segmentasyon, unsubscribe ve iletişim sıklığı yalın tutulmazsa ekip yükü artar.

**Confidence:** 86%

**Complexity:** Medium

**Status:** Unexplored

### 6. İçerik Taşıma ve Keşif Temeli
**Description:** Mevcut içeriğin taşınması, içerik tiplerinin normalize edilmesi ve en basit anlamlı sınıflandırmanın kurulması tek bir program olarak ele alınır. İlk aşamada `kurumsal/bireysel` veya `konu` gibi tek bir sade taksonomi seçilir; böylece ileride arama, filtre, takvim ve katalog gibi keşif özellikleri sağlam zemine oturur.

**Rationale:** Kullanıcının içerik taşıma ve eğitim kategorilendirme maddeleri tek başına özellik değil, platform temeli niteliğinde. Baymard’ın küçük katalog sitelerde aramadan önce net yapı önerisi de bunu destekliyor.

**Downsides:** Görünürde “özellik” gibi algılanmaz ama ciddi editoryal emek ister. Kötü tasarlanırsa ilerideki discovery işlerini de yanlış temele oturtur.

**Confidence:** 94%

**Complexity:** High

**Status:** Unexplored

### 7. Ölçüm Omurgası ve Başarı Tanımı
**Description:** “Web’e geldi, ayrıldı, ne yaptıysa başarılı sayacağız?” sorusuna net event seti tanımlanır. Örnekler: eğitim detail görüntüleme, etkinlik kayıt başlatma, kayıt tamamlama, iletişim formu tamamlama, newsletter aboneliği, katalog indirme, eğitmen/partner başvuru gönderimi.

**Rationale:** Kullanıcı bunu özellikle sordu ve bu soru yanıtlanmadan diğer gereksinimlerin önceliği sürekli tartışmalı kalır. En yüksek kaldıraç, fikirlerin kendisi kadar neyin başarı sayılacağını da standartlaştırmaktır.

**Downsides:** Stakeholder’a görünür bir UI çıktısı üretmez; bu yüzden değeri ilk bakışta daha soyut kalabilir. Ölçüm kararı olmadan instrumentation detayına girilirse erken teknikleşebilir.

**Confidence:** 93%

**Complexity:** Low-Medium

**Status:** Unexplored

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | Site içi arama | Mevcut katalog küçük; daha yüksek getiri önce içerik yapısı ve net navigasyonda. |
| 2 | Ödeme akışı | İş modeli, fiyatlama ve ödeme operatörü tarafı net değil; mevcut stack’te ödeme zemini görünmüyor. |
| 3 | QR kodla anket ve kampanya yönetimi | Değerli olabilir ama önce registration, confirmation ve follow-up temeli oturmalı. |
| 4 | SPL check akışı | Gereksinim anlamsal olarak belirsiz; sorumluca sıralanabilecek kadar net değil. |
| 5 | Basit eğitim kategorilendirmesi | Tek başına değil; daha güçlü olan “İçerik taşıma ve keşif temeli” fikrinin içinde ele alınmalı. |
| 6 | Aylık takvim görünümü | Faydalı, ama bugün için ana girişim değil; içerik/discovery temeli üstüne ikinci faz uzantısı olarak daha doğru. |
| 7 | PDF katalog | Kurumsal satış materyali olarak anlamlı, ancak içerik temeli ve ölçüm olmadan erken optimize edilmiş bir çıktı olur. |
