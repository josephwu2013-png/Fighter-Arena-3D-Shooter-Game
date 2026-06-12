#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_RUNTIME_DIR="$ROOT_DIR/Fighter Arena.app/Contents/Resources/game"
if [[ -f "$APP_RUNTIME_DIR/server.py" ]]; then
  RUNTIME_DIR="$APP_RUNTIME_DIR"
else
  RUNTIME_DIR="$ROOT_DIR"
fi
LOG_FILE="/tmp/fighter-arena-app.log"
DEFAULT_PORT=4174
STARTUP_TIMEOUT=18
APP_PROFILE_DIR="$HOME/Library/Application Support/Fighter Arena/profile"

show_error() {
  local message="$1"
  osascript -e 'display dialog "'"${message//\"/\\\"}"'" buttons {"OK"} default button "OK" with title "Fighter Arena"'
}

health_ok() {
  local port="$1"
  curl -fsS "http://127.0.0.1:${port}/api/health" >/dev/null 2>&1
}

find_open_port() {
  local port
  for port in $(seq "$DEFAULT_PORT" 4188); do
    if ! lsof -ti tcp:"$port" >/dev/null 2>&1; then
      echo "$port"
      return 0
    fi
    if health_ok "$port"; then
      echo "$port"
      return 0
    fi
  done
  return 1
}

open_game() {
  local port="$1"
  local url="http://127.0.0.1:${port}/?desktopapp=1"
  mkdir -p "$APP_PROFILE_DIR"

  if [[ -d "/Applications/Google Chrome.app" ]]; then
    open -na "/Applications/Google Chrome.app" --args "--app=$url" "--user-data-dir=$APP_PROFILE_DIR" "--autoplay-policy=no-user-gesture-required"
    return 0
  fi

  if [[ -d "/Applications/Microsoft Edge.app" ]]; then
    open -na "/Applications/Microsoft Edge.app" --args "--app=$url" "--user-data-dir=$APP_PROFILE_DIR" "--autoplay-policy=no-user-gesture-required"
    return 0
  fi

  open "$url"
}

cd "$RUNTIME_DIR"

if [ ! -f "$RUNTIME_DIR/server.py" ]; then
  show_error "Could not find server.py. Keep Fighter Arena.app and Launch Fighter Arena.command inside the full Fighter Arena project folder."
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  show_error "Python 3 is not installed on this Mac, so Fighter Arena cannot start yet."
  exit 1
fi

if health_ok "$DEFAULT_PORT"; then
  open_game "$DEFAULT_PORT"
  exit 0
fi

PORT="$(find_open_port)" || {
  show_error "Could not find an open local port for Fighter Arena."
  exit 1
}

if ! health_ok "$PORT"; then
  nohup python3 "$RUNTIME_DIR/server.py" "$PORT" >"$LOG_FILE" 2>&1 &
  for _ in $(seq 1 "$STARTUP_TIMEOUT"); do
    if health_ok "$PORT"; then
      open_game "$PORT"
      exit 0
    fi
    sleep 1
  done
  open "$LOG_FILE" >/dev/null 2>&1 || true
  show_error "Fighter Arena could not start the local server. A log file was opened to help debug it."
  exit 1
fi

open_game "$PORT"
