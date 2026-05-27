#!/bin/bash
# docker-build-quiz.sh — build and deploy to Raspberry Pi or Lightsail
#
# Usage examples:
#   ./docker-build-quiz.sh                                    # Build & deploy to Pi (default)
#   TARGET=lightsail ./docker-build-quiz.sh                   # Build & deploy to Lightsail
#   LIGHTSAIL_IP=1.2.3.4 TARGET=lightsail ./docker-build-quiz.sh  # Lightsail with explicit IP
#   PUSH_TO_HUB=1 ./docker-build-quiz.sh                      # Direct copy + also push to Docker Hub
#   DIRECT_COPY=0 ./docker-build-quiz.sh                      # Use Docker Hub method (slower)
#   DOCKER_VERBOSE=1 ./docker-build-quiz.sh                   # Verbose Docker output
#   SKIP_DEPLOY=1 ./docker-build-quiz.sh                      # Build only (no deploy)
#   PLATFORMS=linux/amd64,linux/arm64 ./docker-build-quiz.sh  # Override platform
#   TRACE=1 ./docker-build-quiz.sh                            # Full bash debug trace
#
# Deployment targets:
#   pi (default)  — password SSH, linux/arm64, ~/apps/test-prep-quiz on Pi
#   lightsail     — key SSH, linux/amd64, /data/test-prep-quiz on Lightsail (behind apps-home Caddy)
#                   Requires: LIGHTSAIL_IP env var  OR  Keychain entry "lightsail_ip"
#                   Key path: LIGHTSAIL_KEY env var (default: ~/.ssh/lightsail.pem)
#
# Deployment methods:
#   DIRECT_COPY=1 (default): Build locally → save as tar → copy to host → load (FAST!)
#   DIRECT_COPY=0: Build, push to Docker Hub, host pulls from Hub (slower)

set -euo pipefail

########## CONFIG ##########
TARGET="${TARGET:-pi}"                                 # pi | lightsail

DOCKER_REPO_SERVER="${DOCKER_REPO_SERVER:-iqesolutions/test-prep-quiz-server}"
DOCKER_REPO_WEB="${DOCKER_REPO_WEB:-iqesolutions/test-prep-quiz-web}"
TAG="${TAG:-latest}"

# Pi config (password-based SSH)
REMOTE_USER="${REMOTE_USER:-magnusjohansson}"
REMOTE_HOST="${REMOTE_HOST:-raspberrypi.local}"
PI_KEYCHAIN_SERVICE="${PI_KEYCHAIN_SERVICE:-raspberrypi_scp}"

# Lightsail config (key-based SSH)
LIGHTSAIL_REMOTE_USER="${LIGHTSAIL_REMOTE_USER:-ubuntu}"
LIGHTSAIL_KEY="${LIGHTSAIL_KEY:-$HOME/.ssh/lightsail.pem}"
# LIGHTSAIL_IP: set via env var or store in Keychain as service "lightsail_ip"

# Build options
PLATFORMS="${PLATFORMS:-}"                             # Default set per-target below
DIRECT_COPY="${DIRECT_COPY:-1}"                        # 1=direct tar copy (fast), 0=Docker Hub pull
PUSH_TO_HUB="${PUSH_TO_HUB:-0}"                        # 1=also push to Docker Hub
SKIP_DEPLOY="${SKIP_DEPLOY:-0}"                        # 1=build only, no deploy
BUILDER_NAME="${BUILDER_NAME:-testprep-quiz-builder}"

# Verbosity
TRACE="${TRACE:-0}"
SSH_VERBOSE="${SSH_VERBOSE:-0}"
DOCKER_VERBOSE="${DOCKER_VERBOSE:-0}"
RETRIES="${RETRIES:-3}"
SLEEP_BETWEEN="${SLEEP_BETWEEN:-2}"
######## END CONFIG #########

[[ "$TRACE" == "1" ]] && set -x

ts() { date +"%Y-%m-%d %H:%M:%S"; }
log() { echo "[$(ts)] $*"; }
die() { echo "[$(ts)] ❌ $*" >&2; exit 1; }

