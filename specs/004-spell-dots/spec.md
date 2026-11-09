# Feature Specification: Dégâts sur la durée (DoT) des sorts

**Feature Branch**: `release/spells` (release) — branche de feature à créer depuis la release, après 003
**Created**: 2026-11-07
**Status**: Draft — specify
**Depends on**: 003-spells-row (ligne « Sorts », compteur de lancers, moteur par phases)
**Input**: "Parcourir les effets des sorts pour les DoTs. Les dommages sont aléatoires : on prend la moyenne, capée par la santé maximum d'une entité de l'unité. Il y a un nombre d'entités affectées : si l'unité a au moins autant d'entités, tout porte, sinon on prend la proportion. Les DoTs s'appliquent en parallèle de la régénération et ne sont affectés que par la résistance magique + ward save (max 90 %), pas par l'armure." Précisions ultérieures : plafond de 95 %, comme en mêlée ; chaque phase d'un sort est indépendante.

## Contexte

Certains sorts infligent des dégâts répétés pendant leur durée : à chaque tick, jusqu'à N entités de la cible subissent un montant de dégâts. Exemple de référence, le Rire de Bjuna, « The Fate of Bjuna » dans les données (`wh_main_spell_death_the_fate_of_bjuna`) : 10 dégâts par tick, N = 25 entités, 1 tick/s pendant 18 s, soit 180 dégâts par entité touchée et par lancer :
- contre la cavalerie et l'infanterie monstrueuse, il est efficace ;
- contre l'infanterie, chaque instance dépasse les PV d'une entité (« overkill ») ;
- contre une entité unique, la plupart des instances sont perdues faute de cibles.

## Source des données

Champs de `phase` (GraphQL `broker.twwstats.com`) sur les phases des sorts (simple et overcast) :

| Donnée | Champ |
|---|---|
| Dégâts par instance et par tick | `damage_amount` |
| Probabilité de dégâts (aléa) | `damage_chance` |
| Nombre d'entités affectées N | `max_damaged_entities` |
| Intervalle entre ticks (s) | `hp_change_frequency` |
| Durée | `duration` |

La sémantique exacte de ces champs dans le jeu n'est pas documentée. Elle doit être commentée dans le code, conformément au principe II de la constitution.

Constats sur Patch 9.0.0 :
- 45 sorts ont une phase avec `damage_amount > 0` ; `damage_chance` y est toujours vide.
- Les valeurs de N vont de 1 (sorts « mono-cible » à gros dégâts, ex. Death Frost : 67/tick) à 25 ou 75.
- `hp_change_frequency` vaut 1 ou 2 s.
- Certains sorts ont plusieurs phases de DoT, par exemple Heart of Winter : 4 phases de 8 s, à 2/4/6/8 par tick (3/6/9/12 en overcast).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un sort de DoT inflige des dégâts dans le duel (Priority: P1)

L'utilisateur lance un sort de DoT (par exemple le Rire de Bjuna) sur l'ennemi depuis la ligne « Sorts ». Pendant les coups couverts par le sort, l'ennemi subit, en plus des coups de mêlée, les dégâts moyens du DoT, réduits par sa résistance aux sorts.

**Why this priority**: c'est la valeur de la feature : les sorts de dégâts n'ont aujourd'hui aucun poids dans le duel.

**Independent Test**: un duel avec et sans le sort ; l'écart de vie de la cible sur les coups couverts doit être égal à la formule.

**Acceptance Scenarios**:

