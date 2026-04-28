# Course Application Implementation Outline

## Purpose

Bu dokuman, course application feature'inin yeni projede hangi Strapi modelleri, custom endpoint'ler ve backend servisleri ile implemente edilmesi gerektigini tanimlar.

Bu bir delivery plan degil; implementation boundary ve technical contract dokumanidir.

## Related Specs

- [Course Application Workflow](/Users/arda/Desktop/development/netas_academy/docs/superpowers/specs/2026-04-21-course-application-workflow.md)
- [SAP SOAP Integration](/Users/arda/Desktop/development/netas_academy/docs/superpowers/specs/2026-04-21-sap-soap-integration.md)
- [Payment Orchestration](/Users/arda/Desktop/development/netas_academy/docs/superpowers/specs/2026-04-21-payment-orchestration.md)
- [Applicant Lookup By TCKN](/Users/arda/Desktop/development/netas_academy/docs/superpowers/specs/2026-04-21-applicant-lookup-by-tckn.md)
- [Notification Dispatch](/Users/arda/Desktop/development/netas_academy/docs/superpowers/specs/2026-04-21-notification-dispatch.md)

## Implementation Goal

Legacy Unity akışındaki egitim basvurusu mantigi, yeni projede su sekilde ayrismalidir:

- content ve page read modeli Strapi content API'de kalir
- application/odeme/integration karar mantigi custom backend endpoint'lerde calisir
- frontend yalnizca typed request/response contract kullanir

## New Content Types

### `course-application`

Amac:

- Egitim basvurularinin ana kaydi

Onerilen alanlar:

- `applicationNumber`
- `status`
- `manualReview`
- `notes`
- `consents`
- `submittedAt`
- `completedAt`
- `integrationProvider`
- `integrationDecision`
- `integrationStatusCode`
- `integrationReference`
- `paymentStatus`
- `paymentProvider`
- `paymentUrlSnapshot`
- `lastNotificationSentAt`
- `course` relation
- `student` relation

Onerilen enum alanlari:

- `status`: `submitted`, `integration_pending`, `manual_review`, `pending_payment`, `completed_without_payment`, `completed`, `cancelled`
- `paymentStatus`: `not_started`, `pending`, `paid`, `failed`, `cancelled`
- `integrationDecision`: `pending`, `accepted`, `manual_review`, `rejected`

### `payment-link`

Amac:

- Kurs bazli veya senaryo bazli odeme linklerini source of truth olarak tutmak

Onerilen alanlar:

- `title`
- `active`
- `provider`
- `url`
- `course` relation
- `priority`
- `startsAt`
- `endsAt`
- `audienceRule`

Not:

Eger odeme linkleri dogrudan `course` modeli uzerinde yonetilecekse bu content type zorunlu degildir.

### `integration-log`

Amac:

- SAP/SOAP ve diger harici isteklerin audit trail kaydi

Onerilen alanlar:

- `type`
- `requestId`
- `endpoint`
- `requestPayloadRedacted`
- `responsePayloadRedacted`
- `httpStatus`
- `parsedStatusCode`
- `decision`
- `errorSummary`
- `courseApplication` relation
- `createdAt`

### Optional: `contract-version`

Amac:

- Basvuru sirasinda kabul edilen metin versiyonlarini saklamak

Onerilen alanlar:

- `key`
- `version`
- `title`
- `content`
- `publishedAt`
- `active`

## Existing Content Types To Reuse

- `course`
- `student`
- `notification-routing`

Mevcut repo bu iliskilerin bir kismini zaten destekliyor:

- [backend/src/api/student/content-types/student/schema.json](/Users/arda/Desktop/development/netas_academy/backend/src/api/student/content-types/student/schema.json)
- [backend/src/api/course/content-types/course/schema.json](/Users/arda/Desktop/development/netas_academy/backend/src/api/course/content-types/course/schema.json)

## New Custom Endpoints

### `POST /api/course-applications/submit`

