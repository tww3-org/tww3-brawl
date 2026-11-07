# Feature Specification: Ligne « Sorts » et application des sorts par phases

**Feature Branch**: `release/spells` (release) — branche de feature à créer depuis la release
**Created**: 2026-11-07
**Status**: Draft — specify
**Input**: "Ajouter une ligne différente des effets pour les sorts : on indique le nombre de fois qu'on lance chaque sort (pas un simple on/off, puisqu'on ajoute la durée). Les sorts viennent du GraphQL avec leur version overcast, sélectionnable via une puce en bas à droite du sort. Pas de simulation : on calcule combien d'instances de calcul un sort couvre, on les empile au début du combat, et on découpe le calcul en phases (avec / sans effet), en gérant les chevauchements de plusieurs sorts."

## Contexte

Le duel (`calculateWinner`) compte aujourd'hui un coup toutes les 4 s en moyenne (une **instance de calcul** = un coup). Les effets de la ligne « Effets » (feature 002) sont on/off et valent pour tout le combat. Les sorts ont une **durée** : un buff ou un debuff ne modifie que les instances qu'il couvre. Cette feature n'introduit la durée **que pour les sorts** ; les autres effets (passifs, capacités, contacts, régénération existante) ne changent pas de comportement.

## Source des données

Tout vient de `broker.twwstats.com/graphql` (client `@tww3-brawl/gql`) :

| Besoin | Champ |
|---|---|
| Liste des sorts | `abilities` (catalogue global de la version) |
| Est-ce un sort ? | `ability.unit_special_ability.mana_cost > 0` |
| Version overcast | `ability.overpower_option` (un `ability` complet, avec ses propres phases et sa propre durée) |
| Durée | `phase.duration` (repli : `special_ability.active_time`) |
| Effets sur les stats | `phase.stat_effects`, `imbue_*` — même traduction que la whitelist de la feature 002 |
| Cible | `special_ability.affect_self`, `target_friends`, `target_enemies` |

Constats sur Patch 9.0.0 :
- Il y a 417 capacités avec coût en mana. 193 d'entre elles pointent vers un overcast (176 overcasts distincts, en général `*_upgraded`, jamais cachés dans l'UI).
- 94 sorts simples ont des modificateurs de stats ; 11 ont plusieurs phases.
- 190 sorts n'ont aucune phase avec durée (vortex, bombardements, projectiles) : ils sont hors périmètre.
- Seules 11 unités sur 2658 listent leurs sorts dans `land_unit.abilities`. Les sorts d'un lanceur viennent de ses compétences de personnage, que le duel ne modélise pas. Le sélecteur de sorts propose donc **tout le catalogue de sorts**, comme le sélecteur d'effets de la feature 002, et non les seuls sorts de l'unité.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lancer un sort de buff/debuff un certain nombre de fois (Priority: P1)

L'utilisateur compare deux unités. Dans la carte d'une unité, une ligne « Sorts », distincte de la ligne « Effets », liste les sorts disponibles. Il ajoute un sort (par exemple un debuff d'armure sur l'ennemi) et règle le nombre de lancers (0, 1, 2…). Le résultat du duel reflète le fait que le debuff n'agit que sur les premiers coups du combat, pendant la durée cumulée des lancers.

**Why this priority**: c'est le cœur de la feature : sans durée, un sort de 12 s pèse autant qu'un passif sur tout le combat, ce qui fausse le résultat.

**Independent Test**: choisir un duel dont le résultat est connu, ajouter un sort de durée connue, vérifier que le nombre de coups pour gagner correspond au calcul par phases (voir Règles de calcul).

**Acceptance Scenarios**:

1. **Given** un duel sans sort, **When** l'utilisateur ajoute un debuff de 24 s lancé 1 fois sur l'ennemi, **Then** les 6 premiers coups (24 s / 4 s) sont calculés avec les stats modifiées, les suivants sans.
2. **Given** ce même sort, **When** l'utilisateur passe à 2 lancers, **Then** les durées s'additionnent : 12 coups sont couverts.
3. **Given** un sort à 1 lancer, **When** l'utilisateur met le compteur à 0, **Then** le sort reste visible dans la ligne mais n'a plus aucun effet sur le calcul (équivalent « off »).
4. **Given** un sort couvrant plus de coups que le combat n'en dure, **When** le duel est calculé, **Then** le résultat est identique à celui d'un effet actif tout le combat.

---

### User Story 2 - Choisir la version overcast d'un sort (Priority: P1)

Le sélecteur de sorts ne propose que les sorts simples. Chaque sort qui possède une version overcast affiche une **petite puce en bas à droite** de son icône. Elle permet de prendre aussi la version overcast, avec son propre compteur de lancers.

**Why this priority**: l'overcast change fortement les valeurs (stats, durée). Sans lui, les sorts des lanceurs sont sous-évalués.

**Independent Test**: ajouter un sort ayant un overcast, activer la puce, vérifier que les stats et la durée de la version overcast sont utilisées pour ses lancers.

**Acceptance Scenarios**:

