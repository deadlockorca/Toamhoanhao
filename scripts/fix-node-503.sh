#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(pwd)"
NEXT_VERSION=""
REACT_VERSION=""
REACT_DOM_VERSION=""
SKIP_INSTALL=0

usage() {
  cat <<'EOF'
Usage:
  bash scripts/fix-node-503.sh [options]

Options:
  --app-root <path>        App root on server (default: current directory)
  --next-version <ver>     Force Next.js version (example: 16.2.1)
  --react-version <ver>    Force React version
  --react-dom-version <v>  Force React DOM version
  --skip-install           Skip npm install in .next/standalone
  -h, --help               Show this help

Example:
  bash scripts/fix-node-503.sh --app-root /home/nhmua8yw/toamhoanhao.muagi.vn
EOF
}

log() {
  printf '[fix-503] %s\n' "$*"
}

fail() {
  printf '[fix-503][ERROR] %s\n' "$*" >&2
  exit 1
}

extract_semver() {
  local raw="$1"
  local version
  version="$(printf '%s' "$raw" | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1 || true)"
  printf '%s' "$version"
}

read_package_value() {
  local file="$1"
  local key="$2"
  node -e "
    const fs = require('fs');
    const file = process.argv[1];
    const key = process.argv[2];
    if (!fs.existsSync(file)) process.exit(0);
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    const value =
      (pkg.dependencies && pkg.dependencies[key]) ||
      (pkg.devDependencies && pkg.devDependencies[key]) ||
      '';
    process.stdout.write(value);
  " "$file" "$key" 2>/dev/null || true
}

read_package_exact_version() {
  local file="$1"
  node -e "
    const fs = require('fs');
    const file = process.argv[1];
    if (!fs.existsSync(file)) process.exit(0);
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    process.stdout.write(pkg.version || '');
  " "$file" 2>/dev/null || true
}

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"

  touch "$file"
  if grep -Eq "^${key}=" "$file"; then
    awk -v key="$key" -v value="$value" '
      BEGIN { replaced = 0 }
      $0 ~ ("^" key "=") {
        if (!replaced) {
          print key "=" value
          replaced = 1
        }
        next
      }
      { print }
      END {
        if (!replaced) {
          print key "=" value
        }
      }
    ' "$file" > "${file}.tmp"
    mv "${file}.tmp" "$file"
  else
    printf '%s=%s\n' "$key" "$value" >> "$file"
  fi
}

detect_swc_package() {
  local uname_s uname_m
  uname_s="$(uname -s 2>/dev/null | tr '[:upper:]' '[:lower:]')"
  uname_m="$(uname -m 2>/dev/null | tr '[:upper:]' '[:lower:]')"

  if [ "$uname_s" != "linux" ]; then
    printf '%s' "@next/swc-linux-x64-gnu"
    return
  fi

  case "$uname_m" in
    x86_64|amd64) printf '%s' "@next/swc-linux-x64-gnu" ;;
    aarch64|arm64) printf '%s' "@next/swc-linux-arm64-gnu" ;;
    *) printf '%s' "@next/swc-linux-x64-gnu" ;;
  esac
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --app-root)
      shift
      [ "$#" -gt 0 ] || fail "Missing value for --app-root"
      APP_ROOT="$1"
      ;;
    --next-version)
      shift
      [ "$#" -gt 0 ] || fail "Missing value for --next-version"
      NEXT_VERSION="$1"
      ;;
    --react-version)
      shift
      [ "$#" -gt 0 ] || fail "Missing value for --react-version"
      REACT_VERSION="$1"
      ;;
    --react-dom-version)
      shift
      [ "$#" -gt 0 ] || fail "Missing value for --react-dom-version"
      REACT_DOM_VERSION="$1"
      ;;
    --skip-install)
      SKIP_INSTALL=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown option: $1"
      ;;
  esac
  shift
done

