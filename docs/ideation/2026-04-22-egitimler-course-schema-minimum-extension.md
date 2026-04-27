---
date: 2026-04-22
topic: egitimler-course-schema-minimum-extension
---

# `/egitimler` İçin Minimum Course Schema Extension Ideation

## Bağlam

Mevcut `course` modeli şu alanlarla sınırlı:

- `title`
- `slug`
- `summary`
- `description`
- `coverImage`
- `teacher`
- `events`

Kaynaklar:

- `backend/src/api/course/content-types/course/schema.json`
- `frontend/src/lib/strapi.ts`
- `frontend/src/app/egitimler/page.tsx`
- `frontend/src/app/egitimler/[slug]/page.tsx`

Bu yapı temel listeleme ve detay sayfası için yeterli, ancak `/egitimler` yüzeyini daha karar verdiren bir katalog haline getirmek için zayıf kalıyor. Özellikle şu sorular veri modeli tarafından doğrudan cevaplanamıyor:

- Bu eğitim kim için?
- Kuruma hangi çıktıyı sağlar?
- Hangi formatta sunulur?
- Diğer eğitimlerden neden ayrışır?

Amaç, bu yüzeyi güçlendirmek için en küçük anlamlı alan setini bulmak; erken aşamada ağır katalog, filter sistemi veya editoryal bakım yükü üretmemek.

## Candidate List

### 1. Yalnızca `targetAudience`
**Description:** Her kursa tek bir serbest metin `targetAudience` alanı eklenir. Kartta ve detay sayfasında “kim için” sinyali görünür hale gelir.

**Artıları:** En düşük editoryal maliyet. Kartların bilgi kokusunu hemen iyileştirir.

**Eksileri:** Tek başına yeterince karar verdirmez. “Ne kazandırır?” sorusunu yanıtsız bırakır.

**Complexity:** Low

**Status:** Considered

### 2. `targetAudience` + `keyOutcomes`
**Description:** Her kurs için bir `targetAudience` alanı ve kısa maddelerden oluşan `keyOutcomes` alanı eklenir. Liste kartında hedef kitle, detay sayfasında 2-4 kısa kazanım gösterilir.

**Artıları:** En düşük anlamlı karar setini verir. Kart ve detail arasında doğal bilgi hiyerarşisi kurar.

**Eksileri:** Format veya teslim şekli görünmez kalır. Bazı programlar hâlâ birbirine benzer hissedebilir.

**Complexity:** Low-Medium

**Status:** Strong candidate

### 3. `targetAudience` + `keyOutcomes` + `deliveryFormat`
**Description:** `targetAudience` ve `keyOutcomes` yanında kapalı kümeli bir `deliveryFormat` alanı eklenir. Örnek değerler: `onsite`, `online_live`, `hybrid`, `workshop`.

**Artıları:** Kurumsal satın alma açısından güçlü ilk karar setini verir. Eğitimleri yalnızca konu değil, teslim biçimi ile de ayırt eder.

**Eksileri:** Format enum’unun erken yanlış tasarlanması editoryal sürtünme yaratabilir. Yine de yönetilebilir bir risk.

**Complexity:** Medium

**Status:** Recommended

### 4. Tam katalog metadata paketi
**Description:** `targetAudience`, `keyOutcomes`, `deliveryFormat`, `duration`, `level`, `topicTags`, `corporateFitNote`, `ctaLabel` gibi geniş bir alan seti eklenir.

**Artıları:** Eğitim sayfalarını daha olgun bir katalog deneyimine taşır. Gelecekte filtreleme ve farklı landing varyasyonları için zemin verir.

**Eksileri:** İlk faz için fazla yük getirir. Editoryal maliyet artar ve demo içeriklerin yeniden işlenmesi gerekir.

**Complexity:** High

**Status:** Not recommended for now

### 5. Hiç schema değiştirmeden sadece presentational iyileştirme
**Description:** Sadece frontend copy, layout ve CTA düzeni iyileştirilir; backend modeline dokunulmaz.

