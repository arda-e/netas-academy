# syntax=docker/dockerfile:1.7

FROM node:22-bookworm AS deps

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
  npm ci --prefix frontend --cache /root/.npm --prefer-offline
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
  npm ci --prefix backend --cache /root/.npm --prefer-offline

FROM deps AS builder

WORKDIR /app

COPY frontend ./frontend
COPY backend ./backend
COPY docker ./docker
COPY emails ./emails

ENV STRAPI_URL=http://127.0.0.1:1337

ARG STRAPI_BUILD_DUMMY_1=ci-build-admin-jwt-secret
ARG STRAPI_BUILD_DUMMY_2=ci-build-api-token-salt
ARG STRAPI_BUILD_DUMMY_3=ci-build-transfer-token-salt
ARG STRAPI_BUILD_DUMMY_4=ci-build-encryption-key
ARG STRAPI_BUILD_SMTP_USER=ci-build-smtp-user
ARG STRAPI_BUILD_SMTP_PASS=ci-build-smtp-pass

RUN ADMIN_JWT_SECRET="$STRAPI_BUILD_DUMMY_1" \
  API_TOKEN_SALT="$STRAPI_BUILD_DUMMY_2" \
  TRANSFER_TOKEN_SALT="$STRAPI_BUILD_DUMMY_3" \
  ENCRYPTION_KEY="$STRAPI_BUILD_DUMMY_4" \
  EMAIL_SMTP_USER="$STRAPI_BUILD_SMTP_USER" \
  EMAIL_SMTP_PASS="$STRAPI_BUILD_SMTP_PASS" \
  npm run build --prefix backend
RUN npm run build --prefix frontend

FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337
ENV FRONTEND_PORT=3000
ENV STRAPI_URL=http://127.0.0.1:1337
ENV STRAPI_PUBLIC_URL=http://localhost:1337

COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend ./frontend
COPY --from=builder /app/docker ./docker
COPY --from=builder /app/emails ./emails

RUN chmod +x /app/docker/start-app.sh \
  && mkdir -p /app/backend/.tmp /app/backend/public/uploads

EXPOSE 3000 1337

HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=6 CMD curl --globoff --fail --silent http://127.0.0.1:3000/ >/dev/null && curl --globoff --fail --silent "http://127.0.0.1:1337/api/events?pagination[pageSize]=1" >/dev/null || exit 1

CMD ["/app/docker/start-app.sh"]
