---
date: 2026-04-27
topic: bulten-duyuru-aboneligi
---

# Bülten ve Duyuru Aboneliği

## Problem Frame

Netaş Academy sitesinde kullanıcı bugün ya etkinliğe/kursa başvuruyor ya da iletişim formu gönderiyor. Bu iki aksiyon arasında kalan, yani henüz kayıt veya talep bırakmaya hazır olmayan ama yeni eğitim ve etkinliklerden haberdar olmak isteyen kullanıcı için hafif bir yakalama hattı yok.

Bu çalışma, ürünü "kayıt kapalı fallback'i" olarak değil, sade bir Academy bülten ve duyuru aboneliği olarak konumlandırır. İlk sürümün amacı, kullanıcıdan düşük sürtünmeyle e-posta ve açık rıza almak; gönderim, segmentasyon ve pazarlama otomasyonu gibi daha ağır işleri sonraki fazlara bırakmaktır.

## Requirements

**Abonelik Davranışı**

- R1. Kullanıcı tek bir bülten/duyuru listesine abone olabilmelidir.
- R2. İlk sürümde kullanıcıdan yalnızca e-posta adresi ve abonelik/açık rıza onayı istenmelidir.
- R3. Abonelik formu kullanıcıya eğitim, etkinlik ve Academy duyurularından haberdar olma vaadiyle sunulmalıdır.
- R4. Başarılı abonelik sonrası kullanıcı yalnızca ekranda net bir başarı mesajı görmelidir; ilk sürümde otomatik onay e-postası gönderilmemelidir.
- R5. Aynı e-posta adresi tekrar gönderildiğinde kullanıcıya hata hissi verilmemeli; deneyim başarılı veya zaten kayıtlı anlamına gelen sakin bir sonuca bağlanmalıdır.

**Görünürlük ve CTA**

- R6. İlk görünürlük alanları footer, haberler sayfası ve etkinlik detayında kayıt kapalı durum olmalıdır.
- R7. Footer ve haberler sayfasındaki çağrı bülten ürünü gibi davranmalı; yalnızca etkinlik kayıt kapandı mesajına indirgenmemelidir.
- R8. Etkinlik detayında kayıt kapalıysa ana alternatif aksiyon "Duyurulardan Haberdar Ol" veya eşdeğer bir abonelik CTA'sı olmalıdır.
- R9. Kayıt açık olan etkinliklerde ana CTA kayıt olmaya devam etmeli; bülten aboneliği birincil kayıt aksiyonunu gölgelememelidir.

**Operasyon ve Rıza Sınırı**

- R10. İlk sürüm abonelik toplama ve yönetilebilir kayıt oluşturma üzerine kurulmalıdır; bülten gönderim kampanyası yönetimi bu çalışmanın parçası değildir.
- R11. Abonelik kaydı açık rıza verildiğini, kaydın aktif/pasif durumunu ve kaynağını anlamayı mümkün kılmalıdır.
- R12. Kullanıcıya abonelik verisinin hangi amaçla alındığı sade ve anlaşılır Türkçe metinle anlatılmalıdır.
- R13. Açık rıza/KVKK metni final yayın öncesinde hukuki gözden geçirmeye açık bırakılmalıdır.
- R14. Gerçek bülten gönderimi başlamadan önce abonelikten çıkış davranışı ayrıca tanımlanmalıdır.

## Success Criteria

- Footer, haberler sayfası ve kayıt kapalı etkinlik detaylarında kullanıcı bülten aboneliği aksiyonunu görebilir.
- Kullanıcı e-posta ve açık rıza ile abonelik bırakabilir.
- Başarılı gönderim sonrası sayfa kullanıcıyı boşta bırakmadan net başarı durumu gösterir.
- Kayıt kapalı etkinlik detaylarında kullanıcı yalnızca "kayıt kapalı" mesajı ile çıkmaz; bülten aksiyonuna yönlenebilir.
- İlk sürüm, admin veya operasyon ekibinin abonelik kayıtlarını daha sonra değerlendirebilmesine yetecek kayıt bütünlüğünü sağlar.

## Scope Boundaries

- İlk sürümde ilgi alanı/segment seçimi yoktur.
- İlk sürümde otomatik onay e-postası yoktur.
- İlk sürümde çift onaylı abonelik akışı yoktur.
- İlk sürümde bülten gönderim editörü, kampanya planlama, otomatik duyuru gönderimi veya pazarlama otomasyonu yoktur.
- İlk sürümde tercih merkezi veya kullanıcı tarafından yönetilen gelişmiş abonelik ayarları yoktur.
- İlk sürümde kullanıcıya gönderilen bir bülten olmadığı için abonelikten çıkış linki veya tercih merkezi bu çalışmanın parçası değildir; bu ihtiyaç gönderim fazının parçası olarak ele alınacaktır.
- Bu çalışma genel iletişim formunu veya etkinlik kayıt akışını yeniden tasarlamaz.

## Key Decisions

- Ürün adı ve çerçevesi: Bülten ve duyuru aboneliği olarak ele alınacak; yalnızca kayıt kapalı fallback'i olmayacak.
- İlk odak: Eğitim, etkinlik ve Academy duyurularından haberdar olma vaadi.
- Liste yapısı: İlk sürüm tek liste olacak; segmentasyon sonraki faza bırakılacak.
- Başarı davranışı: İlk sürüm sadece ekranda başarı mesajı gösterecek; e-posta gönderimi sonraki faz.
- Görünürlük: Footer, haberler sayfası ve kayıt kapalı etkinlik detayları ilk görünürlük alanları olacak.

## Dependencies / Assumptions

- Mevcut site dili ve navigasyon yapısı Türkçe kalacaktır.
- KVKK ve açık rıza metinleri final yayın öncesinde hukuki içerik kontrolünden geçecektir.
- E-posta gönderim altyapısı bu ilk sürümün zorunlu parçası değildir; abonelik kayıtları sonraki gönderim fazına veri sağlayacaktır.

## Outstanding Questions

### Deferred to Planning

- [Affects R5][Technical] Tekrarlı e-posta gönderimi teknik olarak aynı kaydı mı güncellemeli, yoksa ayrı deneme kaydı mı tutmalı?
- [Affects R6][Design] Footer, haberler sayfası ve etkinlik detayındaki abonelik formu aynı kompakt bileşeni mi kullanmalı, yoksa bağlama göre farklı sunumlar mı olmalı?
- [Affects R11][Technical] Abonelik kaynağı hangi seviyede tutulmalı: yalnızca genel sayfa kaynağı mı, yoksa etkinlik detayında ilgili etkinlik bağlamı da mı?

## Next Steps

-> /ce-plan for structured implementation planning
