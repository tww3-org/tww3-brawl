<!--
Sync Impact Report
- Version change: (unset template) → 1.0.0
- Modified principles: n/a (initial ratification, all 5 slots filled for the first time)
- Added sections: Core Principles (I–V), Technology Stack Constraints, Development Workflow, Governance
- Removed sections: none (template placeholders only)
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md (generic "Constitution Check" gate reads this file dynamically — no edit needed)
  ✅ .specify/templates/spec-template.md (no constitution-specific references found)
  ✅ .specify/templates/tasks-template.md (no constitution-specific references found)
  ✅ .specify/templates/commands/*.md (none present in this repo)
  ⚠ README.md still contains only the raw health-formula scratchpad note; consider linking to Principle II once formulas move fully into packages/sdk docs (not blocking)
- Follow-up TODOs: none
-->

# TWW3 Brawl Constitution

## Core Principles

### I. Layered Monorepo Boundaries

Three packages exist, each with a single responsibility, and dependencies flow one
direction only: `apps/responsive-app` → `packages/sdk` → `packages/gql`.

- `@tww3-brawl/gql` is the API layer: a generated GraphQL client for
  `broker.twwstats.com`.
- `@tww3-brawl/sdk` is the domain/game-logic layer (unit health, damage,
  faction/unit data helpers). It MUST stay framework-agnostic — no Vue, Nuxt, or
  Quasar imports — so calculations remain independently testable and reusable
  outside the UI.
- `@tww3-brawl/responsive-app` is the presentation layer and MUST consume `sdk`
  and `gql` only through their published package entry points (`workspace:*`),
  never via relative imports reaching into another package's `src`.

Rationale: the existing split (`sdk/logic`, `sdk/data`, `sdk/utils` vs. the Nuxt
app's `components`/`composables`) already encodes this boundary; keeping it
explicit prevents UI concerns from leaking into game-formula code.

### II. Reverse-Engineered Game Fidelity

Total War: Warhammer 3's internal mechanics (unit health, damage, bonuses) are
not officially documented by Creative Assembly. Every formula implemented in
`sdk` MUST carry a comment citing its source of truth (community spreadsheet,
Discord thread, or documented in-game observation) and MUST flag known
unknowns or edge cases inline rather than silently guessing a behavior. When a
formula conflicts with newly observed game data, fix the `sdk` implementation
at its source rather than special-casing it in the UI layer.

Rationale: `getUnitHealth.ts` already follows this pattern (comments citing the
reference spreadsheet and open questions); it is the standard to keep so the
logic remains auditable in a domain with no authoritative spec.

### III. Generated Code Is Read-Only

Everything under `packages/gql/src` is produced by `genql` against
`https://broker.twwstats.com/graphql` (via the `gen-client` script). This
output MUST NOT be hand-edited. Schema or type changes are obtained by
regenerating the client, not by patching generated files. Derived or helper
types needed by consumers belong in `sdk`, not in `gql`.

Rationale: hand-edits to generated code silently drift from the real upstream
schema and get clobbered on the next regeneration.

### IV. Static-Site Deployability

`responsive-app` MUST remain buildable via `nuxt generate` and deployable as a
static site to GitHub Pages (see `.github/workflows/deploy-github-pages.yml`).
Features MUST NOT introduce server-only runtime requirements (Node server
APIs, middleware requiring a live backend) that break static generation. Data
is fetched directly from the public `broker.twwstats.com` GraphQL API; no
bespoke backend or database (e.g., Supabase) is to be reintroduced without an
explicit decision recorded in a spec or in this constitution.

Rationale: the README already documents that the Supabase dependency was
dropped in favor of fetching directly from the broker API, and the deploy
pipeline assumes a pure static bundle with no server runtime.

### V. Type Safety & Deliberate Simplicity

All packages use TypeScript in `strict` mode. `any` or type-suppression
comments MUST carry a justification when unavoidable (e.g., interfacing with
loosely-typed upstream data). As a solo/small-scale hobby project, prefer the
simplest working solution: no speculative abstractions, and no adopting
heavier tooling (additional CI stages, frameworks, task runners) until an
actual need exists. Calculation logic added or changed in `sdk` SHOULD include
a unit test (Jest is already configured for `sdk`) asserting against a known
reference value; if deferred, note the gap in the commit or PR description.

Rationale: matches the current codebase — strict TypeScript across all
`tsconfig.json` files, and a Jest setup that exists but is not yet backed by
tests — while being honest that test coverage is a goal, not yet an enforced
gate.

## Technology Stack Constraints

- Package manager: pnpm, pinned via the `packageManager` field in the root
  `package.json`. Do not switch to npm or yarn.
- Node.js >= 20.18.1 (per root `package.json` `engines`).
- Monorepo layout is fixed: `apps/*` for deployable applications, `packages/*`
  for shared libraries, wired through pnpm workspaces (`pnpm-workspace.yaml`).
- Frontend stack: Nuxt 3 + Vue 3 + Quasar + Pinia (with
  `pinia-plugin-persistedstate`) + TanStack Vue Query. New UI work uses this
  stack rather than introducing a competing framework or state library.
- Data source: the `broker.twwstats.com` GraphQL API, accessed exclusively
  through the genql-generated `gql` client — no hand-written queries that
  bypass its generated types.

## Development Workflow

- For non-trivial features, use the Speckit flow (`/speckit.specify` →
  `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`), with specs
  stored under `specs/`. Trivial fixes or tweaks do not require full spec
  ceremony.
- Build order follows the dependency chain: `gql` builds before `sdk`, which
  builds before `responsive-app` builds/generates — already encoded in
  `.github/workflows/deploy-github-pages.yml`. Do not reorder without updating
  that workflow.
- Keep commits small and semantic; existing history uses Conventional-Commit
  style prefixes (`feat:`, `fix:`, `refactor:`) — continue that convention.

## Governance

This constitution supersedes ad hoc conventions. When code and constitution
disagree, either fix the code or amend the constitution explicitly — don't
silently ignore either one.

Amendments are made by editing this file directly and bumping the version
according to semantic versioning:

- MAJOR: a principle is removed or redefined in a backward-incompatible way.
- MINOR: a new principle or section is added, or existing guidance is
  materially expanded.
- PATCH: wording, clarifications, or typo fixes with no semantic change.

Update `Last Amended` to the date of the change whenever the version bumps.

As a solo/small-scale project, compliance review means self-review before
merging to `main`; no separate approval body is required unless the project
grows a team, at which point this section should be amended.

**Version**: 1.0.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-10
