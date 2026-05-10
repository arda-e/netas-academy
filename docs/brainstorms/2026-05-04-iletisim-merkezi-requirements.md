---
date: 2026-05-04
topic: iletisim-merkezi
---

# İletişim Merkezi — Strapi Admin E-posta Yönetimi

## Summary

An injected email compose panel on the Strapi Event detail page, giving non-technical content admins the ability to send custom HTML emails to event participants and receive automatic confirmation emails on registration — all without leaving the event context. MVP covers two email capabilities: automatic registration confirmation (fire-and-forget) and manual custom emails with meeting link. ICS attachments, per-recipient email logs, newsletters, and contact follow-ups are deferred to v2.

---

## Problem Frame

Content admins at Netas Academy manage events, registrations, and student communications through the Strapi admin panel. The backend already has email infrastructure — a configured email provider, a `sendRegistrationEmail` API endpoint, and `lastEmailSentAt` tracking on registrations — but the admin UI to actually use it is essentially missing.

Admins today cannot:
- Automatically send a confirmation when a student registers for an event
- Compose and send a custom email to event participants from within Strapi
- Include a meeting link in communications without manually pasting it each time

Each of these gaps requires admins to leave Strapi, compose emails in an external client, manually look up recipients, and maintain no record within the academy system. For non-technical admins who live in the Strapi admin, this context switch is the entire friction — the backend capability exists, the UI surface to use it does not.

*Quantification to be validated during planning: expected admin count, events/month, average registrants/event, and current time-per-communication cycle should be gathered from the operations team to anchor the investment decision.*

---

## Actors

- **A1. Content Admin** — Non-technical staff member who manages events and communications. Lives inside the Strapi admin panel. Needs compose-and-send flows without leaving the event context.
- **A2. Student (implicit)** — Registers for events via the public site. Receives confirmation emails automatically and reminder/announcement emails when admins trigger them.
- **A3. Strapi Email Provider** — The configured email plugin (provider) that delivers emails. Assumed already set up; the plugin uses it, it does not configure it.

---

## Key Flows

- **F1. Auto Registration Confirmation**
  - **Trigger:** A student submits a registration via the public site (`POST /api/registrations/register`)
  - **Actors:** A2, A3
  - **Steps:**
    1. Registration is created with status `pending` or `confirmed`
    2. A lifecycle hook fires and checks if auto-confirmation is enabled for the event
    3. If enabled, the system renders the configured confirmation template with the student's and event's data
    4. The email is sent to the student's email address
    5. The send updates `lastEmailSentAt` on the registration
  - **Outcome:** The student receives a confirmation email with event title, date, location, and meeting link (if set). Admin took no manual action.
  - **Covered by:** R1, R2, R3, R4

- **F2. Manual Custom Email**
  - **Trigger:** Admin needs to send a message to event participants. Opens the event detail page and clicks the "E-posta Gönder" button in the injected panel.
  - **Actors:** A1, A3
  - **Steps:**
    1. Admin is already on the target event's detail page
    2. Admin chooses which registration statuses to include — selects one or more from: confirmed, pending, cancelled, waitlisted, attended. Default: confirmed only.
    3. Admin enters subject and pastes HTML body into a textarea. The event's meeting link is auto-appended to the email body if set.
    4. Admin clicks "Kendime Test Gönder" to preview the resolved email sent to their own address, or proceeds to send
    5. System delivers to all matching recipients, deduplicates per email address, and updates `lastEmailSentAt` on each registration
  - **Outcome:** All targeted registrants receive the custom email with the meeting link (if set). Admin sees a send summary (N sent, N skipped).
  - **Covered by:** R5, R6, R8, R9, R10