APP_ROOT="$(cd "$APP_ROOT" && pwd)"
APP_NAME="$(basename "$APP_ROOT")"
APP_ENV_FILE="$APP_ROOT/.env"
APP_SERVER_FILE="$APP_ROOT/server.js"
APP_SERVER_BACKUP_FILE="$APP_ROOT/server.original.js"
STANDALONE_DIR="$APP_ROOT/.next/standalone"
STANDALONE_SERVER_FILE="$STANDALONE_DIR/server.js"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  CANDIDATE_ACTIVATE="$(ls -1 "$HOME/nodevenv/$APP_NAME"/*/bin/activate 2>/dev/null | head -n 1 || true)"
  if [ -n "$CANDIDATE_ACTIVATE" ]; then
    log "Node/NPM not in PATH. Auto-activating: $CANDIDATE_ACTIVATE"
    # shellcheck source=/dev/null
    source "$CANDIDATE_ACTIVATE"
  fi
fi

command -v node >/dev/null 2>&1 || fail "node not found. Activate nodeenv first."
command -v npm >/dev/null 2>&1 || fail "npm not found. Activate nodeenv first."

[ -d "$APP_ROOT" ] || fail "App root not found: $APP_ROOT"
[ -d "$STANDALONE_DIR" ] || fail "Standalone directory missing: $STANDALONE_DIR (run npm run build first)"
[ -f "$STANDALONE_SERVER_FILE" ] || fail "Standalone server missing: $STANDALONE_SERVER_FILE"

find "$APP_ROOT" -maxdepth 1 -type f \( -name 'core' -o -name 'core.*' \) -delete 2>/dev/null || true
log "Removed stale core dump files in app root (if any)"

if [ -z "$NEXT_VERSION" ]; then
  NEXT_VERSION="$(read_package_exact_version "$STANDALONE_DIR/node_modules/next/package.json")"
fi
if [ -z "$NEXT_VERSION" ]; then
  NEXT_VERSION="$(extract_semver "$(read_package_value "$APP_ROOT/package.json" "next")")"
fi
[ -n "$NEXT_VERSION" ] || fail "Cannot detect Next.js version. Pass --next-version."

if [ -z "$REACT_VERSION" ]; then
  REACT_VERSION="$(read_package_exact_version "$STANDALONE_DIR/node_modules/react/package.json")"
fi
if [ -z "$REACT_VERSION" ]; then
  REACT_VERSION="$(extract_semver "$(read_package_value "$APP_ROOT/package.json" "react")")"
fi
[ -n "$REACT_VERSION" ] || REACT_VERSION="19.2.0"

if [ -z "$REACT_DOM_VERSION" ]; then
  REACT_DOM_VERSION="$(read_package_exact_version "$STANDALONE_DIR/node_modules/react-dom/package.json")"
fi
if [ -z "$REACT_DOM_VERSION" ]; then
  REACT_DOM_VERSION="$(extract_semver "$(read_package_value "$APP_ROOT/package.json" "react-dom")")"
fi
[ -n "$REACT_DOM_VERSION" ] || REACT_DOM_VERSION="$REACT_VERSION"

SWC_PACKAGE="$(detect_swc_package)"

log "APP_ROOT=$APP_ROOT"
log "NEXT_VERSION=$NEXT_VERSION"
log "REACT_VERSION=$REACT_VERSION"
log "REACT_DOM_VERSION=$REACT_DOM_VERSION"
log "SWC_PACKAGE=$SWC_PACKAGE"

if [ -f "$APP_SERVER_FILE" ] && [ ! -f "$APP_SERVER_BACKUP_FILE" ]; then
  cp "$APP_SERVER_FILE" "$APP_SERVER_BACKUP_FILE"
  log "Backup created: $APP_SERVER_BACKUP_FILE"
fi

cat > "$APP_SERVER_FILE" <<'EOF'
const path = require("node:path");
const fs = require("node:fs");
const { spawn, spawnSync } = require("node:child_process");

if (!process.env.HOSTNAME) process.env.HOSTNAME = "0.0.0.0";
if (!process.env.NEXT_DISABLE_SWC_WASM) process.env.NEXT_DISABLE_SWC_WASM = "1";
if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) process.env.PRISMA_CLIENT_ENGINE_TYPE = "library";

const relaunchWithDisabledCoreDumps = () => {
  if (process.platform !== "linux") return false;
  if (process.env.CORE_DUMP_LIMIT_APPLIED === "1") return false;

  const child = spawn(
    "/bin/sh",
    ["-c", 'ulimit -c 0; exec "$@"', "sh", process.execPath, ...process.argv.slice(1)],
    {
      stdio: "inherit",
      env: { ...process.env, CORE_DUMP_LIMIT_APPLIED: "1" },
    }
  );

  child.on("error", (error) => {
    console.error("[server] failed to relaunch with core dumps disabled:", error);
    process.exit(1);
  });

  const forwardSignal = (signal) => {
    if (!child.killed) child.kill(signal);
  };
  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));
  process.on("SIGHUP", () => forwardSignal("SIGHUP"));

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  return true;
};

