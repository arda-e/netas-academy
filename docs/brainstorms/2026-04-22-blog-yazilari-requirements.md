---
date: 2026-04-22
topic: blog-yazilari
---

# Blog Yazıları

## Problem Frame

Netaş Academy sitesindeki blog yüzeyi şu anda temel bir içerik arşivi gibi çalışıyor: `frontend/src/app/blog-yazilari/page.tsx` listeyi basit başlık ve özet kartlarıyla sunuyor, `frontend/src/app/blog-yazilari/[slug]/page.tsx` ise yazı detayını büyük ölçüde başlık, özet ve richtext içerik olarak gösteriyor. Bu yapı çalışıyor, ancak blog’un kurumsal eğitim satışındaki rolünü yeterince netleştirmiyor ve kullanıcıya içerik keşfi için güçlü bir yüzey sunmuyor.

Bu alanda blog’un birincil işlevi doğrudan satış değil, uzmanlık ve güven göstermek olmalı. İçerik sesi fazla kurumsal ve baskın bir editoryal kalıba girmeden, yazarı düşüncesini rahat ifade edebilen bir alan sunmalı; ancak güven için hafif editoryal çerçeve ve dayanak disiplini korunmalı. Liste görünümü de çıplak kart grid olmaktan çıkıp, başlık temelli arama ve en yeniye göre sıralama ile gerçek bir keşif yüzeyine dönüşmeli.

## Requirements

**Blog’un Rolü**

- R1. Blog yazılarının birincil amacı uzmanlık ve güven göstermek olmalıdır.
- R2. Blog yazıları doğrudan talep yaratma aracı gibi konumlanmamalı; satış yönlendirmesi varsa ikincil katmanda kalmalıdır.
- R3. Yazı türü olarak problem çerçevesi ile uygulama içgörüsünü birleştiren hibrit yapı hedeflenmelidir.

**Yazar ve Editoryal Çerçeve**

- R4. Blog, yalnızca eğitmenlerin değil farklı yazarların da düşüncesini rahat ifade edebileceği bir yayın alanı olmalıdır.
- R5. Yazar sesi korunmalı; içerik tek tip kurumsal metne dönüştürülmemelidir.
- R6. Netaş Academy hafif bir editoryal şemsiye sunmalı, ancak bu şemsiye yazıların sesini invaziv biçimde baskılamamalıdır.
- R7. Referans kullanımı zorunlu olmamalı; ancak veri, iddia, alıntı veya dış kaynağa dayanan çıkarımlarda dayanak gösterimi beklenmelidir.
- R8. Referans verilmeyen yazılar da gözlem, deneyim veya düşünce çerçevesini açıkça taşıyarak “dayanaklı” olmalıdır.

**Yazar Görünürlüğü**

- R9. Blog liste görünümünde yalnızca yazar adı görünmelidir; yazar kartı veya uzun tanıtım kullanılmamalıdır.
- R10. Blog detay sayfasında yazar görünürlüğü daha güçlü olmalı; en azından yazar adı, rolü ve kısa tanıtım alanı bulunabilmelidir.
- R11. Yazar görünürlüğü içerik sahibini görünür kılmalı, ancak yazının önüne geçmemelidir.

**Listeleme ve Keşif Deneyimi**

- R12. Blog liste sayfası çıplak kart grid mantığından çıkıp temel bir keşif yüzeyi gibi çalışmalıdır.
- R13. İlk sürümde blog listesinde arama bulunmalıdır.
- R14. İlk sürüm araması yalnızca yazı başlıklarında çalışmalıdır.
- R15. Blog listesi varsayılan olarak `en yeni` içerikten eskiye doğru sıralanmalıdır.
- R16. Filtreleme ilk sürümün parçası olmayabilir; ancak daha sonra eklenebilecek bir gelişim alanı olarak düşünülmelidir.
- R17. Blog kartları en az başlık, özet, tarih ve yazar adı düzeyinde taranabilir bağlam sunmalıdır.

**Detay Sayfası ve Sonraki Adım**

- R18. Blog detay sayfası içerik merkezli kalmalıdır; yazının sonunda ana aksiyon olarak ilgili diğer yazılar ve içerik keşfi öne çıkmalıdır.
- R19. İlgili eğitimler veya webinar yönlendirmesi ilk sürümde zorunlu olmamalıdır; bu alan ileride geliştirilebilecek bir growth yüzeyi olarak açık bırakılmalıdır.
- R20. Blog detay yüzeyi içerik güvenini güçlendirmek için kaynak, dayanak veya yazar bağlamını uygun düzeyde taşıyabilmelidir.

## Success Criteria

- Blog liste sayfasında başlık araması ile sonuç bulan kullanıcıların ortalama oturum süresi ölçülebilir olmalıdır.
- Blog liste sayfasında arama kullanımı (arama başlatan ziyaretçi oranı) takip edilebilmelidir.
- Blog detay sayfasında ortalama okuma süresi (time-on-page) mevcut arşiv sayfalarına kıyasla artmalıdır.
- Blog detay sayfalarında yazar bilgisi (ad, rol) her yazıda görünür olmalıdır.

## Scope Boundaries

- Bu çalışma ilk sürüm için filtreleme sistemini zorunlu kılmaz.
- Bu çalışma blog üzerinden doğrudan lead scoring veya satış otomasyonu tanımlamaz.
- Bu çalışma henüz ayrıntılı SEO stratejisi veya içerik takvimi kurgusu içermez.
- Bu çalışma blog yazılarını doğrudan eğitim funnel’ına bağlayan agresif CTA yapısını zorunlu kılmaz.

## Key Decisions

- Blog’un birincil rolü güven ve uzmanlık göstermek olacak.
- İçerik yapısı problem çerçevesi + uygulama içgörüsü hibriti olacak.
- Yazar sesi korunacak; editoryal çerçeve hafif ve non-invaziv kalacak.
- Referans zorunlu olmayacak, ama iddia ve veri içeren içerikte dayanak beklenecek.
- Liste görünümünde yazar adı görünecek; detay sayfasında daha güçlü yazar bağlamı yer alacak.
- İlk sürüm keşif omurgası başlıkta arama + en yeni sıralama olacak; filtreleme sonraya bırakılacak.

## Dependencies / Assumptions

- Blog içeriğinde tarih ve yazar bilgisinin kullanıcıya gösterilebilir hale gelmesi için içerik modeli veya fetch yüzeyi planlama aşamasında genişletilecektir.
- Yazar her zaman eğitmen olmak zorunda değildir; blog yapısının bu ayrımı taşıyabileceği varsayılmaktadır.

## Outstanding Questions

### Deferred to Planning

- [Affects R10][Technical] Blog yazarı mevcut teacher modeliyle mi temsil edilmeli, yoksa blog için ayrı bir author modeli mi gerekecek?
- [Affects R17][Technical] Tarih alanı mevcut içerik modeli ve fetch katmanında nasıl taşınmalı?
- [Affects R20][Needs research] Kaynak/dayanak gösterimi detay sayfasında dipnot, kaynak listesi veya daha hafif bir editoryal blok olarak mı sunulmalı?

## Next Steps

-> /ce-plan for structured implementation planning
