# Strapi Email Provider Implementation Ideation

## Scope

Ideate how to implement the Strapi email plugin/provider work already described in:

- `docs/superpowers/specs/2026-04-22-email-provider-strategy.md`
- `docs/plans/2026-04-27-parallel-subagent-execution-units.md`

This is not a requirements or implementation plan. It identifies the strongest implementation shape and the weaker alternatives that should not survive into a PR.

## Current Grounding

- `backend/config/plugins.ts` already configures Strapi email with `EMAIL_PROVIDER`, but `providerOptions` is always `{}`.
- `backend/package.json` does not yet include `@strapi/provider-email-nodemailer`.
- `backend/.env.example`, `docker-compose.yml`, and `docker-compose.deploy.yml` expose only sendmail/default sender settings, not SMTP host/user/password.
- Internal notifications already route through `notification-routing` and send via `strapi.plugin("email").service("email").send(...)`.
- Event registration mail already sends through `strapi.plugin('email').service('email').sendTemplatedEmail(...)`.
- The PR coordination doc has backend integration rules, but no dedicated email-provider unit. This work touches backend config/package/deployment env, not feature UI.

External Strapi docs align with this direction:

- Strapi Email is available by default, sendmail is the default provider, and sendmail is not production-ready without further configuration.
- Providers are configured in `config/plugins.js|ts`.
- Nodemailer provider config expects SMTP host, port, secure flag, and auth credentials.
- Strapi supports `send()` and `sendTemplatedEmail()` through the email service, which matches the current repo boundary.

## Candidate Ideas

### 1. Dedicated Backend Infra PR For Env-Driven Nodemailer Support

Create a small independent PR, effectively `U16 Strapi email provider runtime config`.

Expected ownership:

- `backend/package.json`
- `backend/package-lock.json`
- `backend/config/plugins.ts`
- `backend/.env.example`
- `docker-compose.yml`
- `docker-compose.deploy.yml`
- optional README/deploy note
- optional focused config test

Implementation shape:

- Install `@strapi/provider-email-nodemailer`, preferably aligned to the backend Strapi 5 version available in the npm registry.
- Keep `EMAIL_PROVIDER=sendmail` as the default.
- When `EMAIL_PROVIDER=nodemailer`, build `providerOptions` from `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`.
- Fail clearly if `EMAIL_PROVIDER=nodemailer` is selected but required SMTP values are missing.
- Keep notification services unchanged.
- Replace hardcoded compose `EMAIL_PROVIDER: sendmail` with env pass-through defaults so production can flip without a code diff.
- Add SMTP variables to `.env.example`, marked as required only for `nodemailer`.

Why it survives:

- Smallest source change that satisfies the strategy.
- Keeps the app's mail boundary inside Strapi's standard email plugin.
- Avoids coupling transport setup to contact, event, course-application, or newsletter feature PRs.
- Supports a safe rollout: merge code support first, then flip EC2/provider env only after sender-domain verification.

### 2. Fold The Work Into U14 Backend Integration

Treat this as part of `U14 Backend integration pass` from the PR strategy doc.

Why it is plausible:

- U14 already owns backend shared-file reconciliation.
- Email provider config is cross-feature infrastructure.

Why it is weaker:

- It delays production mail readiness behind unrelated backend schema/type integration.
- It increases review noise in an already conflict-prone integration PR.
- It makes deployment-env mistakes harder to isolate.

Use only if the team wants to avoid introducing a new unit id.

### 3. Keep Sendmail In Production And Configure The EC2 Host

Avoid nodemailer and rely on the default sendmail provider on the server.

Why it fails:

- It contradicts the email-provider strategy.
- It pushes deliverability, reputation, SPF/DKIM alignment, and host mail configuration into the EC2 instance.
- It creates more operational risk than using Brevo/Resend SMTP.

Reject.

### 4. Use Provider-Specific Brevo Or Resend Integration

Install or write a Brevo/Resend-specific provider and configure app code around that provider.

Why it fails:

- The chosen strategy explicitly prefers SMTP through Nodemailer.
- It creates provider lock-in for no first-phase benefit.
- Current notification code should not know whether Brevo, Resend, or another SMTP relay is used.

Reject.

### 5. Add A Mail Queue, Retry Table, And Delivery Audit

Add a durable delivery subsystem around email sends.

Why it fails for first phase:

- The strategy names queue/retry/audit as non-goals.
- Existing notification behavior intentionally logs delivery failure while preserving the main transaction.
- The current volume does not justify another subsystem.

Reject for now. Revisit only if real delivery volume, retry needs, or compliance requirements appear.

### 6. Add A Custom Public Smoke-Test Endpoint

Create an endpoint that sends test email from production.

Why it is risky:

- It expands the public/API surface for an operational check.
- Strapi admin already has email configuration/test tooling.
- The repo already has real application paths that can be smoke-tested with controlled test data.

Reject as a public endpoint. A private script or documented admin-panel smoke test is enough.

## Recommended Direction

Use idea 1: a dedicated backend infra PR.

Suggested branch:

```text
feat/u16-strapi-email-provider
```

Suggested PR title:

```text
U16 Strapi email provider runtime config
```

Suggested PR boundary:

- Add the nodemailer provider dependency.
- Implement the environment-driven provider branch in `backend/config/plugins.ts`.
- Document SMTP env variables in `backend/.env.example` and deploy docs.
- Make compose files pass through email/SMTP env instead of hardcoding sendmail.
- Add a focused config unit test if it can be done without booting Strapi.
- Do not change `internal-notifications`, `event`, `registration`, `contact-submission`, or frontend code unless a test proves the existing service call shape is wrong.

## Key Design Choice

Use a hard failure only when `EMAIL_PROVIDER=nodemailer` is explicitly selected and required SMTP values are missing.

Do not silently fall back to sendmail in that case. Silent fallback would make production look configured while mail still fails or goes through the wrong transport. The safe fallback is the default `EMAIL_PROVIDER=sendmail`; once production explicitly selects `nodemailer`, missing credentials should be loud.

## Rollout Shape

1. Merge the code/config support PR while keeping local defaults on sendmail.
2. Create/verify Brevo sender domain and DNS records.
3. Add EC2 deployment environment values for `EMAIL_PROVIDER=nodemailer`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_DEFAULT_FROM`, `EMAIL_DEFAULT_REPLY_TO`, and `EMAIL_TEST_ADDRESS`.
4. Redeploy.
5. Use Strapi admin email test first.
6. Trigger one controlled app-path notification, preferably with test recipients in `notification-routing`, then inspect logs.

## Validation Ideas

- `npm run test --prefix backend -- --runInBand` is not the local pattern; prefer the repo's existing Vitest scripts.
- Targeted test: import `backend/config/plugins.ts` with a fake `env` helper and assert:
  - default provider is `sendmail`
  - nodemailer mode maps SMTP values into `providerOptions`
  - nodemailer mode rejects missing required SMTP values
- Build check: `npm run build:backend`.
- Runtime smoke: deployed backend Strapi email test plus one controlled notification route.

## Remaining Open Decision

Whether to name this as a new `U16` unit or fold it into `U14`.

Recommendation: use `U16`. It is operational infrastructure, not backend feature integration, and it can be reviewed independently.
