# Quickstart: valider 003-spells-row

## Prérequis

```bash
pnpm install          # lance aussi nuxt prepare
pnpm --filter @tww3-brawl/sdk build
```

## 1. Données

```bash
node scripts/generate-effects-catalog.mjs 4512102377651127604
```

Le script affiche le nombre de sorts : ~250 attendus, soit un ordre de grandeur de 417 − 176 overcasts − doublons − sorts sans durée ni modificateur.

Vérifier :
- `SPELLS_CATALOG` contient un sort simple ayant un `overcast` (ex. Glean Magic : 23 s / 46 s) ;
- aucun overcast n'est une clé de premier niveau ;
- les entrées d'effets de sort ont un champ `spell`.

## 2. Moteur

```bash
pnpm --filter @tww3-brawl/sdk test
```

Les cas C1 à C12 de [contracts/sdk-api.md](./contracts/sdk-api.md) doivent passer, et `combat.test.ts` doit rester inchangé et vert (FR-008).

## 3. App

```bash
pnpm --filter @tww3-brawl/responsive-app dev
```

1. Choisir deux unités et noter le résultat du duel.
2. Ligne « Sorts », bouton « + » : chercher un debuff d'armure, l'ajouter. Il passe à 1 lancer et le résultat change.
3. Mettre le compteur à 0 : le résultat redevient celui noté à l'étape 1.
4. Sur un sort avec overcast, cliquer la puce en bas à droite : la version overcast est ajoutée et le résumé affiche ses coups couverts.
5. Recharger la page : l'état est conservé. Copier l'URL dans un autre onglet : même état.
6. Ouvrir le picker de la ligne « Effets » : aucun sort n'y figure.

## 4. Gates

```bash
pnpm lint && pnpm typecheck && pnpm test
```
