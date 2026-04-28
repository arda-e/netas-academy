---
date: 2026-04-27
topic: egitimler-capability-catalog
---

# Eğitimler Capability Catalog

## Problem Frame

Netaş Academy için eğitimler yüzeyi yalnızca bir ders veya program listesi değil, kurumların hangi dönüşüm ihtiyaçlarına hangi capability’lerle cevap verilebileceğini gösteren ana teklif yüzeyidir. Mevcut yapı içerik olarak liste ve detay sayfaları sunsa da, ürün dili açısından eğitimlerin bir `capability catalog` olduğu henüz açık biçimde tanımlanmış değil.

Etkinlikler ise çoğu durumda bu capability’lerin canlı veya zamanlanmış instance’ları gibi çalışır; ancak her etkinlik mutlaka bir eğitim instance’ı değildir. Bu nedenle eğitimler ana katalog, etkinlikler ise çoğu zaman aktivasyon ve temas yüzeyi olarak ayrıştırılmalıdır. Eğitimler sayfası kullanıcıya önce hangi dönüşüm ihtiyaçlarına cevap verildiğini anlatmalı, sonra bu alanları yetkinlik başlıkları üzerinden taratmalı ve detay sayfasında kuruma üretilen değeri net göstermelidir.

## Requirements

**Katalog Konumlandırması**

- R1. `Eğitimler` sayfası bir capability catalog olarak konumlanmalıdır.
- R2. Sayfanın ilk mesajı kullanıcıya hangi dönüşüm ihtiyaçlarına cevap verildiğini anlatmalıdır.
- R3. Eğitimler sayfası konu listesi gibi değil, kurumsal ihtiyaçlara karşılık veren çözüm alanları gibi okunmalıdır.

**Liste Sayfası**

- R4. Liste sayfası ana gezinme omurgası olarak yetkinlik alanlarını kullanmalıdır.
- R5. Eğitim kartlarında başlıktan sonra en görünür bilgi, eğitimin hangi problemi veya dönüşüm ihtiyacını çözdüğü olmalıdır.
- R6. Hedef ekip veya seviye gibi bilgiler ikincil bağlam olarak sunulabilir, ancak ana problem anlatısının önüne geçmemelidir.
- R7. İlk sürümde eğitimler sayfasında metin bazlı arama bulunmalıdır.
- R8. Arama en azından eğitim başlıklarında keyword bazlı çalışmalıdır; mümkünse full-text arama da desteklenmelidir.
- R9. Liste sayfası, kullanıcıya hem capability’leri keşfetme hem de detay sayfasına geçiş için yeterli bağlam sunmalıdır.

**Detay Sayfası**

- R10. Eğitim detay sayfası öncelikle bu capability’nin kuruma nasıl değer ürettiğini anlatmalıdır.
- R11. Değer anlatısından sonra eğitimin kapsamı, içeriği veya modül yapısı sunulmalıdır.
- R12. İlgili etkinlikler, workshoplar veya canlı oturumlar detay sayfasında üçüncü katman olarak yer almalıdır.
- R13. Eğitim detay sayfasındaki ana CTA `Kurumsal Eğitim Talep Et` olmalıdır.

**Eğitim ve Etkinlik İlişkisi**

- R14. Eğitim detay sayfasında `ilgili etkinlikler` veya `yaklaşan oturumlar` bölümü bulunmalıdır.
- R15. Etkinlik detay sayfasında, etkinlik bir capability’ye bağlıysa bunun hangi eğitim alanına ait olduğu kullanıcıya gösterilmelidir.
- R16. Sistem, çoğu etkinliğin bir eğitim capability’sinin instance’ı gibi çalışabildiğini göstermeli; ancak bağımsız etkinlikleri de desteklemelidir.

## Success Criteria

- Kullanıcı eğitimler sayfasına geldiğinde hangi dönüşüm ihtiyaçlarına cevap verildiğini hızlıca anlayabilir.
- Capability katalogu, başlıkları yalnızca konu adı olarak değil, kurumsal problem çözme alanları olarak gösterir.
- Eğitim kartları problem/dönüşüm odağıyla karar desteği sağlar.
- Eğitim detay sayfası kullanıcıya önce kurumsal değeri, sonra kapsamı anlatır.
- Eğitim ve etkinlik arasındaki ilişki iki yönde de görünür olur.
- Eğitim detayından ana satış aksiyonu olarak `Kurumsal Eğitim Talep Et` akışı net biçimde desteklenir.

## Scope Boundaries

- Bu çalışma ilk sürümde çok katmanlı filtreleme deneyimini zorunlu kılmaz.
- Bu çalışma etkinlikleri eğitimlerin altına tamamen kapatan bir model önermez; bağımsız etkinlikler korunur.
- Bu çalışma ödeme veya satın alma akışını kapsamaz.

## Key Decisions

- Eğitimler capability catalog olarak tanımlandı.
- İlk mesaj dönüşüm ihtiyacına odaklanacak.
- Liste omurgası yetkinlik alanı olacak.
- Kartlarda başlıktan sonra problem/dönüşüm ihtiyacı öne çıkacak.
- İlk sürümde kategori filtresi yerine metin bazlı arama tercih edilecek.
- Eğitim detayında öncelik `değer → kapsam → ilgili etkinlikler`.
- Ana CTA `Kurumsal Eğitim Talep Et`.
- Eğitim ve etkinlik ilişkisi iki yönde de görünür olacak.
- Arama en azından başlıkta keyword bazlı çalışacak; mümkünse full-text arama yönü korunacak.

## Dependencies / Assumptions

- Eğitim içeriklerinin capability diliyle ifade edilebilmesi için içerik alanları ve editoryal yapı planlama aşamasında netleştirilecektir.
- Etkinliklerin eğitim capability’leriyle ilişkisini taşıyacak veri ve sunum katmanı mevcut ilişki yapısı üzerinden genişletilebilir.

## Outstanding Questions

### Deferred to Planning

- [Affects R7][Technical] Metin bazlı arama ilk sürümde yalnızca başlıkta mı çalışmalı, yoksa mevcut veri hacmi ve performans izin veriyorsa full-text arama nasıl devreye alınmalı?
- [Affects R10][Needs research] Değer anlatısı hangi içerik formatıyla en iyi taşınır: kısa outcome blokları, use-case bölümü, vaka benzeri özetler veya karma model?
- [Affects R15][Technical] Etkinlik detayında capability ilişkisi ne kadar görünür olmalı; breadcrumb, badge, yan panel veya içerik bloğu olarak mı sunulmalı?

## Next Steps

-> /ce-plan for structured implementation planning
