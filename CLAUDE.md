# tww3-brawl Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-07-27

## Active Technologies

- TypeScript (strict), Node.js >= 20.18.1 + Nuxt 3, Vue 3, Quasar, Pinia, TanStack Vue Query (app) ; `@tww3-brawl/gql` (genql client) consommé par `@tww3-brawl/sdk` (001-fix-duplicate-unit-cards)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript (strict), Node.js >= 20.18.1: Follow standard conventions

## Recent Changes

- 001-fix-duplicate-unit-cards: Added TypeScript (strict), Node.js >= 20.18.1 + Nuxt 3, Vue 3, Quasar, Pinia, TanStack Vue Query (app) ; `@tww3-brawl/gql` (genql client) consommé par `@tww3-brawl/sdk`

<!-- MANUAL ADDITIONS START -->
## Delegating code work to Sonnet sub-agents

All code-writing tasks (features, bug fixes, refactors, lint/type fixes, config
code, tests) are delegated to the **`implementer`** sub-agent
(`.claude/agents/implementer.md`, pinned to `model: sonnet`). If that agent is
not available in the session, spawn a general-purpose sub-agent with
`model: "sonnet"` and the same instructions.

The main agent keeps: understanding the request, investigation, planning,
splitting work, reviewing the sub-agent's diff, running the verification below
itself, committing/pushing and reporting to the user. Never relay a sub-agent's
claims unverified. Independent code tasks may run as parallel sub-agents when
they touch disjoint files.

Trivial edits that are not code (docs, CLAUDE.md, a one-line config value) can
be done directly.

## Static validation

- **On every edit (automatic):** `.agents/hooks/validate-on-edit.sh` is a
  `PostToolUse` hook (`.claude/settings.json`) that runs ESLint (`--fix
  --max-warnings=0`) on each `.ts/.vue/.js` file written with Edit/Write and
  JSON-parses `.json` files. A violation comes back as hook feedback: fix the
  code. Routing lives between the `BEGIN/END ROUTING TABLE` markers; the rest
  of the script is the generic runner from the `static-validation-hooks` skill
  (gh-agentic-workflow) — do not edit it. It needs `node_modules`
  (`pnpm install`).
- **When a sub-agent finishes (automatic):**
  `.agents/hooks/verify-on-subagent-stop.sh` is a `SubagentStop` hook that
  runs `pnpm typecheck` (vue-tsc + tsc, project-wide) and `pnpm lint`. If
  either is red, the sub-agent is not allowed to stop and gets the errors
  back to fix. Skipped for read-only agents (Explore, Plan…), when no
  TS/Vue/JS/JSON file differs from HEAD, or when the same tree already passed.
  After 3 blocks it lets the sub-agent stop: its report must then say the
  checks are still red. It also catches files written through Bash, which
  the per-edit hook misses.
- **Before every commit (main agent, mandatory):** `pnpm lint` and
  `pnpm typecheck` must both exit 0 — this covers edits the main agent made
  itself, which no `SubagentStop` hook sees.
- **Cloud session start (automatic):** `.agents/hooks/session-start.sh` is a
  `SessionStart` hook, active only when `CLAUDE_CODE_REMOTE=true`. It runs
  `pnpm install` (which also runs `nuxt prepare`) and builds the gql/sdk
  `dist/` when stale, so the two hooks above work on a fresh clone. It never
  blocks the session: on failure it prints a warning and logs to
  `$TMPDIR/session-start.log`.
- Kill-switches: `VALIDATE_ON_EDIT=0`, `VERIFY_ON_SUBAGENT_STOP=0`. All
  hooks are bash scripts (Git Bash on Windows).
<!-- MANUAL ADDITIONS END -->
