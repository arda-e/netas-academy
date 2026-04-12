# Email Notification System

## Goal

Implement a notification system for three email templates:

1. **Customer confirmation** - sent to customer after successful event registration
2. **Admin notification** - sent to admins when a customer registers for an event
3. **Admin notification** - sent to admins when a customer submits a contact form

## Email Templates

### 1. Customer Confirmation (Event Registration)

**Trigger:** Successful event registration (when blacklist check passes)

**Recipients:** Customer's email address

**Content (placeholder):**
- Subject: "Etkinlik Kaydınız Onaylandı - [Event Title]"
- Body: Simple text placeholder

### 2. Admin Notification (Event Registration)

**Trigger:** Successful event registration

**Recipients:** Configured admin roles + custom emails (via notification routing)

**Content (placeholder):**
- Subject: "Yeni Etkinlik Kaydı - [Event Title]"
- Body: Simple text placeholder with basic registration details

### 3. Admin Notification (Contact Form)

**Trigger:** Successful contact form submission

**Recipients:** Configured admin roles + custom emails (via notification routing)

**Content (placeholder):**
- Subject: "Yeni İletişim Formu - [Subject]"
- Body: Simple text placeholder with contact details

## Registration Flow

1. Validate required fields (eventDocumentId, student info, TCKN)
2. Validate TCKN
3. Execute blacklist check (placeholder - returns `true` for now)
4. **If blacklist check fails:**
   - Do not complete registration
   - Return response indicating pending review
   - Show user: "Your request has been taken, someone from the team will contact you soon"
   - Do not send any emails
5. **If blacklist check passes:**
   - Complete registration (upsert student, create registration record)
   - Send customer confirmation email (non-blocking)
   - Send admin notification email (non-blocking)
   - Return success with registration details

## Architecture

### Notification Routing Configuration

- Content type: `notification_routing`
- Fields:
  - `key`: unique identifier (e.g., `event_registration_customer`, `event_registration_admin`, `contact_submission_admin`)
  - `label`: admin-friendly name
  - `enabled`: boolean toggle
  - `adminRoles`: relation to Strapi admin roles
  - `customEmails`: JSON/text field for manual recipients

### Shared Notification Service

Location: `backend/src/services/notifications.ts`

```
sendInternalNotification(key, payload)
```

Responsibilities:
- Load routing by key
- Resolve admin emails from roles
- Merge with custom emails, deduplicate
- Skip if routing disabled or no recipients
- Render template
- Send via Strapi email plugin
- Log failures without throwing

### Email Templates

Location: `backend/src/services/email-templates.ts`

Templates return: `{ subject, text }`

Initial templates:
- `eventRegistrationCustomer(registration, event, student)`
- `eventRegistrationAdmin(registration, event, student)`
- `contactSubmissionAdmin(submission)`

## Decoupling Boundaries

- Frontend knows nothing about email recipients
- Next routes are thin proxies
- Domain services call `sendInternalNotification(key, payload)`
- Shared notification service owns recipient resolution, templates, and delivery
- Admin manages recipients via Strapi content type

## Error Handling

- Validation errors: fail the request (existing behavior)
- Persistence errors: fail the request (existing behavior)
- Notification errors: log and continue (non-blocking)
- Blacklist check failure: return pending status, no registration, no emails

## Out of Scope

- Actual blacklist API integration
- Editable templates in Strapi
- Retry queues
- Delivery audit/history
- User-facing notification preferences

## Testing Notes

- Blacklist check placeholder returns `true`
- Registration should proceed when placeholder returns `true`
- Customer and admin emails should be sent
- Registration should not complete when placeholder returns `false`
- No emails should be sent when blacklist check fails
