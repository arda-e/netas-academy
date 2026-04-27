---
date: 2026-04-27
topic: genel-icerik-taksonomisi
---

# Genel İçerik Taksonomisi

## Problem Frame

Netaş Academy içerik yüzeyleri eğitimler, etkinlikler, blog yazıları ve diğer sayfalar arasında büyüyor. Mevcut keşif deneyimi ise özellikle eğitim tarafında kullanıcının “hangi eğitim bana uygun?” sorusuna yeterince hızlı cevap vermiyor. Küçük katalog için ağır bir tag/metadata sistemi erken editoryal borç yaratır; buna karşılık hiç taksonomi olmaması da eğitim keşfini zayıf bırakır.

Bu çalışma ilk faz için genel içerik taksonomisini eğitim keşfi etrafında sınırlar. Amaç, kullanıcıya eğitimleri ana konu alanına göre daraltma ve kart üstünde uygunluk sinyallerini görme imkanı vermektir. Etkinlikler aynı konu omurgasına bağlanır, ancak ilk fazda etkinlik sayfasına ek filtre yükü getirilmez.

## Requirements

**Taksonominin Rolü**

- R1. Taksonominin ilk fazdaki birincil amacı eğitim keşfini güçlendirmek olmalıdır.
- R2. Taksonomi, kullanıcıya “hangi eğitim bana uygun?” sorusunda hızlı karar desteği vermelidir.
- R3. Taksonomi küçük katalog ve küçük editoryal ekip varsayımıyla dar, yönetilebilir ve düşük bakım yükü taşıyan bir yapıda kalmalıdır.
- R4. İlk faz taksonomi kapsamı eğitimler ve etkinliklerle sınırlı olmalıdır.
- R5. Blog yazıları ilk fazda bu konu filtresi veya eğitim taksonomisi kapsamına alınmamalıdır.

**Konu Alanı Omurgası**

- R6. Ana keşif aksı `Konu Alanı` olmalıdır.
- R7. İlk faz konu alanı seti şu altı ana alandan oluşmalıdır: `Yapay Zeka & Veri`, `Yazılım Geliştirme`, `Bulut & Platform`, `Siber Güvenlik`, `Ürün & Çevik Çalışma`, `Liderlik & Dönüşüm`.
- R8. Her eğitim yalnızca bir ana konu alanına ait olmalıdır.
- R9. Konu alanları ilk fazda alt kategori veya serbest tag sistemiyle genişletilmemelidir.
- R10. Konu alanı isimleri kullanıcıya görünen keşif dili olarak kullanılmalı; yalnızca iç editoryal etiket gibi kalmamalıdır.

**Karar Destek Sinyalleri**

- R11. `Hedef Ekip / Rol` ayrı bir filtre değil, eğitim kartı ve detayında görünen serbest editoryal karar sinyali olmalıdır.
- R12. Hedef ekip/rol metni kullanıcının eğitimin hangi ekipler veya roller için uygun olduğunu hızlıca anlamasını sağlamalıdır.
- R13. `Seviye` basit ve tek seçimli bir karar sinyali olmalıdır.
- R14. İlk faz seviye seti `Başlangıç`, `Orta`, `İleri`, `Yönetici / Liderlik` olarak sabitlenmelidir.
- R15. Seviye ilk fazda filtre olmak zorunda değildir; eğitim kartı ve detayında görünür karar sinyali olarak kullanılmalıdır.

**Sayfa Davranışı**

- R16. `/egitimler` sayfasında ilk faz filtre davranışı yalnızca konu alanı filtresine dayanmalıdır.
- R17. `/egitimler` eğitim kartlarında konu alanına ek olarak seviye ve hedef ekip/rol sinyalleri görünmelidir.
- R18. `/etkinlikler` sayfasında konu alanı ilk fazda yalnızca rozet veya görünür bağlam sinyali olarak yer almalı, filtre davranışı eklenmemelidir.
- R19. `/etkinlikler` için konu alanı filtresi, mevcut etkinlik türü filtresinin yanında ileride değerlendirilebilecek bir gelişim noktası olarak kaydedilmelidir.
- R20. Eğitim ve etkinliklerde konu alanı dili aynı academy konu omurgasını paylaşmalıdır.

## Success Criteria