- **F3. Custom Event Announcement**
  - **Trigger:** Admin needs to send an unscheduled message to event participants (e.g., venue change, materials link, cancellation notice)
  - **Actors:** A1, A3
  - **Steps:**
    1. Admin opens the target event's detail page and opens compose form from the injected panel
    2. Admin enters subject, uploads an HTML template file, optionally attaches ICS
    3. Admin filters recipients by registration status
    4. Admin sends (optionally after "Kendime Test Gönder" preview)
    5. System delivers and logs each send
  - **Outcome:** Targeted registrants receive the custom message. Admin has a record of the send.
  - **Covered by:** R5, R6, R7, R8, R9, R10, R11

---

## Requirements

### Event Schema Extension

- **R1.** Each event has an optional **meeting link** field (URL), editable in the event create/edit form.
- **R2.** The meeting link is available as a template variable (`{{ event.meetingLink }}`) in all email types.

### Auto-Confirmation (E1: Kayıt Onayı)

- **R3.** When a registration is created, a configurable auto-confirmation email is sent to the student if the event has auto-confirmation enabled. Email delivery occurs after the registration transaction commits, using fire-and-forget semantics — a failed email send does not roll back the registration.
- **R4.** The confirmation template is a single HTML body pasted once by the admin in the plugin settings. Template variables (`{{ event.title }}`, `{{ event.startsAt }}`, `{{ event.location }}`, `{{ event.meetingLink }}`) are injected at send time via simple string replacement. Missing/null values render as empty string.

### Manual Email (E-posta Gönder)

- **R5.** The compose form on the Event detail page has fields: subject (text input), HTML body (textarea — paste HTML), recipient filter by registration status.
- **R6.** Recipient filtering supports selecting one or more registration statuses (confirmed, pending, cancelled, waitlisted, attended). Default selection: confirmed only.
- **R7.** The event's meeting link is automatically appended to the email body when set. No ICS calendar attachment is generated (v2).
- **R8.** Template variables (`{{ event.title }}`, `{{ event.startsAt }}`, `{{ event.location }}`, `{{ event.meetingLink }}`) are supported in both subject and the confirmation template HTML body. In the manual compose form, the admin pastes final HTML — no variables are injected.

### Send Safety

- **R9.** Before sending, the admin sees a summary of how many recipients match the selected filter and which statuses are included.
- **R10.** Sending is idempotent per recipient per send action — duplicate emails to the same address are suppressed within a single send.

### Surface

- **R11.** Email compose/send controls appear as an injected panel on the Event detail page, with a compose form and "Kendime Test Gönder" preview button. The admin manages event communications without leaving the event context.
- **R12.** All plugin UI labels use Turkish, matching the existing admin and public site language.
- **R13.** A top-level sidebar plugin ("İletişim Merkezi") providing cross-event send history, template management, newsletters, and contact follow-up surfaces is a deferred v2 concern.

---

## Acceptance Examples

- **AE1. Covers R3, R4.** Given an event with auto-confirmation enabled and a configured template, when a student registers, then within seconds the student receives an email with the event title, date, location, and meeting link (if set).
- **AE2. Covers R3.** Given an event with auto-confirmation disabled, when a student registers, then no auto-email is sent.
- **AE3. Covers R5, R6, R9.** Given an event with 5 confirmed and 3 pending registrations, when the admin opens the compose form and selects "confirmed" only, then the recipient summary shows "5 recipients (confirmed)".
- **AE4. Covers R10.** Given two registrations for the same event both belonging to the same student email, when the admin sends to "all" recipients, then only one email is delivered to that address.
- **AE5. Covers R11, R12.** Given a content admin viewing an Event detail page, the "E-posta Gönder" injected panel is visible with Turkish labels.

---

## Success Criteria

- **SC1.** A content admin completes a manual email send (compose → confirm recipients → send confirmation) in under 60 seconds, measured from clicking "E-posta Gönder" to send confirmation.
- **SC2.** ≥95% of auto-confirmation emails deliver within 30 seconds of registration, verified by `lastEmailSentAt` timestamp comparison.
- **SC3.** In a post-launch survey of content admins, ≥4 out of 5 report the feature eliminated their need for external email tools for event communications.