const disableCoreDumpsForProcess = () => {
  if (process.platform !== "linux") return;
  const result = spawnSync("prlimit", ["--pid", String(process.pid), "--core=0:0"], {
    stdio: "ignore",
  });
  if (typeof result.status === "number" && result.status === 0) return;
};

const cleanupCoreFiles = () => {
  const appRoot = process.cwd();
  let entries = [];
  try {
    entries = fs.readdirSync(appRoot, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/^core(?:\..+)?$/.test(entry.name)) continue;
    try {
      fs.unlinkSync(path.join(appRoot, entry.name));
    } catch {}
  }
};

const resolveRuntimeEntry = () => {
  const candidates = [
    path.join(process.cwd(), ".next", "standalone", "server.js"),
    path.join(__dirname, "standalone.server.js"),
  ];
  for (const entry of candidates) {
    if (fs.existsSync(entry)) return entry;
  }
  return "";
};

if (!relaunchWithDisabledCoreDumps()) {
  disableCoreDumpsForProcess();
  cleanupCoreFiles();

  const entry = resolveRuntimeEntry();
  if (!entry) {
    console.error("[server] Missing standalone runtime entry (.next/standalone/server.js or standalone.server.js)");
    process.exit(1);
  }

  Promise.resolve()
    .then(() => require(entry))
    .catch((err) => {
    console.error("[server] startup error:", err);
    process.exit(1);
    });
}
EOF
log "Updated startup launcher: $APP_SERVER_FILE"

mkdir -p "$STANDALONE_DIR/.next/static" "$STANDALONE_DIR/public"
if [ -d "$APP_ROOT/.next/static" ]; then
  rm -rf "$STANDALONE_DIR/.next/static"
  mkdir -p "$STANDALONE_DIR/.next/static"
  cp -a "$APP_ROOT/.next/static/." "$STANDALONE_DIR/.next/static/"
  log "Synced static files to standalone runtime"
else
  log "Skip static sync (.next/static not found)"
fi

if [ -d "$APP_ROOT/public" ]; then
  rm -rf "$STANDALONE_DIR/public"
  mkdir -p "$STANDALONE_DIR/public"
  cp -a "$APP_ROOT/public/." "$STANDALONE_DIR/public/"
  log "Synced public files to standalone runtime"
else
  log "Skip public sync (public not found)"
fi

upsert_env "$APP_ENV_FILE" "NEXT_DISABLE_SWC_WASM" "1"
upsert_env "$APP_ENV_FILE" "PRISMA_CLIENT_ENGINE_TYPE" "library"
upsert_env "$APP_ENV_FILE" "NODE_OPTIONS" "--max-old-space-size=256"
log "Updated env: NEXT_DISABLE_SWC_WASM=1"
log "Updated env: PRISMA_CLIENT_ENGINE_TYPE=library"
log "Updated env: NODE_OPTIONS=--max-old-space-size=256"

if [ "$SKIP_INSTALL" -eq 0 ]; then
  log "Installing runtime packages in .next/standalone..."
  (
    cd "$STANDALONE_DIR"
    npm install --no-audit --no-fund --save-exact \
      "next@$NEXT_VERSION" \
      "react@$REACT_VERSION" \
      "react-dom@$REACT_DOM_VERSION" \
      "$SWC_PACKAGE@$NEXT_VERSION"
  )
else
  log "Skip install because --skip-install"
fi

[ -f "$STANDALONE_DIR/node_modules/next/package.json" ] || fail "next package is missing in standalone runtime"
[ -f "$STANDALONE_DIR/node_modules/@next/${SWC_PACKAGE#@next/}/package.json" ] || fail "$SWC_PACKAGE is missing in standalone runtime"

log "Done. Next steps:"
log "1) cPanel > Setup Node.js App > Startup file = server.js"
log "2) Restart App"
log "3) Verify: https://${APP_NAME}"
