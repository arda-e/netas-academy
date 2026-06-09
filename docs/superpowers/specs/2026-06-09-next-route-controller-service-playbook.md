---
date: 2026-06-09
topic: next-route-controller-service-playbook
---

# Next Route Controller-Service Playbook

## Purpose

Bu rehber, bir content read akisini Next.js tarafinda controller/service ayrimina tasimak icin tekrar edilebilir bir yol tarif eder.

Bu pattern:

- HTTP consumerlar icin bir route handler kullanir
- route handler controller gibi davranir
- Strapi query construction service katmaninda kalir
- server-rendered page ayni server process icinde servicei dogrudan kullanir
- user-facing fallback controller veya page boundary tarafinda kalir

## When To Use

Asagidaki durumlarda bu playbooku uygula:

- bir read helper Strapi URLini dogrudan page icinde kuruyorsa
- route-level public contract ile data-access concerns birbirine karisiyorsa
- ayni modeli baska route'lara da kopyalamak istiyorsan

## Target Split

1. **Page / consumer**
   - server-rendered ise servicei dogrudan cagirir
   - client/browser consumer ise API routeu cagirir
   - UI mapping yapar
   - request origin veya internal route URLi kurmaz

2. **Route handler**
   - HTTP query paramlarini okur
   - normalize eder
   - servicee iletir
   - hata durumunda empty list gibi user-facing fallback dondurur

3. **Service**
   - Strapi URLini kurar
   - `fetchStrapi` cagirir
   - pagination/sort/fields/populate kararlarini sahiplenir
   - network veya JSON parse detaylarini tekrar etmez

## Step By Step

### 1) Existing read pathi belirle

Ilk olarak hangi read akisini ayiracagini sec.

Iyi ilk adaylar:

- list reads
- visible catalog pages
- sayfa icin kritik ama basit fetchler

Sakin kalinmasi gerekenler:

- detail + relation-heavy paths
- mutation flows
- ayni anda birden fazla consumer olan helperlar

### 2) Servicei ayir

Strapi query construction kodunu page/helper icinden al ve tek bir service dosyasina tasimak.

Service su isleri yapmali:

- default pagination belirlemek
- default sort belirlemek
- fields ve populate setini sabit tutmak
- `fetchStrapi` ile Strapiyi cagirmak

Service su seyleri yapmamali:

- request origin hesaplamak
- route URLi kurmak
- page-specific fallback kararini vermek

### 3) Route handleri controller olarak yaz

Route file icinde tek HTTP method export et.

Kurallar:

- ikinci bir `GET` export etme
- branching gerekiyorsa ayni `GET` icinde yap
- query paramlari temizle
- servicee sade query object gec
- hata durumunda controller seviyesinde fallback ver

Ornek:

- `page` ve `pageSize` icin sadece pozitif integer kabul et
- `pageSize` icin makul bir maksimum uygula
- `sort` icin trim + direction allowlist uygula (`asc` / `desc`)

### 4) Page tarafini servicee bagla

Server-rendered page, artik eski Strapi helpera veya internal API route self-fetchine baglanmak yerine servicei dogrudan cagirir.

Bu noktada:

- page internal HTTP self-fetch yapmaz
- request originini `headers()` uzerinden hesaplamaz
- UI mapping page tarafinda kalir

Client/browser consumer gerekiyorsa ayni servicein arkasindaki route handleri cagirir.

Not:

- `NEXT_PUBLIC_SITE_URL` fallbacki page fetch icin tercih etme
- server-rendered page icin internal API route self-fetch tercih etme

### 5) Fallbacki boundaryde tut

HTTP response degrade behavior controller tarafinda kalsin. Server-rendered page de kendi UI fallbackini sahiplenebilir, ancak service fallback kararini sahiplenmez.

List route icin tipik fallback:

- hata aninda `[]` dondur
- fallback response icin `Cache-Control: no-store` uygula
- page crash etmesin
- console logta route/context bilgisi tut

Service tarafinda ise:

