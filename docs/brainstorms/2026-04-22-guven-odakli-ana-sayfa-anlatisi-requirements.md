---
date: 2026-04-22
topic: guven-odakli-ana-sayfa-anlatisi
---

# Güven Odaklı Ana Sayfa Anlatısı

## Problem Frame

Netaş Academy sitesinin ana amacı kurumsal eğitim satmak, ancak mevcut ana sayfa `frontend/src/app/page.tsx` içinde daha çok “portal yönetimi” diliyle açılıyor. Bu dil akademinin kim olduğu, hangi problemi çözdüğü ve kurumlarda nasıl bir sonuç ürettiği konusunda yeterince güçlü bir ilk izlenim oluşturmuyor.

Ana sayfa, özellikle iş birimi ve teknik ekip yöneticilerine ekiplerin dönüşüm ve adaptasyon ihtiyacından giren daha keskin bir anlatıya ihtiyaç duyuyor. Bunun ardından akademinin kimliği ve güven unsurları gelmeli; sonuç ve etki alanı da bu güveni destekleyen üçüncü katman olarak çalışmalı.

## Requirements

**Mesaj Hiyerarşisi**

- R1. Ana sayfa hero mesajı önce `ne çözüyoruz` sorusuna cevap vermelidir.
- R2. Hero sonrası gelen anlatı ikinci katmanda `biz kimiz` güven çerçevesini kurmalıdır.
- R3. Daha aşağıdaki kanıt veya içerik bloklarında `ne sonuç üretiyoruz` katmanı yer almalıdır.

**Hedef Kitle ve Ton**

- R4. Hero dili birincil olarak iş birimi ve teknik ekip yöneticilerine hitap etmelidir.
- R5. Sayfanın geri kalan tonu daha geniş kurumsal karar verici kitlesini dışlamamalı; 
destekleyici bloklarda daha genel kurumsal güven dili kullanılabilmelidir.
- R6. Ana sayfa dili jenerik kurumsal broşür tonu yerine problem-çözüm odaklı ve daha somut olmalıdır.
- R6a. Hero’nun problem çerçevesi ekiplerin dönüşüm ve adaptasyon ihtiyacını öne çıkarmalıdır.

**Kullanıcı Yönlendirmesi**

- R7. Ana sayfa, kullanıcıyı yalnızca “hakkımızda” okumaya değil, kurumsal eğitim talebi ve eğitim keşfi gibi anlamlı sonraki adımlara yönlendirmelidir.
- R8. Ana sayfa üzerindeki güven ve sonuç anlatısı, kurumsal eğitim satışı hedefini desteklemeli; etkinlik, blog ve haberler ana teklifin yerine geçmemelidir.
- R9. Hero’daki birincil CTA `Kurumsal Eğitim Talep Et`, ikincil CTA `Eğitimleri İncele` olmalıdır.

## Success Criteria

- Ana sayfa hero'daki "Kurumsal Eğitim Talep Et" CTA tıklama oranı ölçülebilir olmalıdır.
- Ana sayfa bounce rate'i mevcut değere kıyasla azalmalıdır.
- Ana sayfada hero → güven katmanı → sonuç katmanı sıralaması DOM ve görsel hiyerarşide korunmalıdır.

## Scope Boundaries

- Bu çalışma henüz detaylı görsel tasarım veya bileşen yerleşimini tanımlamaz.
- Bu çalışma eğitim detay sayfaları, etkinlik detay sayfaları veya iletişim formu mimarisini yeniden tanımlamaz.
- Bu çalışma henüz spesifik müşteri vaka metinlerini veya başarı hikayesi içeriklerini yazmaz.

## Key Decisions

- Hero mesajı `biz kimiz` ile değil `ne çözüyoruz` ile başlayacak: kurumsal eğitim alanında bu yaklaşım daha hızlı değer önerisi kuruyor.
- `Biz kimiz` anlatısı kaldırılmayacak; hero sonrasındaki güven katmanına taşınacak.
- `Ne sonuç üretiyoruz` en üst mesaj olmayacak; yeterli kanıt ve bağlamla daha aşağıdaki destekleyici katmanda yer alacak.
- Hedef persona olarak iş birimi ve teknik ekip yöneticileri öne alınacak, ancak sayfanın geri kalan dili daha geniş kurumsal alıcı kitlesine de açık kalacak.
- Hero problem ekseni olarak ekiplerin dönüşüm ve adaptasyon ihtiyacı seçilecek: bu eksen hem teknik ekip yöneticilerine hem daha geniş kurumsal dönüşüm baskısına daha güçlü bağ kuruyor.
- Hero CTA seti `Kurumsal Eğitim Talep Et` + `Eğitimleri İncele` olacak: ana satış hedefi korunurken keşif akışı da açık kalacak.

## Outstanding Questions

### Deferred to Planning

- [Affects R2][Technical] Mevcut `HeroOverlay` ve `VisualStorySection` yapısı bu mesaj hiyerarşisini karşılamak için yeterli mi, yoksa yeni bir ana sayfa düzeni mi gerekecek?
- [Affects R3][Needs research] Sonuç katmanı için vaka formatı, metrik kartı veya kısa başarı hikayesi bloklarından hangisi mevcut içerik hacmine daha uygun?

## Next Steps

-> /ce-plan for structured implementation planning