**Artıları:** En hızlı teslim edilir. Teknik risk en düşüktür.

**Eksileri:** Karar verdirici katalog hedefini sınırlı ölçüde karşılar. Yüzey iyileşir ama veri kokusu aynı kalır.

**Complexity:** Low

**Status:** Already useful, but insufficient alone

## Kalanlar

### A. `targetAudience` + `keyOutcomes`
**Neden kaldı:** En düşük anlamlı genişletme. Kart ve detay sayfası birlikte daha ikna edici olur. Editoryal yük hâlâ yönetilebilir düzeyde kalır.

### B. `targetAudience` + `keyOutcomes` + `deliveryFormat`
**Neden kaldı:** Kurumsal karar açısından en dengeli set. Hem “kim için” hem “ne kazandırır” hem “nasıl sunulur” sorularını cevaplar.

### C. Şimdilik presentational, schema sonra
**Neden kaldı:** En düşük riskli geçiş yolu. Eğer içerik ekibi henüz yeni alanları doldurmaya hazır değilse ara faz olarak anlamlı olabilir.

## Elenenler

### 1. Tam katalog metadata paketi
**Neden elendi:** İlk faz için fazla ağır. Bu repo ve ekip boyutu için erken editoryal borç üretir.

### 2. Sadece `targetAudience`
**Neden elendi:** Yeterince ayırt edici değil. “Kim için” var ama “neden seçilir” ve “nasıl sunulur” tarafı zayıf kalır.

## Öneri

En doğru yön:

`targetAudience` + `keyOutcomes` + `deliveryFormat`

Bu set, minimum anlamlı genişletme eşiğini karşılıyor:

- Kart düzeyinde daha iyi bilgi kokusu
- Detay sayfasında daha ikna edici karar yüzeyi
- Kurumsal lead akışına bağlanırken daha güçlü bağlam
- Gelecekte filtreleme ve katalog iyileştirmeleri için sade bir temel

## Önerilen Alan Şekli

### `targetAudience`

- tip: `text`
- neden: serbest ama kısa hedef kitle anlatımı gerekir

### `keyOutcomes`

- tip: `json`
- neden: detay sayfasında 2-4 madde halinde gösterilebilecek kısa kazanımlar gerekir
- Strapi admin'de JSON string array olarak düzenlenir; frontend `coerceStringList` ile güvenli okur

### `deliveryFormat`

- tip: `enumeration`
- önerilen ilk set:
  - `onsite`
  - `online_live`
  - `hybrid`
  - `workshop`
- Türkçe etiket eşleştirmesi frontend'de sabitlenir:
  - `onsite` → "Yüz Yüze"
  - `online_live` → "Canlı Online"
  - `hybrid` → "Hibrit"
  - `workshop` → "Atölye"
- Türkçe etiket eşleştirmesi frontend'de sabitlenir:
  - `onsite` → "Yüz Yüze"
  - `online_live` → "Canlı Online"
  - `hybrid` → "Hibrit"
  - `workshop` → "Atölye"

## Uygulama Etkisi

Bu karar alınırsa sonraki teknik iş paketi şunları içerir:

1. `backend/src/api/course/content-types/course/schema.json` alan genişletmesi
2. `backend/scripts/seed-demo.js` içeriğinin yeni alanlarla güncellenmesi
3. `frontend/src/lib/strapi.ts` fetch contract güncellemesi
4. `frontend/src/app/egitimler/page.tsx` kart yüzeyi iyileştirmesi
5. `frontend/src/app/egitimler/[slug]/page.tsx` karar destek blokları

## Karar Notu

Bu yüzey için doğru yaklaşım:

- önce minimum course schema extension
- sonra teknik uygulama
- ardından yeni lead akışına bağlama

Doğrudan lead entegrasyonuna gitmek yerine önce eğitim sayfasının karar verdirici niteliğini artırmak daha yüksek kaldıraç sağlar.