[[ "$TARGET" == "pi" || "$TARGET" == "lightsail" ]] || die "TARGET must be 'pi' or 'lightsail' (got: $TARGET)"

SSH_COMMON_OPTS=(-o StrictHostKeyChecking=no -o ConnectTimeout=10)
[[ "$SSH_VERBOSE" == "1" ]] && SSH_COMMON_OPTS+=(-vvv)

need() { command -v "$1" >/dev/null 2>&1 || die "Missing dependency: $1"; }
need docker
need security
need ssh
need scp
[[ "$TARGET" == "pi" ]] && need sshpass

if ! docker info >/dev/null 2>&1; then
  die "Docker daemon is not running. Please start Docker Desktop."
fi
if ! docker buildx version >/dev/null 2>&1; then
  die "Docker buildx not available. Update Docker to latest version."
fi

log "✅ Prerequisites check passed"
log "🎯 Target: ${TARGET}"

# --- Target-specific defaults ---
if [[ "$TARGET" == "lightsail" ]]; then
  PLATFORMS="${PLATFORMS:-linux/amd64}"
  REMOTE_USER="${LIGHTSAIL_REMOTE_USER}"
  if [[ -n "${LIGHTSAIL_IP:-}" ]]; then
    REMOTE_HOST="${LIGHTSAIL_IP}"
  elif REMOTE_HOST=$(security find-generic-password -s "lightsail_ip" -w 2>/dev/null) && [[ -n "${REMOTE_HOST:-}" ]]; then
    log "🔑 Lightsail IP from Keychain"
  else
    die "Lightsail IP required — set LIGHTSAIL_IP env var or store in Keychain:
    security add-generic-password -s lightsail_ip -a lightsail -w <IP>"
  fi
  [[ -f "$LIGHTSAIL_KEY" ]] || die "SSH key not found: ${LIGHTSAIL_KEY} (set LIGHTSAIL_KEY env var)"
  REMOTE_DIR="${REMOTE_DIR:-/data/test-prep-quiz}"
  REMOTE_COMPOSE="${REMOTE_COMPOSE:-${REMOTE_DIR}/docker-compose-lightsail.yml}"
  COMPOSE_LOCAL="docker-compose-lightsail.yml"
else
  PLATFORMS="${PLATFORMS:-linux/arm64}"
  COMPOSE_LOCAL="docker-compose-headless-quiz.yml"
  # REMOTE_DIR / REMOTE_COMPOSE set after SSH (need $HOME from Pi)
fi

# --- SSH/SCP helpers ---
ssh_exec() {
  if [[ "$TARGET" == "lightsail" ]]; then
    ssh "${SSH_COMMON_OPTS[@]}" -i "${LIGHTSAIL_KEY}" "${REMOTE_USER}@${REMOTE_HOST}" "$1"
  else
    sshpass -p "$PASSWORD" ssh "${SSH_COMMON_OPTS[@]}" "${REMOTE_USER}@${REMOTE_HOST}" "$1"
  fi
}

scp_file() {
  if [[ "$TARGET" == "lightsail" ]]; then
    scp "${SSH_COMMON_OPTS[@]}" -i "${LIGHTSAIL_KEY}" "$@"
  else
    sshpass -p "$PASSWORD" scp "${SSH_COMMON_OPTS[@]}" "$@"
  fi
}

ssh_retry() {
  local i=1
  while true; do
    if ssh_exec "$1"; then return 0; fi
    if (( i >= RETRIES )); then return 1; fi
    log "⏳ SSH cmd failed (attempt ${i}/${RETRIES}), retrying in ${SLEEP_BETWEEN}s…"
    sleep "$SLEEP_BETWEEN"
    ((i++))
  done
}

