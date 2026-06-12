---
date: 2026-06-11
topic: paid-event-registration-iyzico
---

# Paid Event Registration with iyzico Inline Payment

## Summary

Add a price field to events so admins can mark events as paid (TRY, price > 0). Free and paid events then follow different post-SPL paths: free events create a registration and send the user a confirmation email; paid events show an inline iyzico payment embed on the same page with a Mesafeli Satış Sözleşmesi consent requirement, and complete the registration on payment success. SPL-blocked users are silently accepted in both paths — they see a generic thank-you, but no user email is sent, and a blocked registration is recorded for staff visibility.

---

## Problem Frame

Event registrations currently have no payment dimension. Every event is effectively free: a user submits a form, a registration is created, and staff are notified. For training events (egitim, kurs) the product needs to collect payment, obtain a signed distance-sales agreement, and record marketing consents at the moment of checkout — not as a redirect to an external page, but as a seamless inline step. At the same time, the SPL check introduced for sanctions screening has no user-facing consequence — blocked users currently receive a hard 400 error, which inadvertently signals to the registrant that something is wrong. The desired behaviour is to never reveal the screening outcome to the registrant, regardless of event type.

---

## Actors

- A1. **Registrant** — the person filling out the event registration form
- A2. **iyzico** — the payment gateway that processes card transactions and calls the payment webhook
- A3. **Platform staff / admin** — receive internal notifications, SPL block flags, and post-payment PDFs

---

## Key Flows

- F1. **Free event — successful registration**
  - **Trigger:** A1 submits registration form for an event with price = 0
  - **Actors:** A1, A3
  - **Steps:** SPL check passes or returns manual_review → registration created (status `pending`) → thank-you shown to A1 → user confirmation email sent to A1 → internal notification sent to A3
  - **Outcome:** Registration exists in DB; registrant has email confirmation; staff are notified
  - **Covered by:** R5, R6, R7

- F2. **SPL block — any event type (silent)**
  - **Trigger:** A1 submits registration form; SPL returns `blocked`
  - **Actors:** A1, A3
  - **Steps:** SPL returns blocked → registration created (status `blocked`) → same generic thank-you shown to A1 (indistinguishable from success) → no user email → internal admin notification fires with blocked status visible
  - **Outcome:** Registrant believes registration succeeded; staff can see the block; no confirmation is sent
  - **Covered by:** R2, R3

- F3. **Paid event — payment happy path**
  - **Trigger:** A1 submits registration form for an event with price > 0; SPL passes
  - **Actors:** A1, A2, A3
  - **Steps:** SPL passes → backend creates registration (status `payment_pending`) and an iyzico payment order → frontend renders iyzico embed inline → A1 checks Mesafeli Satış Sözleşmesi (and optionally other consents) → A1 enters card and submits → A2 processes payment → A2 calls payment webhook → backend updates registration to `confirmed` → consent values recorded → Mesafeli Satış PDF filled with A1's name/surname and emailed to A3 → user confirmation email sent to A1
  - **Outcome:** Registration confirmed; payment record exists; PDF sent to admins; registrant has email confirmation
  - **Covered by:** R8, R9, R10, R11, R12, R13, R14, R15, R16, R18, R20

- F4. **Paid event — payment failure / retry**
  - **Trigger:** A2 reports payment failure via webhook
  - **Actors:** A1, A2
  - **Steps:** Webhook received with failure → payment record updated to `failed` → registration stays `payment_pending` → inline error shown to A1 → A1 may retry; retry creates a new payment record under the same registration
  - **Outcome:** Registration remains `payment_pending`; no duplicate registration on retry
  - **Covered by:** R17, R18, R19

---

## Requirements

**Event pricing model**

- R1. Events have a numeric price field (TRY, optional). Price > 0 designates the event as paid. Absent or zero means free. Admins set this in Strapi.

**SPL decision routing**

- R2. When SPL returns `blocked` for any event and any price tier: a registration record is created with status `blocked` and the registrant is shown the same generic thank-you message as a successful registration. The registrant is never told they were blocked.
- R3. A `blocked` SPL result sends no user-facing email. An internal admin notification fires with the blocked status visible to staff.
- R4. SPL `manual_review` is treated as "proceed" — the flow continues identically to `clear` for both free and paid events.

**Free event flow**

- R5. Free event + SPL pass/manual_review: registration is created with status `pending` and the registrant sees a thank-you message.
- R6. Free event + SPL pass/manual_review: a confirmation email is sent to the registrant. (This is net-new functionality; currently only internal notifications exist.)
- R7. Free event + SPL pass/manual_review: an internal admin notification is sent.

**Paid event — pre-payment**

- R8. Paid event + SPL pass/manual_review: a registration record is created immediately with status `payment_pending` before any payment is initiated. Re-submitting the same registrant + event combination returns the existing `payment_pending` record (idempotent).
- R9. After creating the `payment_pending` registration, the backend creates an iyzico payment order and returns a payment token to the frontend.
- R10. The frontend renders the iyzico payment embed inline on the registration page. There is no redirect to a separate payment URL.

**Paid event — payment step UI**

- R11. The payment step shows three consent checkboxes:
  - (a) **Mesafeli Satış Sözleşmesi** — required; payment submit button is disabled until checked
  - (b) **Photo/video KVKK consent** — optional; value recorded regardless
  - (c) **Email/SMS marketing consent** — optional; value recorded regardless
- R12. The payment submit button remains disabled until Mesafeli Satış Sözleşmesi (checkbox a) is checked, regardless of the state of the other two.
- R13. All three consent checkbox values (true/false) are persisted at payment submission time.

