FROM node:24-bookworm AS deps

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

RUN npm ci --prefix frontend
RUN npm ci --prefix backend

FROM deps AS builder

WORKDIR /app

COPY frontend ./frontend
COPY backend ./backend
COPY docker ./docker

ENV STRAPI_URL=http://127.0.0.1:1337

RUN npm run build --prefix backend
RUN npm run build --prefix frontend

FROM node:24-bookworm-slim AS runner

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

RUN chmod +x /app/docker/start-app.sh \
  && mkdir -p /app/backend/.tmp /app/backend/public/uploads

EXPOSE 3000 1337

HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=6 CMD curl --globoff --fail --silent http://127.0.0.1:3000/ >/dev/null && curl --globoff --fail --silent "http://127.0.0.1:1337/api/events?pagination[pageSize]=1" >/dev/null || exit 1

CMD ["/app/docker/start-app.sh"]