# --- Connectivity setup ---
if [[ "$SKIP_DEPLOY" != "1" ]]; then
  if [[ "$TARGET" == "pi" ]]; then
    log "🔑 Fetching password from keychain service: ${PI_KEYCHAIN_SERVICE}"
    PASSWORD=$(security find-generic-password -s "$PI_KEYCHAIN_SERVICE" -w) || die "Could not read password from Keychain ($PI_KEYCHAIN_SERVICE)."
  fi

  log "📡 Testing SSH connectivity to ${REMOTE_USER}@${REMOTE_HOST}"
  if ! ssh_exec "echo ok" >/dev/null 2>&1; then
    die "SSH connection failed. Check hostname/user/$( [[ "$TARGET" == "pi" ]] && echo 'password' || echo 'key' )."
  fi
  log "✅ SSH connectivity OK"

  if [[ "$TARGET" == "pi" ]]; then
    REMOTE_HOME=$(ssh_exec 'printf %s "$HOME"') || die "Could not determine remote HOME"
    log "🏠 Remote HOME is: ${REMOTE_HOME}"
    REMOTE_DIR="${REMOTE_DIR:-${REMOTE_HOME}/apps/test-prep-quiz}"
    REMOTE_COMPOSE="${REMOTE_COMPOSE:-${REMOTE_DIR}/docker-compose-quiz.yml}"
  fi
else
  log "⏭️  Skipping SSH checks (SKIP_DEPLOY=1)"
  if [[ "$TARGET" == "pi" ]]; then
    REMOTE_DIR="${REMOTE_DIR:-/home/${REMOTE_USER}/apps/test-prep-quiz}"
    REMOTE_COMPOSE="${REMOTE_COMPOSE:-${REMOTE_DIR}/docker-compose-quiz.yml}"
  fi
fi

# --- Build ---
log "🔧 Setting up docker buildx builder: ${BUILDER_NAME}"
START_BUILDER=$(date +%s)

if docker buildx inspect "${BUILDER_NAME}" >/dev/null 2>&1; then
  log "   Using existing builder: ${BUILDER_NAME}"
  docker buildx use "${BUILDER_NAME}"
else
  log "   Creating new builder: ${BUILDER_NAME}"
  docker buildx create --name "${BUILDER_NAME}" --use
fi

log "✅ Builder ready in $(( $(date +%s) - START_BUILDER ))s"

if [[ "$DOCKER_VERBOSE" == "1" ]]; then
  PROGRESS_MODE="plain"
  log "   Using verbose build output (DOCKER_VERBOSE=1)"
else
  PROGRESS_MODE="auto"
fi

SERVER_TAR="/tmp/test-prep-quiz-server-${TAG}.tar"
WEB_TAR="/tmp/test-prep-quiz-web-${TAG}.tar"

build_image() {
  local name="$1"
  local repo="$2"
  local context="$3"
  local tar_file="$4"

  # Inject base path for the web image on Lightsail so Vite generates correct asset URLs
  local extra_args=()
  if [[ "$name" == "web" && "$TARGET" == "lightsail" ]]; then
    extra_args+=(--build-arg "VITE_BASE_PATH=/test-prep-quiz/")
  fi

  log ""
  if [[ "$DIRECT_COPY" == "1" ]]; then
    log "🐳 Building ${name}: ${repo}:${TAG} for ${PLATFORMS} (direct copy mode)"
    log "   Will save to: ${tar_file}"
  else
    log "🐳 Building & pushing ${name}: ${repo}:${TAG} for ${PLATFORMS} (Docker Hub mode)"
  fi

  local start_build
  start_build=$(date +%s)
  log "   Platforms: ${PLATFORMS}"
  log "   Progress: ${PROGRESS_MODE}"
  log ""
  log "⏳ Building ${name}..."

  if [[ "$DIRECT_COPY" == "1" ]]; then
    [[ "$PLATFORMS" == *","* ]] && die "DIRECT_COPY mode requires single platform (set PLATFORMS=linux/arm64 or linux/amd64)"
    docker buildx build \
      --platform "${PLATFORMS}" \
      -t "${repo}:${TAG}" \
      "${extra_args[@]+"${extra_args[@]}"}" \
      --output type=docker,dest="${tar_file}" \
      --progress="${PROGRESS_MODE}" \
      "${context}" || die "Docker build failed for ${name}"
  else
    docker buildx build \
      --platform "${PLATFORMS}" \
      -t "${repo}:${TAG}" \
      "${extra_args[@]+"${extra_args[@]}"}" \
      --push \
      --progress="${PROGRESS_MODE}" \
      "${context}" || die "Docker build failed for ${name}"
  fi

  local build_time=$(( $(date +%s) - start_build ))
  log ""
  log "✅ ${name} build completed in ${build_time}s ($((build_time/60))m $((build_time%60))s)"
  if [[ "$DIRECT_COPY" == "1" ]]; then
    log "   Image saved: ${tar_file} ($(du -h "${tar_file}" | cut -f1))"
  fi
}