- `/egitimler` sayfasında kullanıcı konu alanına göre eğitimleri daraltabilmelidir.
- Eğitim kartlarında konu alanı, seviye ve hedef ekip/rol sinyalleri boş olmayan kayıtlarda görünür olmalıdır.
- İlk fazda konu alanı filtresi küçük katalogda gereksiz boş sonuç hissi yaratmayacak kadar sade kalmalıdır.
- `/etkinlikler` kartlarında veya liste öğelerinde konu alanı rozet olarak anlaşılır biçimde görünmelidir.
- İçerik ekibi bir eğitimi tek ana konu alanına yerleştirirken alt kategori veya çoklu tag seçimi yapmak zorunda kalmamalıdır.

## Scope Boundaries

- Bu çalışma ilk fazda blog yazılarını konu alanı filtresine dahil etmez.
- Bu çalışma alt kategori, serbest tag, çoklu konu alanı veya gelişmiş arama sistemi tanımlamaz.
- Bu çalışma seviye filtresini ilk faz zorunluluğu yapmaz.
- Bu çalışma etkinliklerde konu alanı filtresini ilk faz zorunluluğu yapmaz.
- Bu çalışma tam SEO içerik kümeleri, içerik takvimi veya kampanya taksonomisi tanımlamaz.
- Bu çalışma taksonominin teknik veri modeli, migration stratejisi veya admin arayüzü detaylarını kesinleştirmez.

## Key Decisions

- Ana problem eğitim keşfi olarak seçildi: sitenin ana ticari değeri eğitim keşfi ve kurumsal talep akışına bağlandığı için.
- Ana keşif aksı konu alanı olacak: kullanıcı için en anlaşılır ilk daraltma davranışı bu.
- Konu alanı listesi altı ana alanla sınırlı kalacak: editoryal borcu düşük tutarken teknik ve kurumsal eğitim çeşitliliğini taşıyacak kadar geniş.
- Her eğitim tek ana konu alanına sahip olacak: filtre davranışı net kalacak ve içerik ekibi ana raf kararını vermek zorunda olacak.
- Hedef ekip/rol serbest metin kalacak: bu bilgi filtreye göre daha nüanslı ve editoryal karar desteği olarak daha değerli.
- Seviye basit karar sinyali olacak: eğitim seçiminde önemli, ancak küçük katalogda filtreye dönüşmesi ilk faz için gereksiz.
- Etkinlikler konu omurgasını paylaşacak ama ilk fazda yalnızca rozet gösterecek: eğitim yolculuğu bağı korunacak, etkinlik sayfası gereksiz filtre yoğunluğu taşımayacak.

## Alternatives Considered

- Daha geniş 8-10 alanlı teknik konu listesi değerlendirildi; ilk faz için fazla parçalı ve bakım yükü yüksek bulundu.
- İş problemi odaklı kategori seti değerlendirildi; eğitim keşfi için konu alanı kadar doğrudan olmadığı için seçilmedi.
- Çoklu konu alanı değerlendirildi; küçük katalogda dağınıklık ve editoryal kararsızlık yaratacağı için seçilmedi.
- Hedef ekip/rol için sabit liste değerlendirildi; ilk fazda fazla erken yapılandırma ve bakım riski taşıdığı için serbest editoryal metin seçildi.
- `/etkinlikler` için konu filtresi değerlendirildi; ileride veri noktası olarak tutuldu, ilk faz kapsamından çıkarıldı.

## Dependencies / Assumptions

- Eğitim keşfi, kurumsal eğitim talebi akışını destekleyen ana kullanıcı yolculuklarından biri olmaya devam edecektir.
- İçerik hacmi ilk fazda dar taksonomiyle yönetilebilir düzeydedir.
- Etkinlikler eğitim yolculuğundan tamamen bağımsız bir topluluk vitrini değil, eğitim keşfiyle ilişki kurabilen kayıt fırsatları olarak konumlanacaktır.

## Outstanding Questions

### Deferred to Planning

- [Affects R4, R20][Technical] Etkinlik konu alanı doğrudan etkinlik üstünde mi tutulmalı, bağlı eğitimden mi türetilmeli, yoksa hibrit bir model mi kullanılmalı?
- [Affects R16][Design] `/egitimler` konu filtresi mobil ve desktop yüzeylerde hangi kontrol deseniyle sunulmalı?
- [Affects R17][Design] Eğitim kartında seviye ve hedef ekip/rol sinyalleri kaç satır ve hangi öncelikle gösterilmeli?
- [Affects R19][Needs research] `/etkinlikler` konu filtresinin eklenmesi için hangi kullanım sinyali yeterli kabul edilmeli?

## Next Steps

-> /ce-plan for structured implementation planning