Amac:

- Kurs basvurusu olusturmak
- Student upsert yapmak
- Gerekli consent ve validation kontrollerini calistirmak
- SAP/SOAP entegrasyonunu tetiklemek
- Sonuca gore application state belirlemek
- Gerekirse payment URL donmek

Request:

```json
{
  "courseDocumentId": "string",
  "student": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "tckn": "string",
    "address": "string"
  },
  "consents": {
    "kvkk": true,
    "salesAgreement": true,
    "commercialElectronicMessage": false
  },
  "notes": "optional"
}
```

Response:

```json
{
  "data": {
    "applicationId": 123,
    "status": "pending_payment",
    "manualReview": false,
    "integration": {
      "provider": "sap_soap",
      "statusCode": "10",
      "decision": "accepted"
    },
    "nextAction": "redirect_to_payment",
    "paymentUrl": "https://..."
  }
}
```

### `POST /api/course-applications/lookup-by-tckn`

Amac:

- TCKN ile mevcut kullanici/application bilgisini bulmak
- frontend prefill icin guvenli response donmek

### `POST /api/course-applications/:documentId/create-payment-session`

Amac:

- Uygun odeme linkini secmek veya payment session olusturmak

Not:

Submit endpoint'i ilk response'ta payment URL dondurecekse bu endpoint opsiyonel olabilir.

### `POST /api/course-applications/:documentId/mark-paid`

Amac:

- Legacy link tabanli odemeden daha ileri bir kurguya gecilecekse payment callback veya admin action icin state guncellemek

Not:

Bu endpoint ancak gercek provider entegrasyonu varsa eklenmelidir.

## Backend Services

### `course-application` service

Sorumluluklar:

- request normalization
- validation
- student upsert orchestration
- application create/update
- status transition
- notification trigger

### `sap-soap` integration service

Sorumluluklar:

- partner request XML olusturma
- sales doc request XML olusturma
- external call
- response parse
- decision donme
- integration log yazma

### `payment-orchestration` service

Sorumluluklar:

- course/application bazli payment link resolution
- payment URL/session uretilmesi
- payment status update helperlari

### `applicant-lookup` service

Sorumluluklar:

- TCKN normalization
- minimal data response shaping
- privacy-aware field filtering

## Frontend Integration Points

### New Next Route Handlers

- `frontend/src/app/api/course-applications/submit/route.ts`
- `frontend/src/app/api/course-applications/lookup-by-tckn/route.ts`
- opsiyonel `frontend/src/app/api/course-applications/[documentId]/create-payment-session/route.ts`

Bu route handler'lar frontend ile Strapi arasinda ince proxy katmani gibi davranabilir.

### New Frontend Hooks

- `use-course-application-form`
- opsiyonel `use-tckn-lookup`

Frontend tarafinda tutulacak sorumluluklar:

- form state
- loading/error/success state
- local validation
- backend response'una gore redirect veya finish page

## Recommended Validation Rules

- `courseDocumentId` zorunlu
- `student.firstName` zorunlu
- `student.email` zorunlu
- `student.tckn` zorunlu ve normalize edilmeli
- `consents.kvkk` zorunlu
- gerekiyorsa `salesAgreement` zorunlu

## Status Transition Outline

1. request gelir
2. `student` upsert edilir
3. `course-application` kaydi `submitted` olarak olusur
4. entegrasyon gerekiyorsa `integration_pending`
5. SAP sonucu:
   - accepted -> `pending_payment`
   - manual_review -> `manual_review`
   - rejected/fallback-without-payment -> `completed_without_payment`
6. gerekiyorsa notification gonderilir
7. response frontend'e donulur

## File Placement Suggestion

Backend:

- `backend/src/api/course-application/content-types/course-application/schema.json`
- `backend/src/api/course-application/controllers/course-application.ts`
- `backend/src/api/course-application/routes/course-application.ts`
- `backend/src/api/course-application/routes/custom-course-application.ts`
- `backend/src/api/course-application/services/course-application.ts`
- `backend/src/services/integrations/sap-soap.ts`
- `backend/src/services/payment-orchestration.ts`