START_BUILD=$(date +%s)

build_image "server" "${DOCKER_REPO_SERVER}" "./server" "${SERVER_TAR}"
build_image "web"    "${DOCKER_REPO_WEB}"    "./web"    "${WEB_TAR}"

TOTAL_BUILD_TIME=$(( $(date +%s) - START_BUILD ))
log ""
log "✅ All builds completed in ${TOTAL_BUILD_TIME}s ($((TOTAL_BUILD_TIME/60))m $((TOTAL_BUILD_TIME%60))s)"

if [[ "$DIRECT_COPY" == "1" && "$PUSH_TO_HUB" == "1" ]]; then
  log ""
  log "📤 Also pushing to Docker Hub (PUSH_TO_HUB=1)..."
  START_PUSH=$(date +%s)
  docker buildx build --platform "${PLATFORMS}" -t "${DOCKER_REPO_SERVER}:${TAG}" --push --progress="${PROGRESS_MODE}" ./server \
    || log "⚠️  Server push to Docker Hub failed"
  docker buildx build --platform "${PLATFORMS}" -t "${DOCKER_REPO_WEB}:${TAG}" --push --progress="${PROGRESS_MODE}" ./web \
    || log "⚠️  Web push to Docker Hub failed"
  log "✅ Pushed to Docker Hub in $(($(date +%s) - START_PUSH))s"
fi

if [[ "$SKIP_DEPLOY" == "1" ]]; then
  log ""
  log "🎉 Build complete! (Deployment skipped: SKIP_DEPLOY=1)"
  exit 0
fi

# --- Deploy ---
log ""
log "📡 Deploying to ${TARGET}: ${REMOTE_USER}@${REMOTE_HOST}"
log "📁 Creating remote dir: ${REMOTE_DIR}"
if [[ "$TARGET" == "lightsail" ]]; then
  ssh_retry "sudo mkdir -p '${REMOTE_DIR}' && sudo chown ubuntu:ubuntu '${REMOTE_DIR}'" || die "Could not create ${REMOTE_DIR}."
else
  ssh_retry "mkdir -p '${REMOTE_DIR}'" || die "Could not create ${REMOTE_DIR}."
fi
log "✅ Remote directory ready"

log "📝 Uploading compose: ${COMPOSE_LOCAL} -> ${REMOTE_COMPOSE}"
scp_file "${COMPOSE_LOCAL}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_COMPOSE}" || die "SCP of compose file failed"
log "✅ Compose uploaded"

