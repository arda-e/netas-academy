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

Shared payment handoff creation is owned by backend parent flows. Course application and paid event registration both call the shared orchestration service and return the same frontend-safe shape:

Response:

```json
{
  "nextAction": "render_checkout",
  "payment": {
    "attemptReference": "pay_...",
    "status": "checkout_created",
    "provider": "iyzico",
    "presentation": {
      "kind": "iyzico_checkout_form",
      "token": "checkout-token",
      "checkoutFormContent": "<provider-created-content>"
    }
  }
}
```

The frontend renders only this backend-created presentation. API-based card collection and frontend provider selection are out of scope for the current phase.

## Suggested Source of Truth

Payment linkler Strapi icinde veya backend config tablosunda tutulmali.

Attempt and provider event history live in shared Strapi content types:

- `payment-attempt`: parent descriptor, amount, status, retry link, provider token, and sanitized frontend/provider snapshots
- `payment-provider-event`: callback/webhook idempotency key, signature acceptance state, provider token, and sanitized payload snapshot

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

- Payment orchestration is shared, while event registration and course application remain distinct parent flows.
- Odeme gerekliligi application/event state ile bagli bir domain karari oldugu icin backend parent servislerinde kalmalidir.
