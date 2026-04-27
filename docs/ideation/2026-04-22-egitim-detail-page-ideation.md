---
date: 2026-04-22
topic: egitim-detail-page
---

# Eğitim Detay Sayfası Ideation

## Repo Bağlamı

Mevcut eğitim detay sayfası:

- `frontend/src/app/egitimler/[slug]/page.tsx`
- `frontend/src/components/content/content-detail-shell.tsx`
- `frontend/src/components/content/courses.tsx`

Bugünkü veri sınırı:

- `title`
- `summary`
- `description`
- `coverImage`
- `teacher`
- `events`

Bu yüzden sayfa şu an daha çok "açıklama okuma yüzeyi" gibi çalışıyor. Kurumsal karar veren bir ziyaretçi için hızlı yanıtlanması gereken sorular zayıf:

- Bu eğitim bizim ekip için uygun mu?
- Hangi çıktıyı hedefliyor?
- Nasıl bir teslim biçimi var?
- Sonraki adım ne?

## Candidate List

### 1. Yukarıda karar özeti bloğu
**Description:** Başlığın hemen altında veya içerik panelinin üst kısmında kısa bir karar özeti bloğu eklenir. Bu blok `hedef kitle`, `teslim formatı`, `öne çıkan kazanımlar` gibi 3-4 kısa satır taşır.

**Rationale:** Sayfanın ana boşluğu "okuma" ile "karar verme" arasındaki mesafe. Kısa karar bloğu bunu en hızlı kapatan çözüm.

**Downsides:** Yeni veri alanları gerektirir. Veriler boş kalırsa yüzey yarım görünür.

**Complexity:** Medium

**Status:** Strong candidate

### 2. Eğitmen güven bloğu
**Description:** Eğitmen linkini tek satırlık meta olmaktan çıkarıp küçük bir güven bloğuna dönüştürmek. Eğitmen adı, headline, kısa bio özeti ve eğitmen profil linki birlikte sunulur.

**Rationale:** Mevcut veri modeli eğitmeni yalnızca link olarak değil, güven katmanı olarak da göstermeye zaten uygun.

**Downsides:** Çok büyütülürse sayfanın ana odağını eğitimden eğitmene kaydırabilir.

**Complexity:** Low

**Status:** Strong candidate

### 3. Kurumsal talep CTA rayı
**Description:** Detay sayfasına sabit bir kurumsal CTA alanı eklemek. Amaç fiyat/ödeme değil; "kurumunuz için bilgi alın" veya "kurumsal eğitim talebi oluşturun" çizgisinde net bir sonraki adım vermek.

**Rationale:** Eğitim detay sayfası kurumsal satış hunisinin önemli bir orta katmanı. Sonraki aksiyonu görünür kılmak doğrudan conversion etkisi yaratır.

**Downsides:** Lead akışı henüz uygulanmadan çok güçlü CTA konursa promise büyük, deneyim zayıf kalabilir.

**Complexity:** Low-Medium

**Status:** Strong candidate

### 4. İlişkili etkinlikler / öğrenme devamı bloğu
**Description:** Course ile bağlı `events` ilişkisini detay sayfasında görünür yapmak. Kullanıcı eğitimin canlı oturumu, kickoff’u veya ilişkili etkinlikleri varsa onları görebilir.

**Rationale:** Veri modelinde `events` zaten var. Eğitim sadece tek metin parçası olmaktan çıkar, öğrenme akışının parçası olur.

**Downsides:** Bazı kurslarda etkinlik yoksa boş durum iyi ele alınmalı.

**Complexity:** Low-Medium

**Status:** Strong candidate

### 5. Uzun içerik yerine yapılandırılmış içerik bölgeleri
**Description:** `description` tek prose bloğu olarak akmak yerine sayfa "genel bakış", "öğrenme yaklaşımı", "kimler için", "sonraki adım" gibi bölgeler halinde kurgulanır.