if [[ "$DIRECT_COPY" == "1" ]]; then
  log ""
  log "🚀 Transferring Docker images to ${TARGET}..."
  START_TRANSFER=$(date +%s)

  REMOTE_SERVER_TAR="${REMOTE_DIR}/server-image.tar"
  REMOTE_WEB_TAR="${REMOTE_DIR}/web-image.tar"

  log "📦 Copying server image: ${SERVER_TAR} -> ${REMOTE_SERVER_TAR}"
  scp_file "${SERVER_TAR}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_SERVER_TAR}" || die "SCP of server image tar failed"

  log "📦 Copying web image: ${WEB_TAR} -> ${REMOTE_WEB_TAR}"
  scp_file "${WEB_TAR}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_WEB_TAR}" || die "SCP of web image tar failed"

  TRANSFER_TIME=$(( $(date +%s) - START_TRANSFER ))
  log "✅ Images transferred in ${TRANSFER_TIME}s ($((TRANSFER_TIME/60))m $((TRANSFER_TIME%60))s)"

  log "📥 Loading images on ${TARGET}..."
  START_LOAD=$(date +%s)
  ssh_retry "docker load -i '${REMOTE_SERVER_TAR}'" || die "docker load failed for server"
  ssh_retry "docker load -i '${REMOTE_WEB_TAR}'"    || die "docker load failed for web"
  log "✅ Images loaded in $(($(date +%s) - START_LOAD))s"

  log "🧹 Cleaning up tar files..."
  ssh_retry "rm -f '${REMOTE_SERVER_TAR}' '${REMOTE_WEB_TAR}'" || log "⚠️  Could not remove remote tar files"
  rm -f "${SERVER_TAR}" "${WEB_TAR}" || log "⚠️  Could not remove local tar files"

  log "🔁 Starting services..."
  ssh_retry "cd '${REMOTE_DIR}' && DOCKER_REPO_SERVER='${DOCKER_REPO_SERVER}' DOCKER_REPO_WEB='${DOCKER_REPO_WEB}' docker compose -f '${REMOTE_COMPOSE}' up -d" \
    || die "docker compose up failed"
  log "✅ Services started"
else
  log ""
  log "🔁 Pulling images from Docker Hub and restarting services..."
  ssh_retry "cd '${REMOTE_DIR}' && DOCKER_REPO_SERVER='${DOCKER_REPO_SERVER}' DOCKER_REPO_WEB='${DOCKER_REPO_WEB}' docker compose -f '${REMOTE_COMPOSE}' pull && docker compose -f '${REMOTE_COMPOSE}' up -d" \
    || die "docker compose pull/up failed"
  log "✅ Services updated"
fi

# Health check
if [[ "$TARGET" == "pi" ]]; then
  URL="http://${REMOTE_HOST}:8792"
  log "🩺 Health check: ${URL}"
  if ssh_exec "curl -fsS ${URL} >/dev/null"; then
    log "✅ App responds at ${URL}"
  else
    log "⚠️  Could not GET ${URL}. Services may still be starting."
  fi
else
  log "🩺 Checking containers on Lightsail..."
  if ssh_exec "docker ps --filter name=test-prep-quiz --format '{{.Names}} {{.Status}}'" 2>/dev/null | grep -q "Up"; then
    log "✅ Containers are running"
  else
    log "⚠️  Containers may not be up yet — check: ssh -i ${LIGHTSAIL_KEY} ubuntu@${REMOTE_HOST} docker ps"
  fi
fi

# Summary
TOTAL_TIME=$(( $(date +%s) - START_BUILD ))
log ""
log "🎉 Deployment complete!"
log ""
log "Summary:"
log "  • Server: ${DOCKER_REPO_SERVER}:${TAG}"
log "  • Web: ${DOCKER_REPO_WEB}:${TAG}"
log "  • Target: ${TARGET}"
log "  • Platforms: ${PLATFORMS}"
if [[ "$DIRECT_COPY" == "1" ]]; then
  log "  • Method: Direct copy (tar transfer)"
  [[ -n "${TRANSFER_TIME:-}" ]] && log "  • Transfer time: ${TRANSFER_TIME}s ($((TRANSFER_TIME/60))m $((TRANSFER_TIME%60))s)"
  [[ "$PUSH_TO_HUB" == "1" ]] && log "  • Also pushed to Docker Hub: Yes"
else
  log "  • Method: Docker Hub (registry pull)"
fi
log "  • Build time: ${TOTAL_BUILD_TIME}s ($((TOTAL_BUILD_TIME/60))m $((TOTAL_BUILD_TIME%60))s)"
log "  • Total time: ${TOTAL_TIME}s ($((TOTAL_TIME/60))m $((TOTAL_TIME%60))s)"
log "  • Remote: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"
[[ "$TARGET" == "pi" ]] && log "  • URL: http://${REMOTE_HOST}:8792"
log ""
