# Contract: API SDK (003-spells-row)

Exports publics de `@tww3-brawl/sdk` (`packages/sdk/src/index.ts`). Toutes les fonctions sont pures.

```ts
// data/spells
export const SPELLS_CATALOG: Record<string, SpellDefinition>;
export function getSpell(id: string): SpellDefinition | undefined;
export function listSpells(filter?: (s: SpellDefinition) => boolean): SpellDefinition[];

// logic/spellPhases
/** Fenêtres (instances couvertes) des sorts lancés par les deux côtés */
export function spellWindows(
  left: SpellCasts, right: SpellCasts,
  spells?: Record<string, SpellDefinition>,
): SpellWindow[];

/** Découpage en phases + ids d'effets de sort à injecter dans les cardEffects de chaque côté */
export function buildDuelPhases(
  windows: SpellWindow[],
  effects?: Record<string, EffectDefinition>,
  spells?: Record<string, SpellDefinition>,
): DuelPhase[];

// logic/twoSideCalculations
export function calculatePhasedWinner(phases: DuelPhaseUnits[]): CombatResult;
export function calculateWinner(left: UnitWithEntityNumber, right: UnitWithEntityNumber): CombatResult; // = 1 phase
```

## Comportements garantis (tests vitest)

| # | Entrée | Sortie attendue |
|---|---|---|
| C1 | aucun lancer | `buildDuelPhases` → `[{start:0,end:∞,active:[]}]` |
| C2 | A (24 s, 1 lancer) gauche | phases `[0,6)`, `[6,∞)` |
| C3 | A 2 lancers | `[0,12)`, `[12,∞)` |
| C4 | A = 6 coups, B = 2 coups | `[0,2)` A+B, `[2,6)` A, `[6,∞)` ∅ |
| C5 | gauche 3, droite 5 | `[0,3)`, `[3,5)`, `[5,∞)` |
| C6 | A simple 6 + A overcast 4 | 2 fenêtres distinctes, `[0,4)`, `[4,6)`, `[6,∞)` |
| C7 | 10 s (2,5 coups) | borne fractionnaire 2,5 conservée |
| C8 | effet de sort `target: enemy` lancé par gauche | id dans `rightCardEffects` de la phase |
| C9 | `calculateWinner(l,r)` vs avant la feature | même résultat sur tout `combat.test.ts` |
| C10 | sort couvrant plus de coups que le combat | même résultat que l'effet actif tout le combat |
| C11 | mort pendant la phase 1 de 3 | `hitsNeeded < end₁`, phases suivantes ignorées |
| C12 | dernière phase sans dégâts nets, vie non épuisée | `stalemate` (sauf si l'autre côté meurt) |
