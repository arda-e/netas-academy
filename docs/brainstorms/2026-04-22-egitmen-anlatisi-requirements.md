---
date: 2026-04-22
topic: egitmen-anlatisi
---

# Eğitmen Anlatısı

## Problem Frame

Kurumsal eğitim satışında eğitmenler yalnızca bireysel profil değil, aynı zamanda güven ve uygunluk kanıtıdır. Mevcut yapı ise eğitmenleri büyük ölçüde klasik profil mantığıyla gösteriyor: mevcut veri modeli `backend/src/api/teacher/content-types/teacher/schema.json` içinde ağırlıklı olarak `fullName`, `headline`, `bio`, `email` ve `profilePhoto` alanlarına dayanıyor; mevcut detay sayfası `frontend/src/app/egitmenler/[slug]/page.tsx` içinde fotoğraf, isim, kısa başlık, biyografi ve ilgili eğitim listesi ile açılıyor.

Bu yapı “kimdir?” sorusunu kısmen yanıtlıyor ama kurumsal alıcının asıl soruları olan “hangi alanda güçlü?”, “bizim ekip için uygun mu?”, “hangi seviyeye hitap ediyor?” ve “nasıl eğitim verir?” sorularını yeterince hızlı cevaplamıyor. Eğitmen anlatısının daha çok güven kuran ve ardından doğru ekip/eğitim ihtiyacına eşleşen bir yapıya dönüşmesi gerekiyor.

## Requirements

**Rol ve Mesaj Çerçevesi**

- R1. Eğitmen anlatısının birincil amacı önce güven kurmak, ardından uygun ekip ve ihtiyaç eşleşmesini göstermek olmalıdır.
- R2. Eğitmenler CV veya uzun biyografi merkezli değil, uzmanlık ve öğretme kapasitesi merkezli anlatılmalıdır.
- R3. Eğitmen yüzeyleri, “bu kişi çok iyi” demekten çok “şu ihtiyaç için doğru kişi” hissi vermelidir.

**Liste ve Kart Deneyimi**

- R4. Eğitmen kartlarında en görünür bilgi olarak eğitmenin uzmanlık alanı yer almalıdır.
- R5. Uzmanlık alanının hemen yanında veya hemen altında eğitmenin hangi ekipler ve hangi seviye için uygun olduğu görünmelidir.
- R6. Eğitmen kartları yalnızca isim ve “profili görüntüle” düzeyinde kalmamalı; alıcıya hızlı karar desteği sağlayacak yeterli bağlam sunmalıdır.
- R7. Liste veya carousel yüzeyleri, eğitmenleri academy güven kanıtı olarak göstermeli; ancak kullanıcıyı detay sayfasına geçmeye teşvik edecek kadar seçici bilgi sunmalıdır.

**Detay Sayfası Hiyerarşisi**

- R8. Eğitmen detay sayfasının üst bölümü şu sırayla ilerlemelidir: uzmanlık alanı, uygun ekip/seviye, eğitim yaklaşımı, ilgili eğitimler, biyografi.
- R9. Uzun biyografi detay sayfasında korunabilir, ancak ilk görünür karar alanının merkezinde yer almamalıdır.
- R10. Eğitmen detayı, kullanıcının bu eğitmenin hangi ekip veya dönüşüm ihtiyacı için uygun olduğunu hızlıca anlayabilmesini sağlamalıdır.
- R11. Eğitim yaklaşımı alanı, eğitmenin nasıl anlattığını ve hangi öğrenme biçimine uygun olduğunu açık biçimde göstermelidir.
- R12. İlgili eğitimler bölümü detay sayfasında erken görünmeli ve eğitmen anlatısını doğrudan eğitim teklifine bağlamalıdır.

**İçerik ve Ton**

- R13. Eğitmen anlatımında soyut övgü dili azaltılmalı; somut uzmanlık, uygun ekip tipi ve öğretme yaklaşımı öne çıkarılmalıdır.
- R14. Akademik özgeçmiş, genel kariyer özeti veya uzun serbest biyografi, karar verdiren ana içerik değil destekleyici içerik olarak konumlanmalıdır.
- R15. Eğitmen anlatısı academy’nin genel öğrenme yaklaşımı ile bağ kurmalı; bireysel yıldız profili değil, güçlü uzman ağı hissi vermelidir.

## Success Criteria

- Eğitmen kartında uzmanlık alanı ve uygun ekip/seviye bilgisi boş olmayan kayıtlarda ilk 2 satırda görünür olmalıdır.
- Eğitmen detay sayfasında "İlgili Eğitimler" bölümü görünen kayıtlarda ilgili eğitim CTA tıklama oranı ölçülebilir olmalıdır.
- Eğitmen detay sayfasında uzmanlık, uygun ekip/seviye ve eğitim yaklaşımı bilgileri biyografi üstünde render edilmelidir.
- Eğitmen kartları boş uzmanlık alanı durumunda eğitmen adı ve headline ile geriye düşmelidir.

## Scope Boundaries

- Bu çalışma eğitmenlere özel ayrı bir satış süreci veya başvuru akışı tanımlamaz.
- Bu çalışma eğitmen değerlendirme, puanlama veya kullanıcı yorum sistemi içermez.
- Bu çalışma henüz tam alan isimlerini veya veri şemasını teknik seviyede kesinleştirmez.
- Bu çalışma yeni bir eğitmen listeleme sayfası açılmasını zorunlu kılmaz; mevcut yüzeyler üstünden anlatı hiyerarşisini tanımlar.

## Key Decisions

- Eğitmen anlatısı hibrit modelde olacak: önce güven, sonra eşleşme.
- Eğitmen kartlarında ana bilgi `uzmanlık alanı`, ikinci ana bilgi `uygun ekip / seviye` olacak.
- Detay sayfasında uzun biyografi aşağı itilecek; üst bölüm karar destekleyen içerikten oluşacak.
- Eğitmen detayı yalnızca kişiyi anlatmayacak, ilgili eğitim teklifine köprü kuracak.

## Dependencies / Assumptions

- Mevcut teacher modeline uzmanlık alanı, uygun ekip/seviye ve eğitim yaklaşımı benzeri daha yapılandırılmış içerikler eklenmesi gerekeceği varsayılmaktadır.
- Eğitim içerikleri ile eğitmen eşleşmesi mevcut ilişki üzerinden korunabilir.

## Outstanding Questions

### Deferred to Planning

- [Affects R4][Technical] Uzmanlık alanı ve uygun ekip/seviye alanları serbest metin mi, çoklu seçim mi, yoksa yapılandırılmış taxonomi mi olmalı?
- [Affects R11][Technical] Eğitim yaklaşımı tek kısa alan mı, etiket seti mi, yoksa daha uzun editoryal blok mu olmalı?
- [Affects R6][Needs research] Carousel ve diğer küçük kart yüzeylerinde kaç satır bilgi gösterimi en iyi dengeyi sağlar?

## Next Steps

-> /ce-plan for structured implementation planning
