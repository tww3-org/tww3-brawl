---
description: "Tasks for 003-spells-row"
---

# Tasks: Ligne « Sorts » et application des sorts par phases

**Input**: `specs/003-spells-row/` (plan.md, spec.md, research.md, data-model.md, contracts/)

**Tests**: demandés (SC-001, SC-003) : tests vitest du moteur et non-régression.

**Branch**: créer `003-spells-row` depuis `release/spells`, puis ouvrir une PR vers `release/spells`.

**Gates avant chaque commit**: `pnpm lint && pnpm typecheck && pnpm test`

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [ ] T001 Créer la branche `003-spells-row` depuis `release/spells` ; `pnpm install` ; vérifier que `pnpm test` est vert avant toute modification (référence de non-régression).

---

## Phase 2: Foundational (bloquant)

**Purpose**: types, données et moteur de phases, dont dépendent toutes les stories.

- [ ] T002 Ajouter à `packages/sdk/src/types.ts` : `EffectDefinition.spell?: { spell_id: string }`, `SpellVersion`, `SpellDefinition`, `SpellCasts` (voir data-model.md).
- [ ] T003 Étendre `scripts/generate-effects-catalog.mjs` :
  - ajouter `mana_cost` et `active_time` à la requête `unit_special_ability`, plus `overpower_option{ key name icon_name tooltip unit_special_ability{…} phases{…} }` ;
  - un sort est une ability avec `mana_cost > 0` qui n'est pas la cible d'un `overpower_option` (R1) ;
  - ses `EffectDefinition` (et celles de son overcast) sont produites par `abilityEntries` et marquées `spell: { spell_id }` ;
  - phases selon R3 : pour les sorts, ne pas fusionner les étages ; une `SpellPhase` par phase de durée > 0, hors `*_miscast`, avec les ids d'`EffectDefinition` qu'elle produit ; exclure les sorts sans aucune phase retenue ;
  - dédoublonnage R5 ;
  - écrire `packages/sdk/src/data/spells/catalog.generated.ts` (`SPELLS_CATALOG`) ;
  - logs : nombre de sorts, nombre avec overcast ;
  - commenter les hypothèses (constitution II).
- [ ] T004 Lancer `node scripts/generate-effects-catalog.mjs 4512102377651127604` pour régénérer les deux catalogues ; vérifier Glean Magic (23 s / overcast 46 s, sans sa phase miscast) et Heart of Winter (4 phases indépendantes) et l'absence de clés `*_upgraded` au premier niveau de `SPELLS_CATALOG`.
- [ ] T005 [P] Créer `packages/sdk/src/data/spells/index.ts` (`getSpell`, `listSpells`, réexport) et l'exporter depuis `packages/sdk/src/index.ts`.
- [ ] T006 [P] Dans `packages/sdk/src/logic/applyEffects.ts`, faire ignorer les entrées `spell` par `getNativeCardEffects`, et ajouter un test dans `unitLayers.test.ts` ou à côté.
- [ ] T007 Créer `packages/sdk/src/logic/spellPhases.ts` :
  - `spellWindows(left, right, spells?)` : `instances = lancers × phase.duration / SECONDS_PER_ATTACK`, une fenêtre par (côté, sort, version, phase), aucune à 0 ;
  - `buildDuelPhases(windows, effects?, spells?)` : bornes = union triée et dédoublonnée des instances, plus une phase finale `Infinity` ; `active = fenêtres avec instances > start` ;
  - `leftCardEffects` / `rightCardEffects` routés self/enemy selon `EffectDefinition.target` (R6) ;
  - commentaire décrivant l'algorithme et l'hypothèse « empilement au début » ;
  - catalogues injectables pour les tests.
- [ ] T008 Créer `packages/sdk/src/logic/spellPhases.test.ts` couvrant C1 à C8 et C13 de `contracts/sdk-api.md`, avec un catalogue injecté.
- [ ] T009 Dans `packages/sdk/src/logic/twoSideCalculations.ts`, ajouter `calculatePhasedWinner(phases)` :
  - par phase, mêmes dégâts bruts et régénération qu'aujourd'hui ;
  - parcours par côté selon la spec, règle 5 ;
  - `burst` pris sur la dernière phase ;
  - `remainingHealth` du gagnant calculé à travers les phases ;
  - `stalemate` si aucun côté ne meurt ;
  - champ optionnel `phases` dans `CombatResult`.

  `calculateWinner(l, r)` devient `calculatePhasedWinner([{ hits: Infinity, left: l, right: r }])`.
- [ ] T010 Tests dans `packages/sdk/src/logic/combat.test.ts` : `combat.test.ts` existant inchangé et vert (C9) ; ajouter C10, C11 et C12.

**Checkpoint**: le moteur est testé et sans régression. Lot livrable seul, sans UI.

