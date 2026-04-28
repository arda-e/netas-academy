# Payment Orchestration Spec

## Purpose

Bu dokuman, legacy sistemde `paymentLinkDict`, `PlayerPrefs`, `GetContracts` ve `ApplyFinishPageCoroutine()` icine dagilmis odeme yonlendirme mantiginin yeni projede nasil toplanacagini tanimlar.

## Scope

- Hangi basvurunun hangi odeme linkine gidecegi
- Payment link/source of truth
- Redirect karari
- Payment state ile application state iliskisi

## Out of Scope

- Payment provider UI render detaylari
- Browser tarafinda `window.open` choreografisi

## Ownership

- `backend`: payment link resolution, session creation, rule evaluation
- `frontend`: redirect execution, result ekranlari

## Core Rule

Odeme linki secim mantigi frontend cache veya local storage ustunden calismamali.

Frontend'e su ikisinden biri donulmeli:

- hazir `paymentUrl`
- ya da `paymentSessionId`/`checkoutToken`

## Suggested Backend Contract

`POST /api/course-applications/:id/create-payment-session`

Response:

```json
{
  "data": {
    "applicationId": 123,
    "paymentStatus": "pending",
    "paymentUrl": "https://...",
    "provider": "legacy_link"
  }
}
```

## Suggested Source of Truth

Payment linkler Strapi icinde veya backend config tablosunda tutulmali.

Olası kaynaklar:

- `course` bazli field
- ayri `payment-link` content type
- provider bazli config table

## Legacy Mapping

Legacy sorumluluklar:

- `PageManager.PaymentLinks(...)`
- `GetContracts.PaymentLinks(...)`
- `EmailController.ApplyFinishPageCoroutine()`

## Migration Rule

Asagidaki legacy yaklasimlar tasinmamalidir:

- `PlayerPrefs.GetInt("paymentUrlID")`
- ikili dictionary cache
- TCKN page state'ine gore frontend branching

## Notes

- Payment feature, event registration'dan ayri tutulmali.
- Odeme linki secimi application state ile bagli bir domain karari oldugu icin backend'te kalmalidir.
