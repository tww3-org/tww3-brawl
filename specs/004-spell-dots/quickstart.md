# Quickstart: valider 004-spell-dots

Prérequis : 003 mergée dans `release/spells`.

## 1. Données

```bash
node scripts/generate-effects-catalog.mjs 4512102377651127604
```

Vérifier :
- `SPELLS_CATALOG` contient « The Fate of Bjuna », une seule fois, avec `normal.dots = [{ damage_per_tick: 10, chance: 1, max_entities: 25, frequency: 1, duration: 18 }]` et `effects: []` ;
- environ 45 versions de sorts ont des `dots` ;
- aucun DoT issu d'une phase `positive`.

## 2. Moteur

```bash
pnpm --filter @tww3-brawl/sdk test
```

Les cas D1 à D11 de [contracts/sdk-api.md](./contracts/sdk-api.md) passent, ainsi que les tests de 003 (non-régression).

## 3. App

1. Mettre à gauche un lanceur quelconque et à droite une cavalerie. Ajouter Fate of Bjuna à gauche (1 lancer) : la cavalerie meurt plus vite et le résumé affiche « 0 % perdu ».
2. Remplacer la cible par de l'infanterie : le résumé affiche environ 56 % perdus (overkill).
3. Remplacer la cible par un Lord : le résumé affiche 96 % perdus (entités).
4. Ajouter à la cible un buff de résistance magique : les dégâts du DoT baissent. Ajouter de l'armure : ils ne changent pas.

## 4. Gates

```bash
pnpm lint && pnpm typecheck && pnpm test
```
