# Research: 004-spell-dots

Données Patch 9.0.0 (`4512102377651127604`).

## R1 — Où sont les DoT

- **Decision**: on prend les phases des sorts (simple et overcast) dont `damage_amount > 0` et `effect_type !== 'positive'`.
- **Rationale**: 45 sorts ont une telle phase. `damage_chance` est toujours vide, `hp_change_frequency` vaut 1 ou 2 s, et N (`max_damaged_entities`) vaut 1, 25 ou 75. Exemples :

  | Sort | Dégâts/tick | N | Fréquence | Durée |
  |---|---|---|---|---|
  | Fate of Bjuna | 10 | 25 | 1 s | 18 s |
  | Death Frost | 67 | 1 | 1 s | 20 s |
  | Flensing Ruin | 100 | 1 | 2 s | 22 s |
  | Chain Lightning | 4 | 75 | 1 s | 5 s |

  Omen of Spirits a une phase `positive` avec dégâts : elle est ignorée et signalée en commentaire.
- **Alternatives considered**: vortex, bombardements et projectiles (`special_ability.vortex`…). Ils sont hors périmètre : ce sont des dégâts directs, sans phase.

## R2 — Unité d'une « instance » et plafond

- **Decision**: une instance = les dégâts cumulés sur une entité pendant un lancer, `damage_amount × chance × durée / fréquence`, plafonnés aux PV max d'une entité (`defender.health.entity`).
- **Rationale**: c'est la seule lecture qui reproduit l'exemple de l'utilisateur. Bjuna fait 180 par entité : overkill sur l'infanterie (~60–100 PV), efficace sur la cavalerie et l'infanterie monstrueuse (~150–700 PV), et 24/25 instances perdues contre une entité unique. Un plafond par tick (10 PV) ne serait jamais atteint.
- **Alternatives considered**: plafond par tick (sans effet réel) ; pas de plafond (contraire à la demande).

## R3 — Nombre d'entités E

- **Decision**: `E = min(getMaxEntities(defender), entityNumber)`, l'effectif de départ déjà utilisé par le duel. `min(N, E)` instances portent.
- **Rationale**: modèle non simulationniste, cohérent avec la mêlée.

## R4 — Résistance

- **Decision**: `rés = min(résistance_magique + ward_save, 95) / 100`, valeurs de l'unité effective de la phase (donc après buffs et debuffs). Une valeur négative (faiblesse) est permise et augmente les dégâts, comme en mêlée. L'armure, la résistance physique et la résistance au feu ne s'appliquent pas.
- **Rationale**: décision utilisateur : même plafond que la mêlée (95). On **réutilise** `calculateResistRatio(attaquant magique non enflammé, défenseur)`, qui vaut exactement `min(95, ward + clamp(magie))`, au lieu de dupliquer la formule.

## R5 — Répartition sur les coups

- **Decision**: `DoT_par_coup = DoT_par_lancer × SECONDS_PER_ATTACK / durée_phase`. Le DoT s'applique dans toutes les phases de duel où la fenêtre de sa phase de sort est active. Le total sur k lancers vaut k × `DoT_par_lancer` (sauf mort avant).
- **Rationale**: c'est cohérent avec l'empilement au début de 003. La fenêtre dure `k × durée_phase / 4` coups.

## R6 — Sorts à plusieurs phases de DoT

- **Decision**: chaque phase est indépendante (R3 de 003). Un `SpellDot` est rattaché à **une** `SpellPhase`, et sa fenêtre et sa répartition utilisent la durée de cette phase.
- **Rationale**: décision utilisateur. Heart of Winter : 4 phases de 8 s, à 2/4/6/8 par tick (3/6/9/12 en overcast), toutes actives sur les 2 premiers coups. En jeu, ces étages sont probablement successifs ; on le commente (principe II).

## R7 — Ventilation des pertes (résumé)

- **Decision**: pour chaque DoT, on calcule `brut = moyenne_lancer × N` et `porté = instance × min(N,E)`.
  - Perte overkill : `(moyenne_lancer − instance) × min(N,E)`.
  - Perte entités : `moyenne_lancer × (N − min(N,E))`.
  - Les pourcentages sont rapportés au brut, avant résistance.
