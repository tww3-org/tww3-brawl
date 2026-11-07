# Implementation Plan: Dégâts sur la durée (DoT) des sorts

**Branch**: `004-spell-dots` (feature, depuis `release/spells` **après le merge de 003**) → PR vers `release/spells` | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-spell-dots/spec.md`

## Summary

On ajoute les dégâts des sorts de DoT au duel par phases de 003.
- Le générateur extrait les paramètres de DoT des phases de sort et ajoute au catalogue les sorts de DoT purs.
- Le SDK calcule, pour chaque phase, les dégâts de DoT par coup subis par chaque côté :
  - moyenne par tick × ticks par lancer, plafonnée aux PV d'une entité ;
  - × `min(N, E)` × `(1 − min(magie + ward, 90 %))` ;
  - réparti sur les coups couverts par un lancer.
- Ces dégâts s'additionnent aux dégâts de mêlée de la phase, et la régénération est déduite du total.
- Le résumé affiche la part de DoT perdue, ventilée en overkill et manque d'entités.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js >= 20.18.1

**Primary Dependencies**: identiques à 003. Aucune nouvelle dépendance.

**Storage**: N/A. Aucun nouvel état : les lancers de 003 suffisent.

**Testing**: vitest (`packages/sdk`). `pnpm lint`, `pnpm typecheck` et `pnpm test`.

**Target Platform**: site statique (GitHub Pages).

**Project Type**: monorepo web (app Nuxt + SDK).

**Performance Goals**: négligeable, quelques multiplications par phase.

**Constraints**:
- Sans DoT, résultats identiques à 003 (FR-009).
- Plafond de résistance 90 % propre aux sorts. `calculateResistRatio` de la mêlée (plafond 95 %) n'est pas modifié.

**Scale/Scope**: 45 sorts avec phase de dégâts (Patch 9.0.0), overcasts compris ; 1 fonction SDK, 1 extension du générateur, 1 bloc du résumé.

## Constitution Check

| Principe | Statut | Comment |
|---|---|---|
| I. Frontières | ✅ | Toute la formule est dans `sdk` (`spellDots.ts`). L'app n'affiche que le résultat. |
| II. Fidélité au jeu | ✅ | La sémantique supposée des champs est commentée : `damage_amount` par entité et par tick, `damage_chance` vide = 1, N = `max_damaged_entities`, plafond par entité et par lancer, `effect_type: positive` ignoré. Le Fate of Bjuna sert de cas de référence dans les tests. |
| III. Code généré | ✅ | Catalogue régénéré par script, `packages/gql` intact. |
| IV. Statique | ✅ | |
| V. Simplicité | ✅ | Les DoT passent par les phases de 003, sans moteur parallèle. |

Re-check post-design : ✅.

## Project Structure

### Documentation (this feature)

```text
specs/004-spell-dots/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/sdk-api.md
└── tasks.md
```

### Source Code (repository root)

```text
scripts/generate-effects-catalog.mjs       # + damage_chance, max_damaged_entities ; SpellVersion.dots ; sorts DoT purs inclus
packages/sdk/src/
├── types.ts                               # + SpellDot ; SpellVersion.dots?
├── data/spells/catalog.generated.ts       # régénéré
├── logic/
│   ├── spellDots.ts                       # NOUVEAU : dotDamagePerHit(dot, attackerSpellCtx, defender, entityNumber)
│   ├── spellDots.test.ts                  # NOUVEAU : Bjuna × cavalerie / infanterie / entité unique, plafonds, 90 %
│   ├── spellPhases.ts                     # DuelPhase + dotsOnLeft / dotsOnRight
│   └── twoSideCalculations.ts             # calculatePhasedWinner ajoute les DoT reçus par phase
apps/responsive-app/
├── types/unit.ts                          # duelPhases transmet les DoT des phases
├── components/DetailView/SpellPickerDialog.vue  # sorts DoT purs visibles (aucun changement si basé sur listSpells)
└── components/ShortSummary.vue            # DoT par coup + % perdu (overkill / entités)
```

**Structure Decision**: même structure qu'en 003. Le nouveau module `spellDots.ts` reste à côté de `oneSideCalculations.ts`.

## Complexity Tracking

Aucune violation.