---

## Phase 3: User Story 1 — Lancer un sort de buff/debuff (P1) 🎯 MVP

**Goal**: ligne « Sorts » avec un compteur de lancers ; le duel est calculé par phases.

**Independent Test**: quickstart §3, étapes 1 à 3.

- [ ] T011 [US1] Dans `apps/responsive-app/types/unit.ts` :
  - ajouter `spells?: { casts: SpellCasts }` à `UnitWithEntityNumberAndBonus` ;
  - ajouter `duelPhases(left, right)`, qui appelle `spellWindows` puis `buildDuelPhases` et construit pour chaque phase les unités effectives : `layerContext` + `leftCardEffects` / `rightCardEffects` ajoutés à `cardEffects` ;
  - conserver `effectiveUnits` (affichage des stats, sans sort).
- [ ] T012 [US1] Dans `apps/responsive-app/stores/unitStore.ts` :
  - actions `addSpell(side, id)`, `setSpellCasts(side, id, version, n)` (bornes 0..9) et `removeSpell(side, id)` ;
  - `combatResult` utilise `calculatePhasedWinner(duelPhases(...))` ;
  - `setUnit` conserve `spells`.
- [ ] T013 [P] [US1] Créer `apps/responsive-app/components/DetailView/SpellIcon.vue` : icône, badge du total de lancers, clic +1, clic droit / appui long −1, menu avec compteurs et « Retirer », grisé à 0 (`contracts/ui-spells-row.md`).
- [ ] T014 [P] [US1] Créer `apps/responsive-app/components/DetailView/SpellPickerDialog.vue` sur le modèle d'`EffectPickerDialog.vue` : recherche et liste `listSpells()`.
- [ ] T015 [US1] Créer `apps/responsive-app/components/DetailView/SpellList.vue` (même structure qu'`EffectList.vue` : `max`, « +N », bouton « + ») et l'insérer sous la ligne « Effets » dans `DetailView/index.vue`, pour les deux côtés et sur mobile.
- [ ] T016 [US1] Dans `apps/responsive-app/components/DetailView/EffectPickerDialog.vue`, exclure les entrées `spell` (FR-009).
- [ ] T017 [US1] Dans `apps/responsive-app/composables/useUrlSync.ts`, encoder et décoder `s=<id>~<n>~<o>`, en ignorant les ids inconnus et en bornant les valeurs à 0..9.

**Checkpoint**: US1 est utilisable de bout en bout.

---

## Phase 4: User Story 2 — Overcast (P1)

**Independent Test**: quickstart §3, étape 4.

- [ ] T018 [US2] Dans `SpellIcon.vue`, ajouter la puce en bas à droite si `spell.overcast` existe : bascule `overcast` 0 ↔ 1, pleine si ≥ 1, compteur overcast détaillé dans le menu.
- [ ] T019 [P] [US2] Dans `SpellPickerDialog.vue`, ajouter l'indicateur « overcast disponible ». Les overcasts ne sont jamais listés seuls.
- [ ] T020 [US2] Ajouter dans `spellPhases.test.ts` le cas C6 (simple et overcast distincts, pas de cumul de durée entre eux), si ce n'est pas déjà fait en T008.

---

## Phase 5: User Story 3 — Chevauchements des deux côtés (P2)

- [ ] T021 [US3] Ajouter un test d'intégration SDK : deux unités réelles de fixture, sorts des deux côtés (C4 et C5), résultat égal au calcul à la main documenté dans le test (SC-003).

---

## Phase 6: User Story 4 — Résumé (P3)

- [ ] T022 [US4] Dans `apps/responsive-app/components/ShortSummary.vue`, ajouter une ligne par sort lancé : « Nom (×k, overcast ×j) : couvre N coups ».

---

## Phase 7: Polish

- [ ] T023 [P] Mettre à jour `apps/responsive-app/components/DetailView/CLAUDE.md`, s'il décrit les lignes de la vue, avec la ligne « Sorts ».
- [ ] T024 Dérouler `quickstart.md` en entier, puis `pnpm lint && pnpm typecheck && pnpm test` ; ouvrir la PR vers `release/spells`.

## Dependencies

- T002 → T003 → T004 → (T005, T006).
- T002 → T007 → T008 ; T009 → T010.
- La Phase 2 bloque les Phases 3 à 6.
- US2 dépend de T013 ; US3 de T009 ; US4 de T012.
- Parallélisables : T005 avec T006 ; T007/T008 avec T003/T004 (catalogue injecté) ; T013 avec T014 ; T019.

## Implementation Strategy

1. **Session A (moteur)** : T002, T007 à T010. C'est le plus critique et on peut le tester sans données réelles.
2. **Session B (données)** : T003 à T006.
3. **Session C (app)** : T011 à T022.

Livrer après chaque checkpoint.
