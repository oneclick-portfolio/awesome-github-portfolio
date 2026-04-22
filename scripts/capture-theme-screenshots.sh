#!/usr/bin/env bash
set -euo pipefail

# Captures each theme page as a rendered PNG and writes screenshot.png
# into that theme folder using Playwright (headless browser).

PORT="${1:-8090}"
BASE_URL="http://127.0.0.1:${PORT}"

# Dynamically get all theme directories
THEMES=()
for theme_dir in themes/*/; do
  THEMES+=("$(basename "$theme_dir")")
done

SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

if ! curl -fsS "${BASE_URL}" >/dev/null 2>&1; then
  python3 -m http.server "${PORT}" >/tmp/theme-screenshot-server.log 2>&1 &
  SERVER_PID="$!"

  curl -fsS --retry 20 --retry-connrefused --retry-delay 1 "${BASE_URL}" >/dev/null
fi

for theme in "${THEMES[@]}"; do
  url="${BASE_URL}/themes/${theme}/index.html"
  out="themes/${theme}/screenshot.png"

  # Run Playwright through npx so no local package setup is required.
  npx -y playwright@latest screenshot \
    --browser=webkit \
    --viewport-size=1440,900 \
    --wait-for-timeout=700 \
    "$url" \
    "$out"

  echo "saved: $out"
done

echo "done"
