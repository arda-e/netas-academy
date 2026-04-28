# Email Provider Strategy

## Context

The current mail path uses Strapi's email plugin via `backend/config/plugins.ts`.
Internal notifications are sent through:

- `backend/src/services/internal-notifications/strapi-service.ts`
- `backend/src/services/internal-notifications/service-core.ts`
- `backend/src/services/internal-notifications/templates.ts`

The product and runtime direction for this repo is:

- single application container
- EC2-first deployment
- minimal operational complexity
- future option to move toward Fargate later

That means email delivery should not introduce extra containers such as self-hosted SMTP, MinIO-backed mail flows, or a separate mail worker unless there is a real scale or reliability trigger later.

## Decision

Use a managed external email provider for production delivery.

Recommended order:

1. Brevo via SMTP
2. Resend via SMTP

Do not optimize for zero external dependencies in this area. That would shift deliverability, SMTP server management, reputation, and email authentication burden into this project and increase operational complexity.

The correct optimization here is:

- keep the application runtime simple
- keep the number of external dependencies low
- keep the delivery provider swappable

## Architecture

### Development

Use `sendmail` as the default local provider.

Goals:

- zero-friction local startup
- no mandatory external account for local development
- existing notification code remains unchanged

### Production

Use `nodemailer` with SMTP credentials from a managed provider.

For the first production path, prefer Brevo SMTP.

Goals:

- preserve the single-container application model
- avoid self-hosted SMTP infrastructure
- keep the transport layer replaceable by environment variables

### Why SMTP over a provider-specific Strapi plugin

Prefer SMTP through `@strapi/provider-email-nodemailer` instead of a provider-specific Strapi plugin.

Reasons:

- easier provider swap later
- less provider lock-in in application code
- simpler fallback from Brevo to Resend or another SMTP-compatible provider
- keeps the repo mail boundary inside Strapi's standard email plugin contract

## Environment Strategy

The email provider should be environment-driven.

Expected provider modes:

- `EMAIL_PROVIDER=sendmail` for local development
- `EMAIL_PROVIDER=nodemailer` for deployed environments

`backend/config/plugins.ts` should branch on `EMAIL_PROVIDER`.

### Target config shape

```ts
import type { Core } from "@strapi/strapi";

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const emailProvider = env("EMAIL_PROVIDER", "sendmail");

  return {
    email: {
      config: {
        provider: emailProvider,
        providerOptions:
          emailProvider === "nodemailer"
            ? {
                host: env("SMTP_HOST"),
                port: env.int("SMTP_PORT", 587),
                secure: env.bool("SMTP_SECURE", false),
                auth: {
                  user: env("SMTP_USER"),
                  pass: env("SMTP_PASS"),
                },
              }
            : {},
        settings: {
          defaultFrom: env(
            "EMAIL_DEFAULT_FROM",
            "Netas Academy <no-reply@netas-academy.local>",
          ),
          defaultReplyTo: env(
            "EMAIL_DEFAULT_REPLY_TO",
            "support@netas-academy.local",
          ),
          testAddress: env("EMAIL_TEST_ADDRESS", "test@netas-academy.local"),
        },
      },
    },
    "csv-exporter": {
      enabled: true,
      config: {},
    },
  };
};

export default config;
```

## Environment Matrix

### Development

```env
EMAIL_PROVIDER=sendmail
EMAIL_DEFAULT_FROM=Netas Academy <no-reply@netas-academy.local>
EMAIL_DEFAULT_REPLY_TO=support@netas-academy.local
EMAIL_TEST_ADDRESS=test@netas-academy.local
```

### Production with Brevo

```env
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-brevo-smtp-login
SMTP_PASS=your-brevo-smtp-password
EMAIL_DEFAULT_FROM=Netas Academy <no-reply@yourdomain.com>
EMAIL_DEFAULT_REPLY_TO=info@yourdomain.com
EMAIL_TEST_ADDRESS=ops@yourdomain.com
```

### Production with Resend fallback

```env
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
EMAIL_DEFAULT_FROM=Netas Academy <no-reply@yourdomain.com>
EMAIL_DEFAULT_REPLY_TO=info@yourdomain.com
EMAIL_TEST_ADDRESS=ops@yourdomain.com
```

## Secrets and Config Split

### Secrets

- `SMTP_USER`
- `SMTP_PASS`

### Non-secret config

- `EMAIL_PROVIDER`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `EMAIL_DEFAULT_FROM`
- `EMAIL_DEFAULT_REPLY_TO`
- `EMAIL_TEST_ADDRESS`

## Operational Notes

- `defaultFrom` must use a verified domain.
- SPF, DKIM, and any provider-side sender verification must be handled in the email provider account, not in app code.
- `reply-to` can differ from `defaultFrom`, but the sender domain should remain verified.
- Notification recipient routing continues to live in `api::notification-routing.notification-routing`.
- Internal notification code should not know whether delivery is handled by Brevo, Resend, or another SMTP provider.

## Runtime Positioning

This decision aligns with the broader infrastructure direction:

- runtime now: stateful single-container app on EC2
- code shape: ready to externalize infrastructure later
- email delivery: externally managed from the start

This keeps the application simple today without forcing self-hosted mail infrastructure into the repo.

## Non-Goals

The following are intentionally out of scope for the first phase:

- self-hosted SMTP server
- dedicated mail worker
- queue and retry subsystem
- delivery audit/history in the application database
- provider-specific analytics integration
- multi-provider failover inside the application

## Follow-up Implementation

When this decision is implemented, the expected code changes are:

1. install `@strapi/provider-email-nodemailer`
2. update `backend/config/plugins.ts` to support env-driven provider selection
3. add SMTP env variables to the deployment environment
4. set verified sender domain and DNS records in the chosen provider
5. run a real notification smoke test from the deployed backend