1. **Given** le sélecteur de sorts ouvert, **When** l'utilisateur parcourt la liste, **Then** seules les versions simples apparaissent (pas de doublon « Upgraded »).
2. **Given** un sort ajouté qui a un overcast, **When** l'utilisateur regarde son icône, **Then** une puce en bas à droite indique qu'un overcast existe ; elle est absente pour un sort sans overcast.
3. **Given** la puce, **When** l'utilisateur l'active, **Then** la version overcast est ajoutée avec son propre compteur, et le simple et l'overcast peuvent être combinés (ex. 1 simple + 1 overcast).
4. **Given** 1 simple + 1 overcast, **When** le duel est calculé, **Then** ils sont traités comme deux effets distincts (leurs durées ne se cumulent pas entre elles) et leurs phases se chevauchent selon les règles de calcul.

---

### User Story 3 - Plusieurs sorts qui se chevauchent (Priority: P2)

L'utilisateur lance plusieurs sorts de durées différentes, des deux côtés. Le calcul découpe le combat en phases : au début tous les sorts sont actifs, puis ils s'arrêtent un par un.

**Why this priority**: c'est nécessaire dès qu'il y a deux sorts, mais la US1 apporte déjà de la valeur seule.

**Independent Test**: tests unitaires du découpage en phases avec des durées connues (voir l'exemple dans les règles de calcul).

**Acceptance Scenarios**:

1. **Given** un debuff A couvrant 6 coups et un buff B couvrant 2 coups, **When** le duel est calculé, **Then** il y a 3 phases : [0,2) A+B, [2,6) A seul, [6,∞) aucun sort.
2. **Given** un sort de l'unité de gauche couvrant 3 coups et un sort de l'unité de droite couvrant 5 coups, **When** le duel est calculé, **Then** les bornes de phases réunissent celles des deux côtés : [0,3), [3,5), [5,∞).

---

### User Story 4 - Comprendre l'impact des sorts dans le résumé (Priority: P3)

Le résumé du duel indique, pour chaque sort lancé, le nombre de coups couverts.

**Why this priority**: c'est de la lisibilité, le calcul est déjà juste sans elle.

**Independent Test**: lancer un sort, lire « couvre N coups » dans le résumé.

**Acceptance Scenarios**:

1. **Given** un sort de 24 s lancé 2 fois, **When** l'utilisateur lit le résumé, **Then** il voit que le sort couvre 12 coups.

---

### Edge Cases

- Sort sans durée (`duration` absente ou ≤ 0) : il est traité comme un effet instantané sans impact sur les stats du duel. Il n'est pas affiché dans la ligne « Sorts » tant qu'aucune feature (ex. 004 DoT) ne lui donne un effet.
- Sort dont aucun stat_effect ne touche le corps à corps (whitelist 002) : il n'est pas proposé, sauf s'il porte un DoT (feature 004).
- Nombre de coups couverts fractionnaire (ex. 10 s / 4 s = 2,5) : la valeur fractionnaire est conservée, et une phase peut finir au milieu d'un coup (on raisonne en espérance).
- Le combat se termine dans une phase avec sort : les phases suivantes sont ignorées.
- La dernière phase (sans sort) n'inflige aucun dégât net (régénération ≥ dégâts) : c'est un stalemate, comme aujourd'hui.
- Un même sort apparaît chez les deux unités : chaque côté a son propre compteur, ce sont deux effets distincts.
- Plusieurs entrées de sort ont le même nom et les mêmes phases (ex. « The Fate of Bjuna » existe en sort de lore, en sort lié, en variante de personnage). Le sélecteur les dédoublonne par nom + phases identiques et garde l'entrée de lore (`*_spell_<lore>_*`).
- Sort sans overcast : pas de puce.
- Les capacités qui n'ont pas de coût en mana (ex. Remouldered, Frenzy actif) restent dans la ligne « Effets » (on/off, tout le combat), sans changement.
- Un sort qui est déjà aujourd'hui dans la ligne « Effets » doit migrer vers la ligne « Sorts » et ne plus apparaître dans le sélecteur d'effets, sinon il serait compté deux fois.

## Règles de calcul

1. **Instances couvertes.** Une instance de calcul = un coup, T = 4 s. Pour chaque effet de sort *e* (un sort dans une version donnée, simple ou overcast, chez un côté donné) :
   `nₑ = (lancersₑ × duréeₑ) / T`. Plusieurs lancers du même effet additionnent leur durée.
2. **Empilement au début.** Toutes les instances couvertes sont placées au début du combat. Il n'y a pas de simulation : on ne choisit pas de moment de lancement.
3. **Bornes de phases.** On réunit les nₑ des deux côtés, on retire les doublons et on trie : `0 = b₀ < b₁ < … < b_m`, puis on ajoute une dernière phase `[b_m, ∞)`.
4. **Stats par phase.** La phase `[bᵢ, bᵢ₊₁)` contient tous les effets tels que `nₑ > bᵢ`. On y construit les deux unités effectives : effets on/off de la ligne « Effets » + effets de sort actifs. Tous les modificateurs du sort s'appliquent, aussi bien les buffs sur le lanceur que les debuffs sur l'ennemi, et ils affectent toutes les valeurs du calcul de cette phase (coups donnés comme coups reçus). On en déduit pour chaque côté les dégâts nets par coup `dᵢ`, régénération déduite.
5. **Parcours.** Pour chaque côté :
   ```
   vie = 1 (+ soins limités existants)
   coups = 0
   pour chaque phase i :
       L = bᵢ₊₁ − bᵢ    // ∞ pour la dernière phase
       si dᵢ × L ≥ vie :
           coups += vie / dᵢ
           fin
       sinon :
           vie −= dᵢ × L
           coups += L
   ```
   Si la dernière phase a `d ≤ 0` et que la vie n'est pas épuisée, c'est un stalemate. Le nombre de coups final est arrondi à l'entier supérieur. Le côté qui a besoin de moins de coups gagne, comme aujourd'hui.
6. **Sans sort**, il n'y a qu'une seule phase `[0, ∞)` et le résultat doit être strictement identique au calcul actuel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT constituer, depuis le GraphQL, un catalogue des sorts (capacités avec coût en mana > 0), avec leur durée, leurs modificateurs de stats et leur version overcast éventuelle. Les overcasts (cibles d'un `overpower_option`) n'apparaissent pas comme sorts sélectionnables à part entière.
- **FR-002**: Le système DOIT traduire les modificateurs de stats des sorts avec la même table de correspondance que les effets (feature 002), et en déterminer la cible (lanceur ou ennemi).
- **FR-003**: La carte d'unité DOIT afficher une ligne « Sorts » distincte de la ligne « Effets ».
- **FR-004**: Le sélecteur de sorts DOIT lister uniquement les versions simples.
- **FR-005**: Un sort ayant un overcast DOIT afficher une puce en bas à droite de son icône. Cette puce permet d'ajouter la version overcast.
- **FR-006**: Chaque version ajoutée (simple, overcast) DOIT avoir un compteur de lancers entier ≥ 0, réglable par l'utilisateur.
- **FR-007**: Le calcul du duel DOIT appliquer les sorts selon les règles de calcul ci-dessus : instances empilées au début, phases avec chevauchements, durées additionnées pour les lancers d'un même effet.
- **FR-008**: Sans sort lancé, le résultat du duel DOIT être identique au résultat actuel.
- **FR-009**: Les sorts NE DOIVENT plus apparaître dans le sélecteur de la ligne « Effets ».
- **FR-010**: La durée n'est prise en compte QUE pour les sorts. Les autres effets gardent leur comportement on/off sur tout le combat.
- **FR-011**: Le résumé du duel DOIT indiquer, pour chaque effet de sort lancé, le nombre de coups couverts.
- **FR-012**: Le moteur par phases DOIT exposer les bornes et le contenu de chaque phase, pour que la feature 004 (DoT) puisse y ajouter des dégâts par phase.

### Key Entities

- **Sort (SpellDefinition)** : identifiant, nom, icône, durée (s), cible, modificateurs (espace tww3-brawl), lien vers la version overcast (même structure).
- **Lancer de sort (SpellCast)** : sort, version (simple | overcast), côté (unité qui le porte), nombre de lancers.
- **Phase** : intervalle `[début, fin)` en instances de calcul, liste des effets de sort actifs, stats effectives des deux unités, dégâts nets par coup de chaque côté.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sur un jeu de duels de référence sans sort, 100 % des résultats (vainqueur, coups, vie restante) sont identiques avant et après la feature.
- **SC-002**: Un utilisateur ajoute un sort, active son overcast et règle 2 lancers en moins de 30 secondes, sans documentation.
- **SC-003**: Pour un sort couvrant n coups, le nombre de coups pour gagner calculé correspond au calcul à la main par phases, sur au moins 5 cas de test (1 sort, 2 lancers, overcast, chevauchement des deux côtés, sort plus long que le combat).
- **SC-004**: Aucun sort n'apparaît à la fois dans la ligne « Effets » et dans la ligne « Sorts ».

## Assumptions

- Un coup toutes les 4 s, valeur déjà utilisée par le duel.
- La ligne « Sorts » d'une unité contient les sorts lancés de son côté (par elle ou par un lanceur allié) : un buff vise cette unité, un debuff vise l'adversaire.
- « Sort » = capacité avec coût en mana. Les capacités actives sans mana restent des effets on/off (périmètre élargissable plus tard).
- La durée d'un sort est celle de sa phase. Pour un sort à plusieurs phases, on prend la plus longue phase qui porte des modificateurs pertinents, et ce cas est signalé en commentaire dans le code (principe II de la constitution).
- Les sorts n'ont pas de limite de lancers (mana, recharge) : c'est l'utilisateur qui fixe le nombre.
- Les compteurs de lancers suivent la même persistance que l'état des effets de la carte.
- Les effets de dégâts directs des sorts (DoT) sont hors périmètre : feature 004.
- Les vortex, bombardements et projectiles sont hors périmètre.
