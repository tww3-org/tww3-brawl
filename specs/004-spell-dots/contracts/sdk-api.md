# Contract: API SDK (004-spell-dots)

```ts
export const SPELL_MAX_RESIST = 90;

/** Dégâts de DoT d'un sort subis par `defender` à chaque coup couvert, et ventilation des pertes */
export function dotDamagePerHit(
  dots: SpellDot[],
  spellDuration: number,
  defender: Unit,          // unité effective de la phase (résistances après buffs/debuffs)
  entityNumber: number,    // effectif de départ côté défenseur
): DotDamage;
```

`calculatePhasedWinner` : pour chaque phase, les dégâts subis par chaque côté valent `mêlée + Σ dotDamagePerHit(...).perHit − régénération`, bornés à 0 comme aujourd'hui.

## Comportements garantis (tests)

Fixture : Fate of Bjuna (10/tick, N 25, 1 s, 18 s), soit 180 par entité et par lancer.

| # | Cible (E, PV/entité) | Attendu par lancer |
|---|---|---|
| D1 | cavalerie (30, 400) | porté = 25 × 180 = 4500 ; pertes 0 |
| D2 | infanterie (120, 80) | porté = 25 × 80 = 2000 ; overkill = 25 × 100 = 2500 |
| D3 | entité unique (1, 5000) | porté = 180 ; manque d'entités = 24 × 180 = 4320 |
| D4 | magie 40 + ward 30 | × 0,30 |
| D5 | magie 60 + ward 50 | × 0,10 (plafond 90) |
| D6 | armure 200 vs armure 0 | identique |
| D7 | `perHit` | `porté × (1 − rés) × 4 / 18 / health.unit` |
| D8 | 2 lancers | fenêtre de 9 coups, même `perHit` |
| D9 | cible qui régénère | net = mêlée + DoT − régénération |
| D10 | aucun DoT | résultat identique à 003 |
| D11 | phase `positive` avec dégâts | ignorée par le générateur |
