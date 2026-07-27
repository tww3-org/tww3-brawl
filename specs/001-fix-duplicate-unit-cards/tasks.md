---

description: "Task list for feature implementation"
---

# Tasks: Correction des cartes d'unités dédoublées avec nom brut non résolu

**Input**: Design documents from `/specs/001-fix-duplicate-unit-cards/`
**Prerequisites**: plan.md (available), spec.md (available). No research.md/data-model.md/contracts/ (not applicable — see plan.md Project Structure).

**Tests**: No automated test tasks are included. Jest is referenced by `packages/sdk/package.json`'s `test` script but is not actually installed in this repo (see plan.md Technical Context). Installing/configuring Jest for this scoped bug fix would be disproportionate tooling adoption (Constitution Principle V). Validation instead relies on TypeScript strict compilation (`tsc`) plus the explicitly requested deliverables: a Playwright-driven UI check and `curl` scripts against the GraphQL data source.

**Organization**: Tasks are grouped by user story (US1 = P1, US2 = P2) per spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions (from plan.md)

- `packages/sdk/src/utils/getUnitDisplayName.ts` — new shared helper (name validity + fallback)
- `packages/sdk/src/data/factionUnits.ts` — existing fetch function; add grouping/dedupe helper alongside it
- `apps/responsive-app/components/UnitCard/SelectUnit.vue` — consumes the new helpers
- `apps/responsive-app/components/UnitCard/index.vue` — consumes the new display-name helper

---

## Phase 1: Setup

**Purpose**: Confirm the workspace is ready to modify; no new dependencies are needed for this fix.

- [X] T001 Run `pnpm install` at repo root and `pnpm --filter @tww3-brawl/sdk build` to confirm a clean baseline build before changes (no code changes in this task)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared helper used by both user stories — MUST exist before either story's UI wiring is done.

**⚠️ CRITICAL**: T002-T004 block T005+ (US1) and T008+ (US2).

- [X] T002 [P] Create `packages/sdk/src/utils/getUnitDisplayName.ts` exporting:
  - `isRawTranslationKey(name: string | undefined | null): boolean` — detects the unresolved-translation pattern (e.g. `{{tr:...}}` or `{{...}}`) documented in spec.md Edge Cases; comment the pattern's origin (broker.twwstats.com localization miss) per Constitution Principle II.
  - `getUnitDisplayName(unit: Pick<Unit, 'unit' | 'land_unit'>): string` — returns `unit.land_unit.onscreen_name` when it is a non-empty string that is NOT a raw translation key; otherwise returns a humanized fallback derived from `unit.unit` (e.g. replace `_`/`-` with spaces, title-case).
  - `getUnitStableKey(unit: Pick<Unit, 'unit' | 'caste'>): string` — returns a stable identity key combining `unit.unit` and `unit.caste`, for use in dedup/grouping (replaces dedup-by-display-name).
- [X] T003 Export the three new functions from `packages/sdk/src/utils/index.ts`
- [X] T004 Run `pnpm --filter @tww3-brawl/sdk build` (tsc, strict mode) to confirm the new helpers compile with no type errors

**Checkpoint**: Shared helpers exist and compile — user story implementation can begin.

---

## Phase 3: User Story 1 - Ne plus voir de carte d'unité dupliquée (Priority: P1) 🎯 MVP

**Goal**: A hero/faction unit list shows exactly one card per logical unit, even when the backend returns a raw-name entry and a resolved-name entry for the same unit.

**Independent Test**: Open the detail view for a faction/hero known to be affected (Chaos - Slaanesh, DLC27, Styrkaar) and confirm only one card appears for that unit in its group.

### Implementation for User Story 1

- [X] T005 [US1] In `apps/responsive-app/components/UnitCard/SelectUnit.vue`, change the `groupedUnits` computed (currently grouping by `unit.land_unit?.onscreen_name` string, lines ~200-219) to dedupe by `getUnitStableKey(unit)` from `@tww3-brawl/sdk` instead of by display name.
- [X] T006 [US1] Within the same dedupe step, when multiple entries share a stable key: prefer the entry whose `getUnitDisplayName(unit)` is not derived from a raw-key fallback (i.e. prefer a genuinely valid backend name) over one that is; only fall back to the existing lowest-`recruitment_cost` tie-break when more than one entry has a valid name (or when none do).
- [X] T007 [US1] Update the alphabetical sort fallback in the same computed (currently comparing raw `onscreen_name` strings, lines ~231-233) to compare via `getUnitDisplayName(unit)` so a raw key never affects sort order incorrectly.

**Checkpoint**: User Story 1 is independently testable — duplicated cards should no longer appear for affected units.

---

