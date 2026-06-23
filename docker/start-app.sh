#!/usr/bin/env bash

set -euo pipefail

backend_pid=""
frontend_pid=""

wait_for_tcp() {
  local host="${1:?host is required}"
  local port="${2:?port is required}"

  for attempt in {1..60}; do
    if (echo >"/dev/tcp/${host}/${port}") >/dev/null 2>&1; then
      return 0
    fi

    sleep 2
  done

  return 1
}

cleanup() {
  for pid in "$frontend_pid" "$backend_pid"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill -TERM "$pid" 2>/dev/null || true
    fi
  done

  wait "$frontend_pid" "$backend_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

cd /app

if [[ "${DATABASE_CLIENT:-sqlite}" == "postgres" ]]; then
  db_host="${DATABASE_HOST:-postgres}"
  db_port="${DATABASE_PORT:-5432}"

  if ! wait_for_tcp "$db_host" "$db_port"; then
    echo "Timed out waiting for Postgres on ${db_host}:${db_port}." >&2
    exit 1
  fi
fi

npm --prefix backend run start &
backend_pid=$!

for attempt in {1..60}; do
  if curl --globoff --fail --silent "http://127.0.0.1:${PORT}/api/events?pagination[pageSize]=1" >/dev/null 2>&1; then
    break
  fi

  if ! kill -0 "$backend_pid" 2>/dev/null; then
    echo "Strapi exited before becoming ready." >&2
    wait "$backend_pid"
  fi

  sleep 2
done

if ! curl --globoff --fail --silent "http://127.0.0.1:${PORT}/api/events?pagination[pageSize]=1" >/dev/null 2>&1; then
  echo "Timed out waiting for Strapi on port ${PORT}." >&2
  exit 1
fi

npm --prefix frontend run start -- --hostname 0.0.0.0 --port "${FRONTEND_PORT}" &
frontend_pid=$!

wait -n "$backend_pid" "$frontend_pid"