- Strapi fetch hatasini yukari atabilir
- veya sadece veri dondurebilir

Ama fallback kararini route veya page boundary sahiplenmeli.

### 6) Query inputlarini normalize et

Ozellikle su inputlar kontrollu olmalidir:

- `page`
- `pageSize`
- `sort`

Kurallar:

- bos veya gecersiz `page/pageSize` -> yok say
- `page/pageSize/sort` -> `PaginationParamsDTO` ile parse et
- `pageSize` -> makul maksimuma clamp et
- bos `sort` -> default sort kullan
- `sort` -> public queryde sadece direction allowlist uygula (`asc` / `desc`)
- query stringten gelen degerleri trim et

Bu, Strapi tarafina `sort[0]=` gibi broken query gitmesini engeller.

### 7) Cache/tag davranisini koru

Route/service ayrilirken cache mantigi bozulmamalidir.

Kontrol et:

- route responseu ayni tagi kullanmali
- service fetchi ayni cache semantisini korumali
- consumer tarafinda yeni bir cache assumption eklenmemeli
- server-rendered page internal route self-fetch ile `headers()` dependency yaratmamali
- controller fallbacki cachelenip kalici bos listeye donusmemeli

### 8) Consumer mappingi ayri tut

Service ve route JSON responseu genelde Strapi shapeine yakin kalir.

**Tercih edilen yaklasim:** component prop typelarini Strapi shapeiyle hizala. Strapi nested bir obje donuyorsa (ornegin `teacher: { fullName }`) bunu page tarafinda `teacherName` gibi flat bir alana cevirmek yerine component typeina `teacher?: { fullName?: string | null } | null` ekle ve `.fullName`'i component icinde kullan. Boylece ne page tarafinda ne de baska bir call sitede mapping yapilmasi gerekir.

Kacin:

- page tarafinda Strapi responseunu `.map()` ile flat UI shapeine donusturmekten
- component icinde kullanilmayan alanlari icin page tarafinda manual flatteningden
- UI logicini servicee tasimaktan

### 9) Verifikasi yap

En az asagidakileri calistir:

1. `npm run lint`
2. `npm run build:frontend`
3. live route check
4. page render check

Kontrol listesi:

- route `[]` donduruyor mu
- page crash ediyor mu
- empty-state dogru mu
- invalid `sort` query broken Strapi URL uretiyor mu
- server-rendered page internal route self-fetch yapmadan render ediyor mu

## Common Pitfalls

- route handler icinde ikinci `GET` export etmeye calismak
- page tarafinda `localhost` fallbacki kullanmak
- server-rendered page icinden kendi API routeunu self-fetch etmek
- empty `sort` parametresini servicee aynen gecmek
- public route `pageSize` degerini clamp etmeden Strapiye gecmek
- fallbacki servicee koyup controlleri sadece passthrough yapmak
- query normalizationi sadece bir katmanda yapmak

## Recommended File Layout

Typical split:

- `frontend/src/app/api/<resource>/route.ts`  ← locale-free; accessible at `/api/<resource>`
- `frontend/src/lib/<resource>-service.ts`
- `frontend/src/app/[locale]/<page>/page.tsx`

API route handlerlari `[locale]` altina konmamali. `next-intl` middleware `/api` pathlerini locale injection disinda tutar; route `[locale]/api/` altina giderse URL `/<locale>/api/<resource>` olur ve `/api/<resource>` 404 doner.

## Example From This Repo

Current courses exemplar:

- `frontend/src/app/api/courses/route.ts`
- `frontend/src/lib/course-service.ts`
- `frontend/src/app/[locale]/egitimler/page.tsx`

## Copy-Forward Rule

Yeni bir route icin bu patterni kopyalarken oncelik sirasi su olmali:

1. service extraction
2. route controller
3. server-rendered page consumer switch to direct service
4. query normalization
5. verification

Eger scope buyukse, once sadece list pathte dene. Detail ve latest gibi ek pathleri ayni anda tasima.
