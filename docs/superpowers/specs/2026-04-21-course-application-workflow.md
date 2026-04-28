# Course Application Workflow Spec

## Purpose

Bu dokuman, legacy Unity akışındaki egitim basvurusu mantiginin yeni projede ayri bir feature olarak nasil modellenmesi gerektigini tanimlar.

Bu feature, event registration akisindan ayridir. Course application, kurs/egitim odakli basvuru, onay, harici entegrasyon ve odeme yonlendirmesi icin kullanilir.

## Scope

- Egitim basvuru form submit akisi
- Basvuru kaydinin backend uzerinden olusturulmasi
- Basvuru status yonetimi
- Odeme akisini tetikleyecek karar bilgisinin uretilmesi
- SAP/SOAP ve notification gibi downstream entegrasyonlar icin orkestrasyon

## Out of Scope

- Etkinlik kaydi
- CMS content fetch
- UI layout ve form rendering detaylari

## Proposed Ownership

- `frontend`: form state, inline validation, submit UX, success/error state
- `backend`: basvuru olusturma, duplicate kontrol, status branching, integration orchestration

## Inputs

Beklenen minimum alanlar:

- `firstName`
- `lastName`
- `email`
- `phone`
- `tckn`
- `address`
- `courseDocumentId` veya `courseId`
- `consents`
- opsiyonel `notes`

## Core Rules

- Basvuru backend uzerinden olusturulur; frontend dogrudan harici servislere cikmaz.
- Basvuru kaydi idempotent olmali veya duplicate kurali acikca tanimlanmalidir.
- Basvuru response'u UI flag yerine acik business state donmelidir.
- Basvuru sonucu `nextAction` ile tarif edilmelidir.

## Suggested Backend Contract

`POST /api/course-applications/submit`

Request:

```json
{
  "courseDocumentId": "string",
  "applicant": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "tckn": "string",
    "address": "string"
  },
  "consents": {
    "kvkk": true,
    "salesAgreement": true
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
    "nextAction": "redirect_to_payment",
    "paymentSessionId": "optional",
    "paymentUrl": "optional"
  }
}
```

## Suggested States

- `submitted`
- `integration_pending`
- `manual_review`
- `pending_payment`
- `completed_without_payment`
- `completed`
- `cancelled`

## SAP Result To Application State Mapping

Course application workflow, SAP/SOAP entegrasyon sonucunu dogrudan UI flag'leri ile degil, application state transition'lari ile yorumlamalidir.

### Initial Transition

Form submit edildiginde:

- application kaydi olusturulur
- ilk state `submitted` olur
- entegrasyon gerekiyorsa state `integration_pending` olarak ilerler

### Mapping Rules

#### Partner SOAP network/protocol failure

Legacy davranis:

- kullanici bloke edilmez
- `DBUserWrite()` yine calisir

Yeni sistem karsiligi:

- application state -> `manual_review`
- `manualReview = true`
- `integration.decision = "manual_review"`
- `nextAction = "show_support_message"`

#### Sales SOAP technical failure

Legacy davranis:

- hata loglanir
- akis biter

Yeni sistem karsiligi:

- application state -> `manual_review`
- `manualReview = true`
- `nextAction = "show_support_message"`

#### Sales SOAP response icinde `Status` bulunamazsa

Legacy davranis:

- ham XML loglanir
- hata loglanir
- akis biter

Yeni sistem karsiligi:

- application state -> `manual_review`
- `manualReview = true`
- `nextAction = "show_support_message"`

#### `Status == "10"`

Legacy davranis:

- `applyPage2` acilir
- `DBUserWrite()` cagrilir

Yeni sistem karsiligi:

- application state -> `pending_payment`
- `integrationAccepted = true`
- `integration.decision = "accepted"`
- `nextAction = "redirect_to_payment"`

#### `Status != "10"`

Legacy davranis:

- `SendEmail()` cagrilir
- finish ekranina dusulur
- `DBUserWrite()` cagrilir

Yeni sistem karsiligi:

- application state -> `completed_without_payment`
- `integrationAccepted = false`
- `nextAction = "show_finish_page"`

## Recommended Canonical States

Legacy branching'i daha temiz tasimak icin su state seti daha uygun olabilir:

- `submitted`
- `integration_pending`
- `manual_review`
- `pending_payment`
- `completed_without_payment`
- `completed`
- `cancelled`

## Recommended Response Shape

`POST /api/course-applications/submit` response'u UI'nin branching flag okumadan karar verebilecegi kadar acik olmalidir.

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

Alternatif manual review response:

```json
{
  "data": {
    "applicationId": 123,
    "status": "manual_review",
    "manualReview": true,
    "integration": {
      "provider": "sap_soap",
      "statusCode": null,
      "decision": "manual_review"
    },
    "nextAction": "show_support_message"
  }
}
```

## Data Model Notes

Olası model: `course-application`

Alan onerileri:

- applicant snapshot
- course relation
- current status
- external integration result
- payment status
- selected contract versions
- manual review flag

## Legacy Mapping

Legacy akistaki asagidaki sorumluluklar bu feature altinda toplanir:

- `FormsValidator.ValidateAndSubmit()`
- `EmailController.Submit()`
- `PhpController.DBUserWrite()` egitim varyanti
- `SplController.SendSOAPRequest()`
- `EmailController.ApplyFinishPageCoroutine()` icindeki egitim dalinin business karar kismi

## Notes

- Bu feature yeni projede event registration ile ayni endpoint altina sikistirilmamali.
- Course application ile payment birbirine bagli olsa da ayri feature spec olarak tutulmalidir.

## Error Response Contract

All course application endpoints return errors in this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR" | "NOT_FOUND" | "DUPLICATE_APPLICATION" | "INTEGRATION_ERROR",
    "message": "Human-readable error description",
    "details": {}
  }
}
```

Common error codes:
- `VALIDATION_ERROR` — missing or invalid required fields; `details` contains field-level errors
- `NOT_FOUND` — course or application does not exist
- `DUPLICATE_APPLICATION` — student already has an active application for this course
- `INTEGRATION_ERROR` — SAP/SOAP integration failure; `details` contains `provider` and `statusCode`

## Error Response Contract

All course application endpoints return errors in this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR" | "NOT_FOUND" | "DUPLICATE_APPLICATION" | "INTEGRATION_ERROR",
    "message": "Human-readable error description",
    "details": {}
  }
}
```

Common error codes:
- `VALIDATION_ERROR` — missing or invalid required fields; `details` contains field-level errors
- `NOT_FOUND` — course or application does not exist
- `DUPLICATE_APPLICATION` — student already has an active application for this course
- `INTEGRATION_ERROR` — SAP/SOAP integration failure; `details` contains `provider` and `statusCode`
