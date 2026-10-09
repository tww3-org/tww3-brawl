#!/usr/bin/env bash
# .agents/hooks/session-start.sh
#
# Claude `SessionStart` hook — cloud sessions only ($CLAUDE_CODE_REMOTE=true).
# A cloud session starts on a fresh clone: no node_modules, no .nuxt/, no
# packages/*/dist. Without them the other two hooks cannot work:
#   - validate-on-edit.sh needs node_modules/.bin/eslint
#   - verify-on-subagent-stop.sh runs `pnpm typecheck`, which needs
#     .nuxt/tsconfig.json (nuxt prepare) and the gql/sdk dist/ builds
#
# Idempotent: pnpm install is a no-op on an up-to-date node_modules, and each
# build is skipped when its dist/ is newer than its sources. Never blocks the
# session: a failure prints a warning (shown to Claude) and exits 0.

set -uo pipefail

[[ "${CLAUDE_CODE_REMOTE:-}" == "true" ]] || exit 0

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
cd "$ROOT" 2>/dev/null || exit 0

LOG="${TMPDIR:-/tmp}/session-start.log"
failed=()

step() {
  local name="$1"; shift
  printf '[session-start] %s\n' "$name" >>"$LOG"
  if ! "$@" >>"$LOG" 2>&1; then
    failed+=("$name")
  fi
}

# Build a workspace package only when dist/ is missing or older than src/.
build_if_stale() {
  local pkg="$1" dir="$2"
  if [[ -d "$dir/dist" ]] && [[ -z "$(find "$dir/src" -newer "$dir/dist" -print -quit 2>/dev/null)" ]]; then
    return 0
  fi
  pnpm --filter "$pkg" build
}

# Also runs `nuxt prepare` (responsive-app postinstall), which creates .nuxt/.
step "pnpm install" pnpm install --frozen-lockfile --prefer-offline
step "build @tww3-brawl/gql" build_if_stale @tww3-brawl/gql packages/gql
step "build @tww3-brawl/sdk" build_if_stale @tww3-brawl/sdk packages/sdk

if (( ${#failed[@]} )); then
  printf '[session-start] setup incomplete — failed: %s. Lint/typecheck hooks may report environment errors until this is fixed. Log: %s\n' \
    "${failed[*]}" "$LOG"
fi
exit 0