## Phase 4: User Story 2 - Ne jamais afficher une clé de traduction brute à l'utilisateur (Priority: P2)

**Goal**: Wherever a unit's display name is rendered, a raw `{{tr:...}}` key is never shown — a readable fallback is used instead.

**Independent Test**: For a unit whose only surviving entry (post-dedupe) still has a raw `onscreen_name`, confirm the rendered card/label shows the humanized fallback, not the raw key.

### Implementation for User Story 2

- [X] T008 [P] [US2] In `apps/responsive-app/components/UnitCard/index.vue`, update the `unitTitle` computed (lines ~77-82) to use `getUnitDisplayName(unitSelection.value.unit)` from `@tww3-brawl/sdk` instead of reading `onscreen_name` directly.
- [X] T009 [P] [US2] In `apps/responsive-app/components/UnitCard/SelectUnit.vue`, update the unit picker label in `unitOptions` (line ~188: `u.land_unit?.onscreen_name || u.unit`) to use `getUnitDisplayName(u)` instead.
- [X] T010 [US2] Re-check `apps/responsive-app/components/UnitCard/SelectUnit.vue` for any other direct reads of `onscreen_name` used for display (e.g. around lines 206, 231-232, already covered by T005-T007) and confirm none bypass `getUnitDisplayName`.

**Checkpoint**: All user stories should now be independently functional — no duplicate cards, no raw translation keys ever shown.

---

## Phase 5: Polish & Validation

**Purpose**: Confirm the fix end-to-end and produce the requested deliverables.

- [X] T011 Run `pnpm --filter @tww3-brawl/sdk build` and `pnpm --filter @tww3-brawl/responsive-app build` (or `nuxt generate`) to confirm strict TypeScript compilation passes with no errors across both packages after all changes (closest available "lint" gate — no ESLint/Prettier tooling exists in this repo, see plan.md)
- [X] T012 Write a `curl` script (documented in `specs/001-fix-duplicate-unit-cards/`) that queries `https://broker.twwstats.com/graphql` with the same selection shape as `fetchFactionUnits` for the faction containing Styrkaar (DLC27, Chaos - Slaanesh), and shows the duplicate raw/resolved `onscreen_name` entries with matching `unit`/`caste` — validating the root-cause hypothesis (FR-001..FR-003) at the data layer, independent of the frontend fix
- [X] T013 Use Playwright MCP against a running `nuxt dev` instance to open the detail view for the Styrkaar hero/faction, scroll through the grouped unit lists (Lords/Heroes/Infantry/...), and capture a screenshot showing exactly one correctly-named Styrkaar card (validates SC-001, SC-002 for User Story 1 and 2) — no Playwright MCP tool was available in-session; validated instead with a headless Playwright script (`playwright` npm package, ephemeral scratch install, not added to the repo) driving real clicks/scrolls against `nuxt dev` on port 3001. Screenshot: `specs/001-fix-duplicate-unit-cards/validation/screenshot-styrkaar-fixed.png`.
- [X] T014 Spot-check at least one unaffected hero/faction (all entries already have valid names) via Playwright to confirm no regression in grouping, naming, or ordering (validates SC-003 / FR-006) — same script, faction "The Empire". Screenshot: `specs/001-fix-duplicate-unit-cards/validation/screenshot-regression-check.png`.

---

## Phase 6: Regression Fix (found by user review after T014)

**Context**: T005-T007 replaced name-based dedup with a `unit`+`caste` stable-key dedup. This broke a previously-working, intentional behavior: heroes/lords with multiple mount variants (each mount has its OWN `unit` id, e.g. `..._steed_of_slaanesh`, `..._daemonic_steed`) used to collapse into ONE card because they all shared the same resolved `onscreen_name` — dedup-by-name merged them. Dedup-by-stable-key does not, since each mount variant has a distinct `unit` id — regression: hero+mount families now show N duplicate cards. See spec.md FR-007 and Assumptions (2026-07-27 correction).

