---
description: "Tasks for 004-spell-dots"
---

# Tasks: Dégâts sur la durée (DoT) des sorts

**Input**: `specs/004-spell-dots/` (plan.md, spec.md, research.md, data-model.md, contracts/)

**Prérequis**: 003-spells-row mergée dans `release/spells`.

**Branch**: `004-spell-dots` depuis `release/spells`, puis PR vers `release/spells`.

**Gates avant chaque commit**: `pnpm lint && pnpm typecheck && pnpm test`

---

## Phase 1: Setup

- [ ] T001 Créer la branche `004-spell-dots` depuis `release/spells` (avec 003) ; vérifier que `pnpm test` est vert.

## Phase 2: Foundational

- [ ] T002 Dans `packages/sdk/src/types.ts`, ajouter `SpellDot` et `SpellVersion.dots?` ; `SpellVersion.effects` peut être vide si `dots` est non vide.
- [ ] T003 Dans `scripts/generate-effects-catalog.mjs` :
  - ajouter `damage_chance max_damaged_entities` à `PHASE_FIELDS` ;
  - construire `dots` pour chaque version (R1 : `damage_amount > 0`, `effect_type !== 'positive'`) ;
  - inclure les sorts de DoT purs, sans modificateur ;
  - inclure les DoT dans la clé de dédoublonnage ;
  - logs : nombre de versions avec DoT ;
  - commenter la sémantique supposée (constitution II).
- [ ] T004 Régénérer le catalogue (`node scripts/generate-effects-catalog.mjs 4512102377651127604`) et vérifier Fate of Bjuna (quickstart §1).
- [ ] T005 Créer `packages/sdk/src/logic/spellDots.ts` : `SPELL_MAX_RESIST`, `dotDamagePerHit` (R2 à R7), avec les sources et hypothèses en commentaire ; l'exporter.
- [ ] T006 Créer `packages/sdk/src/logic/spellDots.test.ts` couvrant D1 à D7 et D11 (fixture Bjuna, unités minimales).
- [ ] T007 Dans `packages/sdk/src/logic/spellPhases.ts`, ajouter `dotsOnLeft` / `dotsOnRight` dans `buildDuelPhases` (DoT des fenêtres actives de l'autre côté), avec tests.
- [ ] T008 Dans `packages/sdk/src/logic/twoSideCalculations.ts`, faire ajouter les DoT reçus à `calculatePhasedWinner` dans les dégâts de chaque phase, en parallèle de la régénération ; renseigner `phases[].leftDotTaken/rightDotTaken`. Tests D8 à D10 dans `combat.test.ts`.

**Checkpoint**: le moteur DoT est testé ; les tests de 003 restent verts.

## Phase 3: US1 + US2 — DoT appliqué avec ses plafonds (P1) 🎯

- [ ] T009 [US1] Dans `apps/responsive-app/types/unit.ts`, faire transmettre par `duelPhases` les `dotsOnLeft/Right` et les unités effectives de phase à `calculatePhasedWinner`.
- [ ] T010 [P] [US1] Dans `SpellPickerDialog.vue` et `SpellIcon.vue`, faire en sorte que les sorts de DoT purs apparaissent. Ajouter au tooltip « DoT : X/tick, N entités, durée ».

## Phase 4: US3 — Régénération (P2)

- [ ] T011 [US3] Ajouter un test d'intégration : cible qui régénère, DoT sur quelques coups puis stalemate (spec US3 §2).

## Phase 5: US4 — Résumé (P3)

- [ ] T012 [US4] Dans `apps/responsive-app/components/ShortSummary.vue`, afficher pour chaque sort de DoT lancé : dégâts par coup, % perdu par overkill et % perdu par entités.

## Phase 6: Polish

- [ ] T013 Dérouler `quickstart.md`, lancer les gates, puis ouvrir la PR vers `release/spells`.

## Dependencies

- T002 → T003 → T004 ; T002 → T005 → T006 ; T007 → T008.
- La Phase 2 bloque les Phases 3 à 5.
- T005/T006 sont parallélisables avec T003/T004.
