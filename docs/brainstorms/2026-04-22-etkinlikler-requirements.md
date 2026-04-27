---
date: 2026-04-22
topic: etkinlikler
---

# Etkinlikler

## Problem Frame

Netaş Academy’de etkinlik yüzeyinin ana amacı kayıt toplamak olmalı. Mevcut etkinlik liste sayfası `frontend/src/app/etkinlikler/page.tsx` içinde temel filtre ve sıralama ile çalışıyor; bu işlevsel bir temel sunuyor. Ancak detay sayfası ve kayıt kapandı durumu bu amaca tam hizmet etmiyor: örnek ekranlarda görüldüğü gibi içerik tarafı ikna akışını yeterince iyi kurmuyor, kapanan kayıt durumu kullanıcıyı yeni bir aksiyona bağlamıyor ve detay içerikte ham HTML görünümü gibi güven zedeleyen sunum problemleri var.

Bu yüzey, kullanıcıya önce yaklaşan kayıt fırsatlarını göstermeli, sonra her kart ve detay sayfasında “neden katılmalıyım?” sorusuna cevap vererek kayıt kararını hızlandırmalı. Kayıt kapandığında da kullanıcı boşta bırakılmamalı; gelecekteki etkinlikler için duyuru kanalına yönlenmelidir.

## Requirements

**Liste Sayfası**

- R1. Etkinlik liste sayfasının ilk amacı yaklaşan etkinlikleri görünür kılmak olmalıdır.
- R2. Liste sayfası ilk ekranda kullanıcıya “hangi etkinlikler yaklaşıyor?” sorusunun cevabını net vermelidir.
- R3. Mevcut kart yapısında önce etkinliğin değeri, kazanımı veya konu özeti görünmeli; tarih, saat ve konum bu içeriğin hemen altında yer almalıdır.
- R4. Mevcut kart yapısı genel olarak korunabilir; ancak içerik hiyerarşisi kayıt kararını hızlandıracak biçimde güçlendirilmelidir.
- R5. Liste sayfasındaki etkinlik filtreleme ve sıralama deneyimi kayıt odaklı kullanım senaryosunu bozmadan korunmalıdır.

**Detay Sayfası**

- R6. Etkinlik detay sayfası kullanıcıyı önce konu ve değer önerisi ile ikna etmeli, sonra lojistik bilgileri net göstermeli ve ardından CTA’yı sunmalıdır.
- R7. Detay sayfasındaki ana ikna sırası `konu/değer → lojistik bilgiler → CTA` olmalıdır.
- R8. Etkinlik içeriği kullanıcıya temiz ve okunabilir biçimde sunulmalı; ham HTML veya kırık rich text görünümü oluşmamalıdır.
- R9. Detay sayfası, kullanıcının etkinliğin kendisi için neden değerli olduğunu hızlıca anlayabilmesini sağlamalıdır.

**CTA ve Kayıt Durumu**

- R10. Etkinlik kayıtları açıksa ana CTA `Etkinliğe Kayıt Ol` olmalıdır.
- R11. Etkinlik kayıtları kapandıysa ana CTA `Duyurulardan Haberdar Ol` veya eşdeğer bir duyuru aboneliği çağrısına dönmelidir.
- R12. Kayıt kapandı durumunda kullanıcı yalnızca kapanış mesajı görmemeli; gelecekteki etkinlik kayıtları için iletişim bırakabileceği net bir aksiyona yönlendirilmelidir.
- R13. Kayıt durumu değiştiğinde detay sayfası ve yan bilgi paneli aynı aksiyon mantığını yansıtmalıdır.

**İçerik ve Konumlandırma**

- R14. Etkinlikler yüzeyi topluluk vitrini veya genel marka alanı gibi değil, kayıt odaklı fırsat alanı gibi çalışmalıdır.
- R15. Etkinlik metinleri yalnızca tarihsel bilgi vermemeli; katılım değerini ve konuyu yeterince görünür kılmalıdır.
- R16. Etkinliklerin webinar, seminer veya oturum türüne göre farklılaşan lojistik bilgileri kullanıcıyı yormadan anlaşılır biçimde sunulmalıdır.

## Success Criteria

- Etkinlik liste sayfasında "Etkinliğe Kayıt Ol" CTA tıklama oranı ölçülebilir olmalıdır.
- Etkinlik detay sayfasında kayıt kapalı durumda en az bir aksiyon (duyuru aboneliği veya alternatif yönlendirme) sunulmalıdır.
- Etkinlik detay sayfalarında ham HTML veya kırık rich text render hatası sıfır olmalıdır.
- Etkinlik kartlarında konu/değer bilgisi tarih-saat-konum üstünde render edilmelidir.

## Scope Boundaries

- Bu çalışma ilk aşamada yeni etkinlik takvimi görünümü veya aylık calendar deneyimi tanımlamaz.
- Bu çalışma ödeme akışını kapsamaz.
- Bu çalışma etkinlikleri doğrudan kurumsal eğitim teklif sayfasına çevirmeyi amaçlamaz; ana hedef kayıt toplamaktır.
- Bu çalışma ileri seviye kampanya ve QR anket akışlarını kapsamaz.

## Key Decisions

- Etkinlik yüzeyinin ana amacı kayıt toplamak olarak sabitlendi.
- Liste sayfasında ilk vurgu yaklaşan etkinlikler olacak.
- Kartlarda konu/değer önce, tarih-saat-konum hemen altında gelecek.
- Detay sayfasının ikna sırası `değer → lojistik → CTA` olacak.
- Ana CTA durum bazlı çalışacak: kayıt açıksa `Etkinliğe Kayıt Ol`, kapalıysa `Duyurulardan Haberdar Ol`.
- Kayıt kapandı durumu alternatif etkinliğe değil, duyuru hattına bağlanacak.

## Dependencies / Assumptions

- Duyuru aboneliği veya benzer bir “gelecek etkinliklerden haberdar ol” akışı ürün içinde ayrı bir yüzey olarak desteklenecektir.
- Mevcut rich text içerik sunumu planlama aşamasında temiz ve güvenilir biçimde işlenecek şekilde ele alınacaktır.

## Outstanding Questions

### Deferred to Planning

- [Affects R11][Technical] Kayıt kapandı CTA’sı ayrı bir bülten/duyuru modeli mi kullanmalı, yoksa mevcut iletişim altyapısına mı bağlanmalı?
- [Affects R8][Technical] Etkinlik rich text içeriği güvenli ve doğru görsel sunum için hangi içerik render yaklaşımıyla işlenmeli?
- [Affects R5][Needs research] Mevcut filtre ve sıralama düzeni kayıt odaklı kullanım için yeterli mi, yoksa daha güçlü bir “yaklaşan etkinlik” önceliği gerekecek mi?

## Next Steps

-> /ce-plan for structured implementation planning