Frontend:

- `frontend/src/app/api/course-applications/submit/route.ts`
- `frontend/src/hooks/use-course-application-form.ts`
- `frontend/src/components/course-application-form.tsx`

## Current Repo Impact

Bu implementasyon mevcut `event registration` mimarisine paralel olmalidir, ama ayni endpoint veya ayni content type altina sikistirilmamalidir.

Referans ornek:

- [backend/src/api/registration/controllers/registration.ts](/Users/arda/Desktop/development/netas_academy/backend/src/api/registration/controllers/registration.ts:8)
- [backend/src/api/registration/services/registration.ts](/Users/arda/Desktop/development/netas_academy/backend/src/api/registration/services/registration.ts:23)
- [frontend/src/app/api/registrations/register/route.ts](/Users/arda/Desktop/development/netas_academy/frontend/src/app/api/registrations/register/route.ts:1)

## Explicit Keep / Expand / Discard Matrix

Bu bolum, mevcut implementasyonda hangi parcalarin genisletilecegini ve hangilerinin tasinmayacagini acikca belirtir.

### Keep As-Is

Asagidaki yapilar yeni course application feature'i icin dogrudan degistirilmeyecek, sadece referans pattern olarak kalacak:

- mevcut `event registration` feature'i
- mevcut `contact submission` feature'i
- mevcut `frontend/src/lib/strapi.ts` content fetch yaklasimi
- mevcut `notification-routing` content type ve internal notification altyapisi

Bu parcalar zaten yeni mimariyle uyumlu bir baseline sunuyor.

### Expand Existing Patterns

Asagidaki mevcut implementasyonlar genisletilecek:

#### `student` modeli ve upsert pattern'i

Mevcut:

- `student` modeli var
- email bazli upsert var

Genisleme:

- course application tarafinda tekrar kullanilacak
- gerekiyorsa `tckn`, `address` gibi alanlarla zenginlestirilecek

Not:

Bu, mevcut `student` domain'inin cope atilmasi degil; genisletilmesidir.

#### Custom controller/service pattern'i

Mevcut:

- `registration.register`
- `contact-submission.submit`

Genisleme:

- ayni pattern ile `course-applications.submit`
- ayni pattern ile `lookup-by-tckn`
- ayni pattern ile gerekirse `create-payment-session`

#### Frontend route handler proxy pattern'i

Mevcut:

- `frontend/src/app/api/registrations/register/route.ts`
- `frontend/src/app/api/contact-submissions/submit/route.ts`

Genisleme:

- `frontend/src/app/api/course-applications/submit/route.ts`
- `frontend/src/app/api/course-applications/lookup-by-tckn/route.ts`

#### Frontend form hook pattern'i

Mevcut:

- `use-event-registration-form`

Genisleme:

- `use-course-application-form`
- gerekirse `use-tckn-lookup`

#### Notification dispatch pattern'i

Mevcut:

- internal notification service
- notification routing defaults

Genisleme:

- `course_application_submitted`
- `course_application_manual_review`
- `course_payment_pending`

### Replace, Do Not Reuse

Asagidaki legacy davranislarin is ihtiyaci korunabilir, ama implementasyon bicimi yeniden yazilacak:

#### Legacy SOAP orchestration

Korunacak sey:

- partner -> sales doc -> status branching mantigi

Atilacak sey:

- Unity `SplController` bagimliligi
- UI icine gomulu branching
- string split tabanli kirilgan parse

Yeni karsiligi:

- backend `sap-soap` integration service

#### Legacy DB write akisleri

Korunacak sey:

- basvuru kaydinin submit sonrasi persist edilmesi

Atilacak sey:

- `Controller.php` ve `Controller_event.php` tabanli PHP endpoint bagimliligi
- `WWWForm` request formati