- [X] T015 In `packages/sdk/src/utils/getUnitDisplayName.ts`, replace/extend the grouping strategy: add a new exported function (e.g. `dedupeUnitEntries`) that groups a flat list of same-category units by **resolved display name** when valid (restores original mount-variant collapsing), and for entries with a **raw** name, matches them into an existing valid-name group by checking whether their `unit` id extends (`startsWith(baseUnitId + '_')`) the `unit` id of an entry that has a valid name in the same list — merging the raw mount-variant into its base hero's group instead of forming an isolated raw-named group. Only fall back to `getUnitDisplayName`'s humanized name (isolated group) when no valid-name sibling can be found at all. Remove `getUnitStableKey` if it becomes unused (it was based on the wrong assumption that `unit`+`caste` is a stable per-character key — it isn't, across mount variants). Done: `dedupeUnitEntries` added; `getUnitStableKey` confirmed unused (grep across repo) and removed from `getUnitDisplayName.ts` (its export from `index.ts` was via `export *`, no separate line to remove).
- [X] T016 In `apps/responsive-app/components/UnitCard/SelectUnit.vue`, replace the per-group dedup block (currently using `getUnitStableKey`) with a call to the new `dedupeUnitEntries` helper, keeping the existing cost-based tie-break and alphabetical sort by `getUnitDisplayName` unchanged. Done: import updated to `getUnitDisplayName, dedupeUnitEntries`; per-group block now calls `dedupeUnitEntries(unitsList)`; sort-by-cost-then-name left untouched.
- [X] T017 Rebuild (`pnpm --filter @tww3-brawl/sdk build`, `pnpm --filter @tww3-brawl/responsive-app build`) to confirm clean compilation. Both passed cleanly (strict tsc, then Nuxt client+server build), no errors.
- [X] T018 Re-validate via the same headless-Playwright approach as T013/T014: for the Slaanesh faction, confirm (a) "Styrkaar of the Sortsvinaer" still appears exactly once with a valid name, AND (b) known mount-variant hero/lord families (e.g. any label appearing multiple times in the original bug screenshot, such as "Chaos Lord of Slaanesh" or "Cultist of Slaanesh") now appear exactly ONCE each — count occurrences of every visible unit label in the Heroes/Lords/Infantry groups and confirm no duplicates remain. Save a new screenshot to `specs/001-fix-duplicate-unit-cards/validation/screenshot-mount-family-fixed.png`. Done: 68 unit cards in the Slaanesh picker, zero duplicate labels, Styrkaar exactly once, zero `{{tr:` text visible. Two DLC27 "daemonic steed" families (Herald of Slaanesh, Alluress) remain as isolated humanized-fallback cards (`Wh3 Dlc27 Sla Cha ... Daemonic Steed`) rather than merging with their resolved-name base card — confirmed via live GraphQL query that their `unit` id uses a different naming scheme (`wh3_dlc27_...`) than their base unit's id (`wh3_main_...`), so the `startsWith(baseUnitId + '_')` suffix check cannot detect the family relationship for this specific pair. This is the documented last-resort fallback (spec.md Assumptions), not a regression and not a duplicate; flagging as a known residual limitation of the suffix-matching heuristic, out of scope for this task's exact instructions.

---

## Phase 7: Mount Selection Name Stability (found by user review after Phase 6)

**Context**: Selecting a mount for a hero/lord via `MountPicker.vue` replaces the entire underlying `Unit` object (`selection.unit`) with the mounted variant's own fetched data (`fetchUnit`, keyed by the mount's `mounted_unit` id). That mounted variant has its own `land_unit.onscreen_name`, which can differ from — or even be a raw, unresolved `{{tr:...}}` key distinct from — the originally selected hero's name. Because every display spot reads `onscreen_name` (or `getUnitDisplayName`) off the CURRENTLY active `.selection.unit`, the card's title (and the comparison header, and the combat-result winner/loser names) visibly changes/breaks whenever a mount is picked. See spec.md FR-008, FR-009.

