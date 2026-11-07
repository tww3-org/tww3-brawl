# Data Model: 003-spells-row

## SDK (`packages/sdk/src/types.ts`)

### `EffectDefinition.spell` (ajout)

```ts
/** Présent si l'effet est une partie d'un sort (ou de son overcast) : exclu de la ligne « Effets » */
spell?: { spell_id: string };
```

`spell_id` est l'id de la version : la clé simple, ou celle de l'overcast.

### `SpellVersion`

| Champ | Type | Règle |
|---|---|---|
| `id` | `string` | clé de l'ability (simple ou overcast) |
| `name` | `string` | nom lisible (même règle que `abilityEntries`) |
| `phases` | `SpellPhase[]` | ≥ 1 ; chaque phase est indépendante (R3) |

### `SpellPhase`

| Champ | Type | Règle |
|---|---|---|
| `id` | `string` | id de la phase du jeu |
| `duration` | `number` | secondes, > 0 (durée de la phase, sinon repli `active_time` ÷ nombre de phases retenues de la version) |
| `effects` | `string[]` | ids des `EffectDefinition` issues de cette phase dans `EFFECTS_CATALOG` (≥ 1 en 003 ; en 004, une phase de DoT pur peut en avoir 0) |

### `SpellDefinition`

| Champ | Type | Règle |
|---|---|---|
| `id` | `string` | = `normal.id` |
| `name`, `description?`, `icon` | `string` | comme `EffectDefinition` |
| `mana_cost` | `number` | > 0 |
| `normal` | `SpellVersion` | |
| `overcast?` | `SpellVersion` | depuis `overpower_option` ; absent = pas de puce |

Catalogue : `SPELLS_CATALOG: Record<string, SpellDefinition>` (généré), avec `getSpell(id)` et `listSpells(filter?)`.

### `SpellCasts` (entrée du moteur)

```ts
/** Lancers par sort pour un côté : compteurs entiers ≥ 0 */
type SpellCasts = Record<string /* spell id */, { normal: number; overcast: number }>;
```

### `SpellWindow` (interne au moteur)

| Champ | Type | Règle |
|---|---|---|
| `side` | `'left' \| 'right'` | côté qui lance |
| `spellId` | `string` | |
| `version` | `'normal' \| 'overcast'` | |
| `phaseId` | `string` | phase du sort |
| `instances` | `number` | `lancers × phase.duration / SECONDS_PER_ATTACK`, > 0 ; fractionnaire autorisé |

On n'en crée aucune pour un compteur à 0. Les fenêtres sont uniques par (side, spellId, version, phaseId), puisque les lancers additionnent leur durée.

### `DuelPhase`

| Champ | Type | Règle |
|---|---|---|
| `start` | `number` | borne incluse, en coups |
| `end` | `number` | borne exclue ; `Infinity` pour la dernière |
| `active` | `SpellWindow[]` | fenêtres telles que `instances > start` |
| `leftCardEffects`, `rightCardEffects` | `string[]` | ids d'effets de sort à **ajouter** aux `cardEffects` de chaque unité (routage self/enemy, R6) |

Invariants :
- `phases[0].start = 0` ;
- les phases sont contiguës ;
- la dernière est `[max nₑ, ∞)`, avec `active` vide ;
- sans sort, il n'y a qu'une seule phase `[0, ∞)`.

### `PhasedDuelInput` / résultat

```ts
interface DuelPhaseUnits { hits: number /* end - start */; left: UnitWithEntityNumber; right: UnitWithEntityNumber }
function calculatePhasedWinner(phases: DuelPhaseUnits[]): CombatResult
```

`CombatResult` est inchangé. On ajoute un champ optionnel `phases?: { start: number; end: number; leftNetTaken: number; rightNetTaken: number }[]`, que le résumé et la feature 004 utilisent.

## App (`apps/responsive-app/types/unit.ts`)

### `UnitSpellState` (ajout à `UnitWithEntityNumberAndBonus`)

```ts
spells?: { casts: SpellCasts }   // optionnel : absent des états persistés anciens
```

Transitions :
- **ajout d'un sort depuis le picker** : `casts[id] = { normal: 1, overcast: 0 }` ;
- **puce overcast activée** : `overcast` passe de 0 à 1 ;
- **puce désactivée** : `overcast` revient à 0 ;
- **compteurs** : bornés à 0..9 ;
- **retrait** : `delete casts[id]`.

Un sort à 0/0 reste affiché (grisé) jusqu'à son retrait.