---

## Scope Boundaries

- Newsletter composition and sending to newsletter subscribers (v2)
- Contact lead management — viewing/replying to contact form submissions from the plugin (v2)
- Email provider configuration — the plugin relies on Strapi's existing email provider plugin being already set up
- Email analytics dashboards, open/click tracking, or campaign performance metrics
- SMS or push notification channels
- Automated email on event cancellation or student unregistration (admins manually compose cancellation notices for MVP; v2)
- ICS calendar file attachments (v2 — MVP uses meeting link in email body)
- Per-recipient email log collection type (v2 — MVP uses existing `lastEmailSentAt` field on registrations)
- Email sequences, drip campaigns, or multi-step automated workflows beyond the single auto-confirmation trigger
- Public-facing unsubscribe or email preference pages (the newsletter subscription API already handles subscription status)

---

## Key Decisions

- **Injected panel on Event detail page.** Email compose and send are surfaced as an injected panel on the Event detail page — the admin already manages the event there and sees registrant context. A top-level sidebar plugin is v2.
- **Auto-confirmation is per-event toggle, not global.** Events differ — some are free webinars needing immediate confirmation, others are paid courses needing manual review before confirming.
- **Single global confirmation template.** One HTML template pasted once in plugin settings and reused across all events. Template variables inject event-specific content.
- **HTML paste, no WYSIWYG editor.** The manual compose form uses a simple textarea for HTML body. Admins design HTML externally (ChatGPT, manual) and paste it in. No in-Strapi rich text editor avoids email-HTML compatibility issues.
- **Meeting link replaces ICS attachment.** The event's meeting link is appended to email bodies. ICS calendar file attachment is deferred to v2, eliminating the ICS library dependency and attachment compatibility risk.
- **No per-recipient email log.** MVP updates the existing `lastEmailSentAt` field on each registration. A full per-recipient email log collection type is deferred to v2.

---

## Dependencies / Assumptions

- Strapi email provider is configured and working (SMTP, SendGrid, or equivalent). An explicit `@strapi/provider-email-nodemailer` (or equivalent provider) dependency must be added to `backend/package.json`.
- The existing `sendRegistrationEmail` endpoint and service in `backend/src/api/event/services/event.ts` must be absorbed into the plugin's send path to avoid two parallel email paths.
- The existing `lastEmailSentAt` field on the Registration content type is used for send tracking in MVP.
- Template variable substitution uses simple string replacement for event-only variables. No nested paths or conditionals are needed.

---

## Outstanding Questions

### Deferred to Planning

- **[Affects R3][Technical]** Email delivery failure handling for auto-confirmation — retry strategy (exponential backoff, fixed interval, or no retry), admin alerting mechanism, and whether failures are surfaced in the admin UI
- **[Affects R10][Technical]** Cross-batch deduplication — if admin sends twice in quick succession, do overlapping batches produce duplicates?

---

## Deferred / Open Questions

### From 2026-05-04 review

- **Auto-confirmation hook fire-and-forget pattern** — F1 (P0, adversarial, confidence 100)

  R3 specifies fire-and-forget semantics (email after transaction commit, failed send does not roll back registration). This must be verified during implementation — Strapi lifecycle hooks are synchronous by default. The existing registration service already demonstrates the correct pattern: commit registration in a transaction, deliver notifications outside the transaction with catch-log-and-continue. This finding is resolved by R3's current wording but the implementation must follow the existing pattern.

  <!-- dedup-key: section="key flows" title="autoconfirmation lifecycle hook contradicts existing fireandforget pattern" evidence="the existing registration service wraps the registration in a database transaction commits the registration then delivers notificati" -->