Yeni karsiligi:

- Strapi content types + custom controllers/services

#### Legacy payment link resolution

Korunacak sey:

- basvuruya gore payment destination secme ihtiyaci

Atilacak sey:

- `paymentLinkDict`
- `GetContracts.paymentLinkDict`
- `PageManager.paymentLinkDict`
- `PlayerPrefs.GetInt("paymentUrlID")`

Yeni karsiligi:

- backend payment orchestration service
- course veya payment-link content type tabanli source of truth

#### Legacy TCKN lookup behavior

Korunacak sey:

- mevcut basvuran bilgisini geri getirme ihtiyaci

Atilacak sey:

- `Citizen=read`
- `?` ile split edilen duz string response
- frontend'in business karar icin local cache kullanmasi

Yeni karsiligi:

- typed JSON endpoint
- minimal, policy-aware response

### Discard Entirely

Asagidaki yapilar yeni projeye tasinmayacak:

#### Generic `PageApi` resource gateway

Sebep:

- yeni repo zaten Strapi bazli typed content fetch kullaniyor
- `res=...` query string tabanli resource secimi yeni mimariye uymuyor

#### Unity UI state flags as business contract

Atilacak flag ornekleri:

- `splCheck`
- `manuelCheck`
- `tcknPageOpen`
- `tcknPageClose`

Sebep:

- bunlar business outcome degil, UI koordinasyon flag'leri

Yeni karsiligi:

- `status`
- `manualReview`
- `nextAction`
- `integration.decision`

#### Browser choreography inside business flow

Atilacak sey:

- once ana sayfayi ac, sonra odeme linkini ac tipi akışlar

Sebep:

- bu business logic degil, legacy UI workaround'udur

### Current Repo Files Likely To Be Expanded

- [backend/src/api/student/content-types/student/schema.json](/Users/arda/Desktop/development/netas_academy/backend/src/api/student/content-types/student/schema.json)
- [backend/src/api/student/services/student.ts](/Users/arda/Desktop/development/netas_academy/backend/src/api/student/services/student.ts)
- [backend/src/index.ts](/Users/arda/Desktop/development/netas_academy/backend/src/index.ts)
- [frontend/src/app/api/registrations/register/route.ts](/Users/arda/Desktop/development/netas_academy/frontend/src/app/api/registrations/register/route.ts)
- [frontend/src/hooks/use-event-registration-form.ts](/Users/arda/Desktop/development/netas_academy/frontend/src/hooks/use-event-registration-form.ts)

### Current Repo Files Not To Be Touched For This Feature

- mevcut event registration controller/service dosyalari, sadece referans pattern olarak kullanilacak
- mevcut contact submission feature dosyalari
- mevcut Strapi content read helperlari

### Net Decision Summary

- `event registration` tutulur, ama genisletilip course application'a donusturulmez
- `student` modeli tutulur ve genisletilir
- `notification` altyapisi tutulur ve genisletilir
- `frontend route handler + hook` pattern'i tutulur ve genisletilir
- legacy PHP endpoint bagimliligi atilir
- legacy Unity controller mantigi atilir
- legacy `PageApi` atilir
- legacy local cache ve UI flag tabanli branching atilir

## Open Product Decisions

- Partner SOAP failure durumunda kullanici odemeye devam eder mi, etmez mi
- `Status != "10"` her zaman `completed_without_payment` mi olur
- Payment link `course` uzerinde mi tutulur, ayri content type mi olur
- TCKN lookup herkese acik endpoint mi olur, ek koruma ister mi
- Applicant confirmation email gonderilecek mi

## Recommendation

Ilk delivery icin minimum kapsam:

- `course-application` content type
- `POST /api/course-applications/submit`
- `sap-soap` integration service
- `paymentUrl` donduren basit payment resolution
- admin/internal notification

Ikinci faz:

- TCKN lookup
- contract versioning
- payment callback/state sync
- daha ayrintili integration log UI'si