**Paid event — post-payment**

- R14. When iyzico calls the payment success webhook: the registration is updated to status `confirmed`.
- R15. On payment success: the existing Mesafeli Satış Sözleşmesi PDF template is filled with the registrant's first name and last name, and emailed to platform staff (A3). The registrant does not receive the PDF.
- R16. On payment success: a confirmation email is sent to the registrant.
- R17. On iyzico payment failure: the payment record for that attempt is marked `failed`; the registration stays `payment_pending`; an inline error is shown to the registrant allowing them to retry. Retry creates a new payment attempt record under the same registration — no new registration is created.

**Payment record**

- R18. A separate payment entity is created per payment attempt, linked to the registration. It stores at minimum: iyzico reference ID, amount (TRY), attempt timestamp, result status, and masked card/bank info when provided by iyzico.
- R19. Multiple payment records may exist for a single registration (retry scenario). The registration record's status reflects the aggregate outcome.

**Consent recording**

- R20. The values of all three consent checkboxes are stored at the time of payment submission and are immutable after the fact.

---

## Acceptance Examples

- AE1. **Covers R2, R3.** Given any event (free or paid) and SPL returning `blocked`, when the registrant submits the form, the system creates a registration with status `blocked`, displays the same thank-you message the registrant would see on a successful free registration, sends no email to the registrant, and fires an internal admin notification with the blocked status visible.

- AE2. **Covers R5, R6, R7.** Given a free event and SPL returning `clear`, when the registrant submits the form, a registration is created with status `pending`, the registrant sees a thank-you and receives a confirmation email, and admins receive an internal notification.

- AE3. **Covers R8, R10.** Given a paid event and SPL returning `clear`, when the registrant submits the form, a `payment_pending` registration is created and the iyzico payment embed renders inline on the same page — no browser redirect occurs.

- AE4. **Covers R11, R12.** Given the payment step is displayed, when Mesafeli Satış Sözleşmesi is unchecked (regardless of the other two checkboxes), the payment submit button is disabled and cannot be clicked.

- AE5. **Covers R14, R15, R16.** Given a `payment_pending` registration and iyzico reporting payment success via webhook, when the webhook is processed, the registration status is updated to `confirmed`, the Mesafeli Satış Sözleşmesi PDF (with the registrant's name filled in) is emailed to staff, and a confirmation email is sent to the registrant.

- AE6. **Covers R17, R18, R19.** Given a `payment_pending` registration and iyzico reporting payment failure, when the registrant retries, a second payment record is created under the same registration, the registration remains `payment_pending`, and only one registration record exists throughout.

---

## Success Criteria

- A registrant can complete a paid event registration, pay inline without leaving the page, and receive a confirmation email.
- A registrant hitting the SPL block never knows they were screened — the thank-you message is identical to a normal success.
- Staff receive the Mesafeli Satış Sözleşmesi PDF (name filled) after every successful paid registration.
- Retried payments do not produce duplicate registrations.
- Free event registrants receive a confirmation email (currently missing).

---

## Scope Boundaries

- Payment refunds, cancellations, and chargebacks are out of scope.
- Capacity limits and waitlists for paid events are out of scope.
- Multi-currency support is out of scope — TRY only.
- Recurring or subscription payments are out of scope.
- The registrant does not receive or download the Mesafeli Satış Sözleşmesi PDF; it goes to admins only.
- The Mesafeli Satış Sözleşmesi text displayed on the page (for reading before checking) is a UX detail deferred to planning.

---

## Key Decisions

- **iyzico as payment provider:** Turkish domestic card processing, inline embed available, no redirect required.
- **price > 0 as the paid signal:** Gives content admins flexibility to make any event type paid or free, rather than hard-coding payment to a specific eventType.
- **Registration created on payment initiation (not on success):** Prevents orphaned attempts and gives admins visibility into in-progress checkouts. Retry safety guaranteed by idempotent upsert on the same registrant + event.
- **SPL block is silent to the registrant:** Avoid revealing sanctions screening outcomes. Identical UX to success; staff see the flag internally.
- **Separate payment entity:** iyzico-specific data (reference IDs, attempt timestamps, card metadata) does not belong in the registration row. One registration may have multiple payment attempts.

---

## Dependencies / Assumptions

- An existing Mesafeli Satış Sözleşmesi PDF template is available to be filled with name/surname. The template is not yet in the repo; it must be provided before planning the PDF fill step.
- iyzico merchant credentials (API key, secret key, base URL) will be provided as environment variables.
- The existing internal notification infrastructure (`deliverInternalNotificationViaStrapi`) handles the blocked-registration and post-payment staff notifications.
- The existing HTML email templates (`emails/`) can be extended or reused for the new registrant confirmation email.

---

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- [Affects R15][Needs research] PDF fill mechanism — the Mesafeli Satış Sözleşmesi template's format (fillable PDF fields vs. placeholder substitution vs. HTML-to-PDF render) determines the library and pipeline. Locate or receive the template before implementation begins.
- [Affects R9, R14][Needs research] iyzico payment order creation API, webhook payload shape, and 3D Secure flow handling — requires reading iyzico documentation.
- [Affects R6, R16] Which email template to use/extend for the registrant confirmation email (free and paid paths may share one template or use separate ones).
- [Affects R8, R17] How the iyzico embed signals payment failure back to the host page (callback vs. postMessage) — affects how the inline error in R17 is triggered on the frontend.