1. **Given** une cible de cavalerie (E ≥ N, PV par entité ≥ dégâts cumulés d'une instance), **When** le sort est lancé 1 fois, **Then** la cible perd au total `N × dégâts d'une instance × (1 − rés)` PV, répartis uniformément sur les coups couverts, en plus de la mêlée.
2. **Given** le même sort, **When** l'utilisateur passe à 2 lancers, **Then** le DoT s'applique sur deux fois plus de coups.
3. **Given** une cible ayant 40 % de résistance magique et 30 % de ward save, **When** le DoT s'applique, **Then** la réduction est de 70 %. Avec 60 % + 50 %, elle est plafonnée à 95 % (même plafond que la mêlée).
4. **Given** une cible très armurée, **When** le DoT s'applique, **Then** l'armure ne réduit pas les dégâts du DoT.

---

### User Story 2 - Les pertes dues à la cible sont prises en compte (Priority: P1)

Les dégâts d'une instance sont plafonnés aux PV max d'une entité de la cible. Si la cible a moins d'entités que le DoT n'en touche, seule la proportion E/N des instances porte.

**Why this priority**: sans ces deux plafonds, un DoT pensé contre la cavalerie détruirait une entité unique ou de l'infanterie de façon irréaliste.

**Independent Test**: le même sort contre trois profils (cavalerie, infanterie, entité unique). Les dégâts suivent la formule dans chaque cas.

**Acceptance Scenarios**:

1. **Given** une infanterie dont les PV par entité (ex. 80) sont inférieurs aux dégâts cumulés d'une instance sur un lancer (180 pour Bjuna), **When** le DoT s'applique, **Then** chaque instance inflige au plus les PV d'une entité : 100/180 ≈ 56 % sont perdus (overkill).
2. **Given** une entité unique (E = 1) et le Rire de Bjuna (N = 25), **When** le DoT s'applique, **Then** seule 1 instance sur 25 porte.
3. **Given** une cavalerie avec E ≥ N et des PV par entité supérieurs aux dégâts moyens, **When** le DoT s'applique, **Then** aucune perte.

---

### User Story 3 - DoT et régénération en parallèle (Priority: P2)

Si la cible régénère, le DoT et la régénération s'appliquent ensemble sur chaque coup couvert. La régénération se déduit des dégâts totaux (mêlée + DoT).

**Why this priority**: c'est nécessaire pour ne pas fausser les duels contre les unités qui régénèrent, mais c'est moins fréquent.

**Independent Test**: une cible qui régénère, avec et sans DoT.

**Acceptance Scenarios**:

1. **Given** une cible qui régénère, **When** un DoT est actif sur la phase, **Then** les dégâts nets par coup valent `mêlée + DoT − régénération`.
2. **Given** une cible en stalemate (régénération ≥ mêlée), **When** le DoT couvre quelques coups, **Then** le DoT réduit la vie pendant ces coups, puis le stalemate reprend si la cible n'est pas morte.

---

### User Story 4 - Comprendre les pertes du DoT dans le résumé (Priority: P3)

Le résumé indique les dégâts du DoT par coup et le pourcentage perdu, avec la raison de la perte : overkill (plafond des PV par entité) ou manque d'entités (E < N).

**Why this priority**: c'est de la lisibilité, utile pour choisir sa cible.

**Independent Test**: le Rire de Bjuna (N = 25) contre une entité unique ; le résumé affiche 96 % perdus (manque d'entités).

**Acceptance Scenarios**:

1. **Given** un DoT contre de l'infanterie, **When** l'utilisateur lit le résumé, **Then** il voit le pourcentage perdu à cause de l'overkill.
2. **Given** un DoT contre une entité unique, **When** l'utilisateur lit le résumé, **Then** il voit le pourcentage perdu par manque d'entités.

---

### Edge Cases

- Sort de DoT sans aucun modificateur de stats : il doit quand même apparaître dans la ligne « Sorts » (élargit le filtre de 003).
- Sort avec DoT **et** modificateurs de stats : les deux s'appliquent dans les mêmes phases.
- `damage_chance` absent : il vaut 1. C'est le cas de tous les sorts de Patch 9.0.0.
- `hp_change_frequency` absent ou ≤ 0 : un tick par seconde. C'est la même convention que pour la régénération existante.
- `max_damaged_entities` absent ou ≤ 0 : le DoT touche toutes les entités de la cible (N = E).
- La cible est une unité montée ou un engin : on prend les PV de l'entité de la cible telle qu'utilisée par le calcul de vie existant.
- Le DoT vise le lanceur ou des alliés (`target_friends`) : il est ignoré dans le duel.
- Overcast : il a ses propres valeurs de DoT et ses propres instances couvertes. Il se cumule avec le simple selon les règles de phases de 003.

## Règles de calcul

Une **instance** de DoT est l'ensemble des dégâts qu'une entité touchée subit pendant **un lancer** d'une phase de sort. Pour chaque phase de DoT d'un sort (version simple ou overcast) et pour la cible :

- `moyenne_tick = damage_amount × damage_chance`, avec `damage_chance` vide = 1. Les dégâts aléatoires sont ramenés à leur moyenne.
- `ticks_par_lancer = durée_phase / hp_change_frequency`
- `instance = min(moyenne_tick × ticks_par_lancer, PV_max_entité_cible)`. Le plafond overkill porte sur le **cumul d'un lancer** : une entité ne peut pas perdre plus que ses PV.
- *(Révision)* Les PV courants `h` de l'entité touchée sont supposés uniformes sur `[0, H]` (H = PV max d'une entité) : `instance = E[min(D, h)]` = `H / 2` si `D ≥ H`, sinon `D − D² / (2H)` (ex. D = 70, H = 100 → 45,5). Calcul déterministe, appliqué à tous les DoT.
- `instances_portées = min(N, E)`, où E est le nombre d'entités **de départ** de la cible. On ne suit pas les entités restantes. Cela revient à appliquer `N × min(1, E/N)`.
- `rés = min(résistance_magique + ward_save, 95 %)`, le même plafond que la mêlée (`calculateResistRatio` avec une attaque magique non enflammée). L'armure et la résistance physique ne s'appliquent pas.
- `DoT_par_lancer = instance × instances_portées × (1 − rés)`, exprimé dans la même unité de vie que les dégâts de mêlée du duel (fraction de la vie de l'unité).
- **Répartition.** Un lancer couvre `durée_phase / T` coups (T = 4 s, feature 003). Chaque coup couvert reçoit `DoT_par_coup = DoT_par_lancer / (durée_phase / T)`. Avec k lancers empilés au début, la phase couvre `k × durée_phase / T` coups, avec le même `DoT_par_coup`.
- Les dégâts nets d'une phase de duel pour la cible valent `mêlée + Σ DoT_par_coup (DoT actifs) − régénération`.
- **Sort à plusieurs phases** (ex. Heart of Winter) : chaque phase est indépendante (feature 003). Elle a son propre DoT, sa propre durée et sa propre fenêtre de `lancers × durée_phase / T` coups. La « durée » des formules ci-dessus est celle de la phase.
- Une phase de DoT dont `effect_type` est `positive` est ignorée : ce n'est pas un dégât sur l'ennemi. Exemple à vérifier : Omen of Spirits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT extraire, pour chaque sort et sa version overcast, les paramètres de DoT de ses phases : dégâts, probabilité, entités affectées, fréquence, durée.
- **FR-002**: La ligne « Sorts » DOIT proposer les sorts de DoT visant l'ennemi, même sans modificateur de stats.
- **FR-003**: Le calcul DOIT appliquer le DoT dans chaque phase active selon les règles de calcul ci-dessus.
- **FR-004**: Les dégâts d'une instance (cumul sur une entité pendant un lancer) DOIVENT être la moyenne, plafonnée aux PV max d'une entité de la cible.
- **FR-005**: Le nombre d'instances qui portent DOIT être `min(N, E)`.
- **FR-006**: La réduction DOIT être `min(résistance magique + ward save, 95 %)`, le même plafond que la mêlée. L'armure et la résistance physique NE DOIVENT PAS s'appliquer.
- **FR-007**: Le DoT DOIT s'appliquer en parallèle de la régénération de la cible.
- **FR-008**: Le résumé DOIT afficher les dégâts du DoT par coup et le pourcentage perdu, ventilé entre overkill et manque d'entités.
- **FR-009**: Sans sort de DoT lancé, le résultat DOIT être identique à celui de la feature 003.

### Key Entities

- **DoT de sort** : dégâts par instance, probabilité, N (entités affectées), fréquence des ticks. Il est rattaché à une version de sort (simple ou overcast).
- **Contribution DoT d'une phase** : dégâts par coup après plafonds et résistances, pertes par overkill, pertes par manque d'entités.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pour le Rire de Bjuna contre trois cibles de référence (cavalerie, infanterie, entité unique), les dégâts du DoT par coup sont égaux au calcul à la main, à 0,1 % près.
- **SC-002**: Les duels sans sort de DoT gardent 100 % de résultats identiques à la feature 003.
- **SC-003**: L'utilisateur peut dire, depuis le résumé et sans calcul, si un sort de DoT est efficace contre la cible (pourcentage perdu visible).
- **SC-004**: Toute la formule du DoT est couverte par des tests unitaires : les 2 plafonds, le plafond de résistance à 95 %, l'interaction avec la régénération et l'overcast.

## Assumptions

- La sémantique supposée des champs est : `damage_amount` = dégâts par entité et par tick ; `damage_chance` = probabilité par tick, vide = 1 ; `max_damaged_entities` = N. Ces valeurs sont cohérentes avec l'exemple utilisateur du Rire de Bjuna (180 dégâts/entité : overkill sur l'infanterie, efficace sur la cavalerie et l'infanterie monstrueuse).
- On suppose que le jeu frappe les mêmes N entités pendant tout le lancer. Le plafond s'applique donc par entité et par lancer.
- Le nombre d'entités E est celui de départ ; on ne suit pas les pertes en cours de combat (modèle non simulationniste).
- Les dégâts des vortex, bombardements, projectiles et explosions sont hors périmètre.
- Les DoT qui ne viennent pas d'un sort (effets de contact, capacités on/off) sont hors périmètre.

## Révision : sort porté par son côté

Un sort placé dans la colonne Sorts d'un côté s'applique à ce côté (le porteur) : son DoT et ses effets (sous réserve de la règle « offensif » ci-dessous). Les DoT plafonnent les dégâts par entité à `health.unit / max(1, entités)` (bonus de PV et montures compris), et non à `health.entity`. Le résumé affiche les PV perdus du porteur et leur % de la vie de son unité.

Sort « offensif » (par version normal/overcast, toutes phases confondues : au moins un DoT ou un effet de cible `enemy`) : seul ce qui est infligé aux ennemis est conservé, donc les effets de cible `self` (soins, buffs du lanceur) sont ignorés ; le DoT et les effets `enemy` restent sur le porteur. Une version purement `self` (ex. Curse of the Leper) garde tous ses effets sur le porteur.