**Rationale:** Sayfa bilgi mimarisini güçlendirir. Ancak gerçek verisel ayrım yoksa bu sadece aynı metni farklı kutulara bölmek olur.

**Downsides:** Uygun content model olmadan yapay bir düzenleme riski taşır.

**Complexity:** Medium

**Status:** Considered

### 6. Büyük görsel story katmanını koruyup daha editoryal hale getirme
**Description:** Alttaki `VisualStorySection` zenginleştirilir, sayfa daha dergisel bir hava kazanır.

**Rationale:** Görsel kaliteyi yükseltir, atmosfer katar.

**Downsides:** Asıl karar problemi çözülmeyebilir. Estetik güçlenir ama conversion yüzeyi aynı kalabilir.

**Complexity:** Low

**Status:** Considered

### 7. Müfredat / süre / seviye / sertifika gibi ağır katalog paketi
**Description:** Sayfayı daha klasik LMS veya eğitim kataloğu gibi geniş metadata ile doldurmak.

**Rationale:** Bazı kullanıcılar için yararlı olabilir.

**Downsides:** Bu repo ve ekip boyutu için erken ağırlaşma olur. Veri modeli ve editoryal bakım maliyeti yükselir.

**Complexity:** High

**Status:** Not recommended

## Kalanlar

### A. Karar özeti bloğu
**Neden kaldı:** Eğitim detay sayfasının ana yapısal boşluğunu en doğrudan kapatıyor. Sayfayı okuma yüzeyinden karar yüzeyine taşıyan en güçlü aday.

### B. Eğitmen güven bloğu
**Neden kaldı:** Yeni veri modeli gerektirmeden değeri artırıyor. Mevcut `teacher` ilişkisini daha iyi kullanıyor.

### C. Kurumsal talep CTA rayı
**Neden kaldı:** Bu sayfayı yeni lead akışına bağlamanın en doğal girişi. Erken bile eklense kullanıcıyı boşta bırakmaz.

### D. İlişkili etkinlikler bloğu
**Neden kaldı:** Mevcut `events` ilişkisini görünür hale getirerek eğitim deneyimini daha akışkan yapar. Aynı zamanda değer önerisini güçlendirir.

## Elenenler

### 1. Ağır katalog metadata paketi
**Neden elendi:** Şu an için fazla büyük. Süre, seviye, sertifika, geniş müfredat ve benzeri alanlar editoryal taşıma maliyetini gereksiz yükseltir.

### 2. Sadece görsel katmanı büyütmek
**Neden elendi:** Görsel kalite artar ama asıl karar boşluğu kapanmaz. Bu sayfa öncelikle daha iyi düşünülmüş bir karar yüzeyi olmalı.

### 3. Yapay section parçalama
**Neden elendi:** Content model desteklemeden yalnızca `description` metnini farklı kutulara bölmek sahte yapı hissi verebilir.

## Öneri

En doğru ilk paket:

1. Eğitmen güven bloğu
2. Kurumsal talep CTA rayı
3. İlişkili etkinlikler bloğu
4. Sonraki fazda karar özeti bloğu

Bu sıralama bilinçli:

- İlk üçü mevcut veri modeliyle büyük oranda yapılabilir.
- `Karar özeti bloğu` ise daha kalıcı ve daha güçlü bir çözüm olduğu için, `course` schema extension ile birlikte ele alınmalıdır.

## Karar Notu

Eğitim detay sayfası için doğru yaklaşım iki fazlıdır:

### Faz 1

Mevcut veriyle güçlendirme:

- eğitmen güven bloğu
- kurumsal CTA
- ilişkili etkinlikler

### Faz 2

Yeni course alanlarıyla karar yüzeyi:

- `targetAudience`
- `keyOutcomes`
- `deliveryFormat`

Bu ayrım, yüzeyi hemen iyileştirirken yanlış yere erken schema yükü bindirmemeyi sağlar.
