# Implementation Plan: Ligne « Sorts » et application des sorts par phases

**Branch**: `003-spells-row` (feature) → PR vers `release/spells` | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-spells-row/spec.md`

## Summary

On ajoute une ligne « Sorts » à la carte d'unité. Chaque sort a un compteur de lancers, et une puce overcast donne à la version overcast son propre compteur. Le duel est découpé en **phases** : les instances couvertes par les sorts sont empilées au début du combat et les chevauchements sont calculés en réunissant les bornes des deux côtés.

Approche technique :
- **Données.** Le générateur produit, en plus du catalogue d'effets, un **catalogue de sorts**. Les sorts gardent leurs entrées `EffectDefinition` dans `EFFECTS_CATALOG` (`key`, `key__enemy`…), ce qui permet de réutiliser telles quelles les couches positives et négatives. Elles sont simplement marquées `spell` pour être exclues de la ligne « Effets ».
- **Moteur.**
  - Un module pur `spellPhases.ts` calcule les bornes de phases et les effets actifs par phase.
  - `calculatePhasedWinner` parcourt les phases.
  - `calculateWinner(l, r)` devient le cas « une seule phase ». Le résultat reste identique sans sort.
- **App.** Nouvel état `spells` par côté (store et URL), nouveaux composants `SpellList`, `SpellIcon` (compteur et puce overcast) et `SpellPickerDialog`. `effectiveUnits` est construit pour chaque phase.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js >= 20.18.1

**Primary Dependencies**:
- App : Nuxt 3, Vue 3, Quasar, Pinia (persist).
- SDK : aucune dépendance de framework.
- Générateur : `scripts/generate-effects-catalog.mjs` (Node, fetch GraphQL).

**Storage**: localStorage (pinia persist) + URL (`useUrlSync`). Aucun backend.

**Testing**: vitest (`packages/sdk`, `pnpm --filter @tww3-brawl/sdk test`). `pnpm lint` et `pnpm typecheck` sont obligatoires.

**Target Platform**: site statique (`nuxt generate`, GitHub Pages), desktop et mobile.

**Project Type**: monorepo web : app Nuxt + SDK + client gql généré.

**Performance Goals**: recalcul du duel instantané (< 16 ms) à chaque clic de compteur. Au plus 2 × (nombre de sorts lancés) + 1 phases ; chaque phase construit 2 unités effectives.

**Constraints**:
- Résultat strictement identique sans sort (FR-008).
- Catalogue généré non édité à la main.
- `packages/gql/src` est en lecture seule.

**Scale/Scope**: environ 250 sorts sélectionnables (Patch 9.0.0) ; 1 ligne UI, 3 composants, 1 module SDK, 1 extension du générateur.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Statut | Comment |
|---|---|---|
| I. Frontières du monorepo | ✅ | Phases, résolution et catalogue sont dans `sdk` (sans Vue). L'app ne fait que l'état, l'UI et l'assemblage. Dette existante non aggravée : imports `@tww3-brawl/sdk/src/...` déjà présents dans l'app ; les nouvelles API sont exportées par `packages/sdk/src/index.ts`. |
| II. Fidélité au jeu rétro-ingéniéré | ✅ | `spellPhases.ts` et le générateur commentent les hypothèses : 1 coup / 4 s, empilement au début, durée = plus longue phase pertinente, `overpower_option` = overcast. |
| III. Code généré en lecture seule | ✅ | Aucune modification de `packages/gql/src`. Le catalogue de sorts est généré par script. |
| IV. Site statique | ✅ | Les données sont générées au build et embarquées ; aucun appel serveur nouveau. |
| V. Typage strict & simplicité | ✅ | Les spells réutilisent `EffectDefinition` et les couches existantes plutôt qu'un second moteur de stats. Pas de `any`. |

Re-check post-design : ✅, aucune violation, donc pas de Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-spells-row/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── sdk-api.md        # API publique SDK (catalogue, phases, duel par phases)
│   └── ui-spells-row.md  # contrat UI (ligne, icône, puce, compteur, picker, URL)
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
scripts/
└── generate-effects-catalog.mjs          # + extraction des sorts (mana_cost, overpower_option, durée)

packages/sdk/src/
├── types.ts                              # + SpellDefinition, SpellCasts, EffectDefinition.spell
├── data/
│   ├── effects/catalog.generated.ts      # régénéré : entrées de sort marquées `spell`
│   └── spells/
│       ├── catalog.generated.ts          # NOUVEAU (généré) : SPELLS_CATALOG
│       └── index.ts                      # getSpell, listSpells
├── logic/
│   ├── spellPhases.ts                    # NOUVEAU : instances couvertes, bornes, effets actifs par phase
│   ├── spellPhases.test.ts               # NOUVEAU
│   ├── twoSideCalculations.ts            # + calculatePhasedWinner ; calculateWinner = 1 phase
│   ├── combat.test.ts                    # + non-régression sans sort
│   └── applyEffects.ts                   # getNativeCardEffects ignore les entrées `spell`
└── index.ts                              # exports

apps/responsive-app/
├── types/unit.ts                         # + UnitSpellState, duelPhases(), effectiveUnits par phase
├── stores/unitStore.ts                   # + setSpellCasts / addSpell / removeSpell ; combatResult par phases
├── composables/useUrlSync.ts             # + encodage `s=`
└── components/
    ├── DetailView/
    │   ├── index.vue                     # + ligne « Sorts » sous « Effets »
    │   ├── SpellList.vue                 # NOUVEAU
    │   ├── SpellIcon.vue                 # NOUVEAU : icône, compteur, puce overcast
    │   ├── SpellPickerDialog.vue         # NOUVEAU
    │   └── EffectPickerDialog.vue        # exclut les entrées `spell`
    └── ShortSummary.vue                  # + coups couverts par sort
```

**Structure Decision**: on garde le monorepo existant (`apps/responsive-app`, `packages/sdk`, `packages/gql`). Le code de phases va dans `packages/sdk/src/logic`, à côté des couches, et le catalogue de sorts dans `packages/sdk/src/data/spells`, comme les effets.

## Découpage en lots (pour sessions d'implémentation séparées)

1. **Données** : générateur et catalogue de sorts. Les entrées de sort sont exclues de la ligne « Effets ». Indépendant du reste.
2. **Moteur SDK** : `spellPhases.ts` + `calculatePhasedWinner` et leurs tests. Il dépend seulement des types, et on peut le tester avec un catalogue injecté.
3. **App** : état, URL, composants et résumé. Ce lot dépend de 1 et 2.

## Complexity Tracking

Aucune violation.