- [X] T019 In `packages/sdk/src/utils/getUnitDisplayName.ts`, extract the raw-key-guard + humanized-fallback logic into a generic `resolveDisplayName(rawName: string | undefined | null, fallbackId: string): string`, reimplement `getUnitDisplayName` on top of it, and add a new exported `getMountDisplayName(mount: { mount_name?: string | null; mounted_unit: string })` using the same helper (so mount labels get the identical raw-key guard as unit names, per FR-009). Done: `resolveDisplayName` added (internal, unexported), `getUnitDisplayName` reimplemented on top of it with identical external behavior, `getMountDisplayName` added and exported.
- [X] T020 In `apps/responsive-app/types/unit.ts`, add an optional `displayName?: string` field to the `UnitSelection` interface — this pins the name captured at the moment of the ORIGINAL hero/unit pick, independent of whatever `.unit` object later replaces it on a mount swap. Done.
- [X] T021 In `apps/responsive-app/components/UnitCard/index.vue`: in `updateUnitSelection` (the handler for the original pick from `SelectUnit`, NOT `updateUnit` which handles mount swaps), set `value.displayName = value.unit ? getUnitDisplayName(value.unit) : undefined` before emitting. Update the `unitTitle` computed to prefer `unitSelection.value?.displayName`, falling back to `getUnitDisplayName(unitSelection.value.unit)` when there's a unit but no pinned displayName (e.g. a unit loaded directly from a URL deep link), falling back to `'Unit Title'` when there's no unit at all. Do NOT set/touch `displayName` inside `updateUnit` — it must survive mount swaps unchanged (FR-008). Done: `updateUnit` left untouched.
- [X] T022 In `apps/responsive-app/components/UnitCard/MountPicker.vue`, use `getMountDisplayName(mount)` instead of the raw `mount.mount_name` in the dropdown item template (FR-009). Done.
- [X] T023 [P] In `apps/responsive-app/components/ShortSummary.vue`, update `winnerName`/`loserName` to read the pinned `selection.displayName` first (falling back to `getUnitDisplayName(selection.unit)`, then `'Unknown Unit'`), instead of reading `.selection.unit.land_unit.onscreen_name` directly — so the combat summary matches the pinned card title (FR-008). Done.
- [X] T024 [P] In `apps/responsive-app/components/DetailView/index.vue`, update the two header `<th>` cells (currently `leftUnit?.selection?.unit?.land_unit?.onscreen_name` / `rightUnit?.selection?.unit?.land_unit?.onscreen_name`) to read the pinned `selection.displayName` first, same fallback chain as T023 (FR-008). Done: extracted to `leftUnitName`/`rightUnitName` computeds (Nuxt auto-imports `computed`, matching this file's existing `ref`/`Ref` auto-import convention — no explicit `vue` import added).
- [X] T025 [P] In `apps/responsive-app/components/UnitCard/UnitPortrait.vue`, replace the three `unit.land_unit?.onscreen_name || unit.unit` `alt` attributes with `getUnitDisplayName(unit)` — this is decorative alt text tied to the currently-shown portrait image, so it is NOT pinned (it may legitimately change with the mount), it just must never show a raw `{{tr:...}}` string (FR-009-equivalent guard). Done.
- [X] T026 Rebuild (`pnpm --filter @tww3-brawl/sdk build`, `pnpm --filter @tww3-brawl/responsive-app build`) to confirm clean compilation. Both passed cleanly (strict tsc, then Nuxt client+server build), no errors.
- [X] T027 Re-validate with the same headless-Playwright approach as prior phases: pick a hero/lord known to have multiple mounts, note the card's title, open the mount picker, select several different mounts in turn, and confirm the card title (and, if visible without requiring a second unit selected, the mount-picker's own dropdown labels) never changes and never shows raw `{{tr:...}}` text. Screenshot to `specs/001-fix-duplicate-unit-cards/validation/screenshot-mount-name-stable.png`. Done: candidate "Chaos Lord of Slaanesh" (Slaanesh faction) selected via the grouped picker; mount dropdown showed 4 labels ("Chaos Steed", "Chaos Chariot", "Daemonic Steed", "On Foot"), none raw; card title stayed "Chaos Lord of Slaanesh" identically after switching to Chaos Steed, Chaos Chariot, and Daemonic Steed in turn; zero `{{tr:` occurrences visible on the page throughout. Verdict: PASS. Note: this particular hero's mount names all happened to already be valid/resolved in live data, so the raw-mount-name fallback path (`getMountDisplayName`'s humanize branch) was not directly exercised by an actual raw example — the title-stability assertion (the core regression) and the "never raw" assertion were both verified against real data.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS both user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2.
- **User Story 2 (Phase 4)**: Depends on Foundational. Independent of US1 (touches different call sites), though T010 double-checks overlap with US1's file.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### Parallel Opportunities

- T002 has no [P] peer at its own step (single new file) but Phase 2 tasks T002 and later T003 are sequential (index depends on the file existing); T004 is a build check after both.
- T008 and T009 are [P] — different files, no shared dependency.
- US1 (Phase 3) and US2 (Phase 4) touch overlapping lines in `SelectUnit.vue` (T005-T007 vs T009-T010) — implement sequentially within that file even though the stories are conceptually independent, to avoid merge conflicts on the same computed properties.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational helpers).
2. Complete Phase 3 (US1) — eliminates the duplicate-card symptom, the most visible bug.
3. Validate independently (open Styrkaar detail view, confirm single card) before moving on.

### Incremental Delivery

1. Setup + Foundational → helpers ready.
2. US1 → duplicate cards gone → quick manual check.
3. US2 → raw key text never shown, even for any residual single-entry raw-name cases → quick manual check.
4. Polish → curl + Playwright deliverables produced and reviewed.

## Notes

- Both user stories share the same two files touched (`SelectUnit.vue`, `index.vue`); implement in the order given (US1 then US2) rather than in parallel to avoid clobbering the same computed properties.
- No new external dependency, no GraphQL schema change, no new persisted entity.
- Deliverables required by the user's brief: one `curl` script per backend use-case (T012) and one Playwright screenshot per frontend user story (T013 for US1+US2 combined view, T014 for the regression check).