- **No loading, error, success, or partial-failure feedback states** — F2 (P0, design, confidence 100)

  Sending email is a destructive, reputation-sensitive operation. Admins need immediate feedback on whether sends succeeded, failed, or partially failed. Add: after clicking Send, show a progress indicator, then a result summary with success count, failure list with reasons. Include error-state handling for provider-down (clear error message with suggested action).

  <!-- dedup-key: section="f2 step 6 f3 step 4 requirements" title="no loading error success or partialfailure feedback states" evidence="sending email is a destructive reputationsensitive operation admins need immediate feedback on whether sends succ" -->

- **No confirmation dialog before mass email dispatch** — R9 (P0, design, confidence 100)

  R9 says admins see a recipient summary before sending, but seeing is not confirming. A non-technical admin could accidentally click Send on the wrong event. Split into two steps: (1) Admin clicks 'Alıcıları Göster', sees a modal with recipient count and status breakdown, then (2) Admin clicks 'Gönder' to confirm. Button label should include the count: '47 Alıcıya Gönder'.

  <!-- dedup-key: section="r9 f2 step 5" title="no confirmation dialog or safety gate before mass email dispatch" evidence="r9 says admins see a recipient summary before sending but seeing is not confirming a nontechnical admin" -->

- **No failure or recovery model for auto-confirmation email delivery** — F1 (P0, adversarial, confidence 100)

  R3 uses fire-and-forget semantics, but the doc doesn't specify what happens when the email provider is down for 30 minutes. Are confirmations silently lost? Remaining decisions: retry strategy, admin alerting mechanism, and whether failures are surfaced in any admin UI.

  <!-- dedup-key: section="key flows f1 success criteria" title="no failure or recovery model for email delivery" evidence="the doc states a student receives a confirmation email automatically as a success criterion but defines no failure pat" -->

- **No anti-spam or rate-limiting guard** — R5, R6, R9 (P1, security, confidence 75)

  No technical guard prevents a content admin from sending to thousands of registrants in rapid succession. R9 is UI-level only. Consider a cooldown period between sends to the same event and a configurable maximum recipient cap per send. Accepted as-is for MVP per user decision.

  <!-- dedup-key: section="r5 r6 r9 r12" title="no antispam or ratelimiting guard" evidence="r12 grants plugin access via a single permission r5r6 allow selecting events and filtering by registration status r9" -->

- **Permission model granularity undefined** — R11 (P1, security, confidence 75)

  Plugin access currently implied as a single permission. Consider per-event scoping or separate compose-send vs. configuration permissions. Simplified by lack of email log (no log-view permission needed). Accepted as-is for MVP.

  <!-- dedup-key: section="r12" title="permission model undefined" evidence="r12 states the plugin is visible to roles with the appropriate permission but never defines what permissions exist" -->

- **Recipient summary placement ambiguous** — R9 (P2, design, confidence 100)

  R9 says the admin 'sees a summary' but doesn't specify where. Ideally: an inline live counter below the status filter that updates on change, repeated in the confirmation modal before final send.

  <!-- dedup-key: section="r9" title="recipient summary placement is ambiguous" evidence="r9 says the admin sees a summary of how many recipients match the selected filter and which statuses are included bu" -->

- **Existing sendRegistrationEmail endpoint migration path** — Dependencies (P2, adversarial, confidence 100)

  The existing `sendRegistrationEmail` service must be absorbed into the plugin to avoid two parallel email paths. Absorb or shim; either way the endpoint must be deprecated and eventually removed.

  <!-- dedup-key: section="dependencies" title="existing sendregistrationemail endpoint has no migration path" evidence="the existing codebase already has a working sendregistrationemail service and a lastemailsentat field on registrations" -->

- **No mobile or tablet responsiveness consideration** — R11 (P3, design, confidence 75)

  Content admins may access Strapi from tablets for on-site event logistics. Plugin should remain functional at tablet widths (768px+). Full mobile not required for MVP.

  <!-- dedup-key: section="r12" title="no mobile or tablet responsiveness consideration" evidence="content admins may access strapi from tablets especially when managing onsite event logistics the compose form with" -->
