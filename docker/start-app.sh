#!/usr/bin/env bash

set -euo pipefail

backend_pid=""
frontend_pid=""

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
