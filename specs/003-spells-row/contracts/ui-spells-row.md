# Contract: UI ligne « Sorts » (003-spells-row)

## Placement

Dans `DetailView/index.vue`, une ligne « Sorts » est placée juste sous la ligne « Effets », une par côté. Elle utilise le même alignement (gauche collée au centre) et la même limite d'icônes (`max` 5 sur desktop, puis pastille « +N »). Elle a un bouton « + » qui ouvre `SpellPickerDialog`.

## `SpellIcon`

- **Icône** : celle du sort, servie par `getImageUrl(version, icon)` comme les effets.
- **Compteur de lancers** :
  - un badge en haut à droite affiche la somme `normal + overcast` ;
  - clic sur l'icône : `normal + 1` ;
  - clic droit ou appui long : `normal − 1`, sans descendre sous 0 ;
  - un menu au survol ou au tap affiche les deux compteurs détaillés (`−`/`+`) et un bouton « Retirer » ;
  - à 0 lancer total, l'icône est grisée.
- **Puce overcast** : petite pastille en **bas à droite**, présente seulement si `spell.overcast` existe.
  - Clic : `overcast` passe de 0 à 1 (pastille pleine) ou de ≥ 1 à 0 (pastille vide).
  - Le compteur overcast détaillé se règle dans le menu.
- **Tooltip** : nom, durée simple et overcast, coups couverts (`lancers × durée / 4`), description.

## `SpellPickerDialog`

- Même UX que `EffectPickerDialog` : recherche par nom et description.
- Liste `listSpells()` uniquement : jamais les overcasts seuls, jamais les doublons (R5).
- Chaque ligne affiche un indicateur « overcast disponible ».
- Sélectionner un sort l'ajoute avec `{ normal: 1, overcast: 0 }`. S'il est déjà présent, la sélection est sans effet.

## `EffectPickerDialog`

Il exclut toute entrée dont `spell` est défini.

## URL (`useUrlSync`)

- Segment `s=<spellId>~<normal>~<overcast>`, un par sort ayant au moins un compteur non nul.
- Au décodage, un id inconnu est ignoré et les compteurs sont bornés entre 0 et 9.

## Résumé (`ShortSummary`)

Pour chaque côté, une ligne par sort lancé : « Nom (×k, overcast ×j) : couvre N coups ». N est arrondi à 1 décimale. La ligne est absente s'il n'y a aucun lancer.
