#!/usr/bin/env bash
# .agents/hooks/verify-on-subagent-stop.sh
#
# Claude `SubagentStop` hook. When a sub-agent tries to hand back, run the
# project-wide checks the per-edit hook cannot afford (validate-on-edit.sh lints
# one file in ~1s; type checking needs the whole program):
#
#   pnpm typecheck   vue-tsc (app) + tsc --noEmit (sdk)   ~5s
#   pnpm lint        eslint on the whole repo              ~3s — also catches
#                    files written through Bash, which the per-edit hook misses
#
# Red -> exit 2: the sub-agent is NOT allowed to stop and receives the errors on
# stderr, so it fixes them before reporting back. Green or nothing to check ->
# exit 0, silent.
#
# Skipped (exit 0) when:
#   - the sub-agent is a read-only type (Explore, Plan, claude-code-guide, …)
#   - no TS/Vue/JS/JSON/tsconfig/package file differs from HEAD
#   - the exact same tree already passed in this session (fingerprint cache)
#   - this sub-agent was already blocked VERIFY_MAX_BLOCKS times (retry brake:
#     it gets to stop, and must report the failure itself — see CLAUDE.md)
#
# Env knobs:
#   VERIFY_ON_SUBAGENT_STOP=0   Kill-switch.
#   VERIFY_MAX_BLOCKS=3         Blocks per sub-agent before letting it stop.
#   VERIFY_TIMEOUT_S=180        Cap per command.
#   VERIFY_READONLY_AGENTS      Space-separated agent types never checked.

set -uo pipefail

[[ "${VERIFY_ON_SUBAGENT_STOP:-1}" == "0" ]] && exit 0

VERIFY_MAX_BLOCKS="${VERIFY_MAX_BLOCKS:-3}"
VERIFY_TIMEOUT_S="${VERIFY_TIMEOUT_S:-180}"
VERIFY_READONLY_AGENTS="${VERIFY_READONLY_AGENTS:-Explore Plan claude-code-guide statusline-setup}"
LOG_FILE="${TMPDIR:-/tmp}/verify-on-subagent-stop.log"

log() { printf '[verify %s] %s\n' "$(date +%H:%M:%S)" "$*" >>"$LOG_FILE" 2>/dev/null || true; }

PAYLOAD=""
[[ -t 0 ]] || PAYLOAD="$(cat)"

# Minimal flat-JSON string field reader (no jq dependency).
json_field() {
  printf '%s' "$PAYLOAD" | tr -d '\n' \
    | grep -oE "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -n1 \
    | sed -E 's/.*:[[:space:]]*"([^"]*)"/\1/'
}

AGENT_TYPE="$(json_field agent_type)"
AGENT_ID="$(json_field agent_id)"
SESSION_ID="$(json_field session_id)"
KEY="${AGENT_ID:-${SESSION_ID:-nosession}}"

for t in $VERIFY_READONLY_AGENTS; do
  [[ "$AGENT_TYPE" == "$t" ]] && { log "skip read-only agent $AGENT_TYPE"; exit 0; }
done

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[[ -n "$ROOT" ]] && cd "$ROOT" 2>/dev/null || { log "no project root"; exit 0; }

STATE_DIR="${TMPDIR:-/tmp}/verify-on-subagent-stop-$(printf '%s' "$ROOT" | cksum | cut -d' ' -f1)"
mkdir -p "$STATE_DIR" 2>/dev/null || true

# Only code that the checks look at counts as a change.
RELEVANT='\.(ts|mts|cts|tsx|vue|js|mjs|cjs|json)$'
changed="$( { git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } \
  | grep -E "$RELEVANT" | sort -u)"
[[ -z "$changed" ]] && { log "no relevant change vs HEAD"; exit 0; }

# Fingerprint of the relevant tree: same content already green -> skip.
fingerprint="$( { git diff HEAD -- $changed 2>/dev/null; for f in $changed; do [[ -f "$f" ]] && cksum "$f"; done; } | cksum | cut -d' ' -f1)"
[[ -f "$STATE_DIR/green" && "$(cat "$STATE_DIR/green")" == "$fingerprint" ]] && { log "tree already green"; exit 0; }

blocks_file="$STATE_DIR/blocks-$(printf '%s' "$KEY" | cksum | cut -d' ' -f1)"
blocks="$(cat "$blocks_file" 2>/dev/null || printf 0)"

TIMEOUT_BIN=""
for c in timeout gtimeout; do command -v "$c" >/dev/null 2>&1 && { TIMEOUT_BIN="$c"; break; }; done

run() {
  if [[ -n "$TIMEOUT_BIN" ]]; then "$TIMEOUT_BIN" "$VERIFY_TIMEOUT_S" "$@"; else "$@"; fi
}

report=""
tc_out="$(run pnpm typecheck 2>&1)"; tc_rc=$?
if (( tc_rc != 0 )); then
  # Keep the compiler diagnostics (`<pkg> typecheck: file(l,c): error TS…` and
  # their indented continuation lines), drop pnpm's run banners.
  errs="$(printf '%s\n' "$tc_out" | grep -E 'error TS|typecheck:  ' | sed -E 's|^([^ ]+) typecheck:  |  |; s|^([^ ]+) typecheck: |\1/|' | head -n 60)"
  report+="### pnpm typecheck (exit $tc_rc)
$errs
"
fi

lint_out="$(run pnpm lint 2>&1)"; lint_rc=$?
if (( lint_rc != 0 )); then
  report+="### pnpm lint (exit $lint_rc)
$(printf '%s\n' "$lint_out" | grep -vE '^(\s*$|> |.*ELIFECYCLE)' | head -n 60)
"
fi

if [[ -z "$report" ]]; then
  printf '%s' "$fingerprint" >"$STATE_DIR/green"
  rm -f "$blocks_file"
  log "green ($KEY)"
  exit 0
fi

blocks=$(( blocks + 1 ))
printf '%s' "$blocks" >"$blocks_file"
log "red ($KEY) block $blocks/$VERIFY_MAX_BLOCKS"

if (( blocks > VERIFY_MAX_BLOCKS )); then
  log "retry brake: letting $KEY stop while red"
  exit 0
fi

{
  printf '[verify-on-subagent-stop] Static checks are failing — do not hand back yet.\n'
  printf 'Fix the errors below (no @ts-ignore, no `as any`, no disabling rules), then finish again.\n'
  if (( blocks == VERIFY_MAX_BLOCKS )); then
    printf 'This is the last block: if you cannot fix them, stop and state clearly in your report that `pnpm typecheck`/`pnpm lint` are still red and why.\n'
  fi
  printf '\n%s' "$report"
} >&2
exit 2
