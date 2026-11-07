# Data Model: 004-spell-dots

## `SpellDot` (`packages/sdk/src/types.ts`)

| Champ | Type | Source | Règle |
|---|---|---|---|
| `damage_per_tick` | `number` | `phase.damage_amount` | > 0 |
| `chance` | `number` | `phase.damage_chance` | vide = 1 ; entre 0 et 1 |
| `max_entities` | `number` | `phase.max_damaged_entities` | vide ou ≤ 0 = toutes les entités (N = E) |
| `frequency` | `number` | `phase.hp_change_frequency` | vide ou ≤ 0 = 1 s |
| `duration` | `number` | `phase.duration` | > 0 |

`SpellVersion.dots?: SpellDot[]` contient les phases de DoT de la version (R1, R6). Une version peut maintenant avoir `effects: []` si elle a au moins un `dots`.

`SpellDot` n'a pas de champ cible : seuls les sorts dont la phase de DoT est `negative` sont retenus, et ils visent l'adversaire du lanceur.

## `DuelPhase` (extension de 003)

| Champ | Type | Règle |
|---|---|---|
| `dotsOnLeft`, `dotsOnRight` | `{ spellId: string; version: 'normal' \| 'overcast'; dots: SpellDot[]; spellDuration: number }[]` | DoT des fenêtres actives lancées par l'**autre** côté |

## `DotDamage` (sortie de `dotDamagePerHit`)

| Champ | Type | Sens |
|---|---|---|
| `perHit` | `number` | fraction de la vie de l'unité perdue par coup (même unité que les dégâts de mêlée) |
| `gross` | `number` | dégâts bruts par lancer (PV), avant plafonds et résistance |
| `lostOverkill` | `number` | PV perdus par plafond entité, par lancer |
| `lostEntities` | `number` | PV perdus par manque d'entités, par lancer |
| `resist` | `number` | ratio appliqué (≤ 0,9) |

## `CombatResult.phases[]` (extension)

On ajoute `leftDotTaken` et `rightDotTaken`, les dégâts de DoT par coup subis dans la phase. Le résumé y lit aussi la ventilation des pertes, par sort.
