# Feature Specification: Correction des cartes d'unités dédoublées avec nom brut non résolu

**Feature Branch**: `001-fix-duplicate-unit-cards`
**Created**: 2026-07-27
**Status**: Draft
**Input**: User description: "Débuggage: pour certains héros/personnages, les unités sont dédoublées / n'ont pas le bon nom. Sur la page de détail d'un héros, on voit deux fois le même personnage, le premier n'ayant pas de nom (affichage brut d'une clé de traduction non résolue, ex: `{{tr:and_units_onscreen_name_wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer}}`). Il faut inspecter les requêtes GraphQL pour comprendre pourquoi certaines cartes ont ce bug d'affichage, puis corriger."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ne plus voir de carte d'unité dupliquée (Priority: P1)

En tant qu'utilisateur qui consulte la liste des unités disponibles pour un héros/seigneur (vue de sélection groupée par Lords / Heroes / Infantry / etc.), je ne dois voir qu'une seule carte par unité logique, même si le backend renvoie plusieurs entrées brutes pour cette même unité (par ex. une entrée avec un nom correctement traduit et une autre avec une clé de traduction non résolue).

**Why this priority**: C'est le symptôme visible et gênant rapporté par l'utilisateur : une unité (ex. Styrkaar, DLC27) apparaît deux fois dans la liste, ce qui casse la confiance dans l'outil et complique la sélection d'unité.

**Independent Test**: Ouvrir la vue de détail d'un héros connu pour être affecté (ex. faction Slaanesh du Chaos, DLC27, unité Styrkaar) et vérifier qu'une seule carte apparaît pour cette unité dans le groupe correspondant.

**Acceptance Scenarios**:

1. **Given** le backend GraphQL renvoie deux entrées `land_unit` pour la même unité logique (même `unit`/caste) mais avec des chaînes `onscreen_name` différentes (une résolue, une clé brute non traduite), **When** l'utilisateur ouvre la vue de sélection d'unités du héros, **Then** une seule carte est affichée pour cette unité, avec le nom correctement résolu.
2. **Given** deux unités réellement distinctes (unit/caste différents) partagent accidentellement le même `onscreen_name`, **When** l'utilisateur ouvre la vue, **Then** les deux cartes restent distinctes (pas de sur-fusion).

---

### User Story 2 - Ne jamais afficher une clé de traduction brute à l'utilisateur (Priority: P2)

En tant qu'utilisateur, si le backend ne peut pas fournir un nom traduit pour une unité (clé de localisation manquante côté service externe broker.twwstats.com), je dois voir un nom de repli lisible plutôt qu'une chaîne technique du type `{{tr:...}}`.

**Why this priority**: Complète la correction du dédoublonnage : même après fusion, il faut garantir qu'aucune carte affichée ne montre jamais un texte brut de clé de traduction, y compris pour des cas futurs où le backend renverrait une seule entrée déjà brute (pas de doublon à fusionner).

**Independent Test**: Simuler/observer une unité dont `land_unit.onscreen_name` correspond au motif `{{tr:...}}` et vérifier que la carte affiche un nom de repli humanisé (dérivé de l'identifiant technique de l'unité) plutôt que la clé brute.

**Acceptance Scenarios**:

1. **Given** une unité dont `onscreen_name` correspond au motif `{{tr:...}}`, **When** la carte ou le sélecteur d'unité l'affiche, **Then** le nom brut n'est jamais visible ; un nom de repli lisible est affiché à la place.

---

### Edge Cases

- Que se passe-t-il si le backend renvoie plus de deux entrées brutes pour la même unité (plus d'un doublon) ? → Toutes les entrées superflues doivent être fusionnées, en conservant l'entrée avec le nom valide de coût le plus bas parmi les entrées valides.
- Que se passe-t-il si **toutes** les entrées d'une unité ont un nom brut non résolu (aucune entrée valide) ? → La carte doit utiliser le nom de repli humanisé, et rester unique (dédoublonnée par clé d'unité stable, pas par nom).
- Que se passe-t-il si deux unités distinctes ont, par coïncidence, exactement le même `onscreen_name` traduit valide ? → Comportement actuel conservé pour ce cas précis (fusion volontaire documentée dans le code existant pour éviter les doublons "même nom, HP différents") — hors périmètre de cette correction, qui vise seulement l'échec du dédoublonnage causé par un nom brut non traduit.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT regrouper les entrées d'unités provenant du backend par une clé d'unité stable (identifiant technique de l'unité, ex. `unit`/caste) plutôt que par le seul texte affiché (`onscreen_name`), pour le calcul des doublons.
- **FR-002**: Lorsque plusieurs entrées existent pour la même unité stable, le système DOIT retenir en priorité l'entrée dont le nom est valide (non brut) ; en cas d'égalité (plusieurs entrées valides), le système DOIT conserver la logique existante de sélection par coût de recrutement le plus bas.
- **FR-003**: Le système DOIT détecter un nom brut de traduction non résolue selon le motif `{{tr:...}}` (ou motif équivalent) partout où `onscreen_name` est affiché à l'utilisateur.
- **FR-004**: Lorsqu'un nom brut est détecté et qu'aucune alternative valide n'existe pour la même unité, le système DOIT afficher un nom de repli lisible dérivé de l'identifiant technique de l'unité, plutôt que la clé brute.
- **FR-005**: La correction DOIT s'appliquer à tous les points d'affichage du nom d'unité concernés par ce bug (carte d'unité et sélecteur d'unité groupé).
- **FR-006**: La correction NE DOIT PAS modifier le comportement existant pour les unités dont toutes les entrées ont déjà un nom valide (pas de régression sur le cas nominal).
- **FR-007** *(ajouté suite à régression détectée après le premier correctif)*: Lorsqu'un héros/seigneur a plusieurs variantes de monture (chacune avec son propre identifiant `unit`, ex. suffixe `_steed_of_slaanesh`), et qu'au moins une variante de cette famille a un nom résolu valide, le système DOIT regrouper TOUTES les variantes de cette famille (y compris celles dont le nom est brut/non résolu) sous une seule carte affichant le nom résolu — le regroupement ne doit PAS se faire uniquement sur l'identifiant `unit`+`caste`, qui diffère entre variantes de monture.
- **FR-008** *(ajouté suite à un second retour utilisateur)* : Le nom affiché sur la carte d'un héros/seigneur (titre principal, en-tête de comparaison, résumé de combat) DOIT rester figé sur le nom capturé au moment de la sélection initiale dans la liste groupée, et NE DOIT PAS changer lorsque l'utilisateur change ensuite la monture équipée via le sélecteur de monture — même si l'entrée technique de la monture choisie a son propre `onscreen_name` différent (voire brut/non résolu). Seules les statistiques de combat (points de vie, attaque, défense, portrait, etc.) doivent refléter la monture équipée.
- **FR-009** *(ajouté suite au même retour utilisateur)* : Le sélecteur de monture DOIT toujours afficher un nom de monture lisible pour chaque option (jamais de clé de traduction brute `{{tr:...}}`), avec le même mécanisme de repli que pour le nom d'unité (FR-003/FR-004).

### Key Entities *(include if feature involves data)*

- **Unit (unité)** : entrée retournée par le backend GraphQL pour une unité recrutable d'une faction ; possède un identifiant technique stable (`unit`/caste), un `land_unit.onscreen_name` (texte affiché, potentiellement une clé brute non résolue), un coût de recrutement, et des points de vie.
- **Groupe d'unités affiché** : regroupement logique (Lords / Heroes / Infantry / etc.) présenté dans la vue de détail d'un héros, construit à partir de la liste dédoublonnée des unités de la faction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pour 100% des héros/factions testés (y compris le cas Styrkaar/DLC27), la vue de détail n'affiche plus qu'une seule carte par unité logique.
- **SC-002**: Aucune carte affichée dans l'application ne montre jamais de texte correspondant au motif `{{tr:...}}`.
- **SC-003**: Aucune régression : les unités déjà correctement affichées avant la correction restent identiques (nom, groupe, coût) après la correction.

## Assumptions

- Le backend GraphQL externe (`https://broker.twwstats.com/graphql`) est hors périmètre : il n'est pas possible de corriger la donnée à la source (clé de traduction manquante côté service tiers). La correction est uniquement côté frontend (mitigation d'affichage et dédoublonnage robuste).
- **Correction (2026-07-27, retour utilisateur après premier correctif)** : l'identifiant technique `unit` n'est **PAS** stable au sens "un seul `unit` par unité logique" — un héros/seigneur avec plusieurs montures possibles a un `unit` distinct **par variante de monture** (ex. `..._steed_of_slaanesh`, `..._daemonic_steed`), alors que ces variantes partagent historiquement le **même `onscreen_name` résolu**. Le regroupement d'origine (par texte de `onscreen_name`) fusionnait donc correctement ces variantes de monture en une seule carte ; ce comportement est intentionnel et NE DOIT PAS régresser. Le regroupement doit donc rester basé sur le nom résolu quand il est valide, et seulement traiter spécifiquement le cas où le nom brut (`{{tr:...}}`) empêcherait une variante de monture de rejoindre le groupe de sa variante résolue (voir FR-007).
- Le fallback de nom lisible est dérivé de l'identifiant technique de l'unité (ex. slug transformé en texte, sans traduction), sans appel réseau supplémentaire, et seulement utilisé quand aucune variante de la même famille n'a de nom résolu valide.
- Aucune modification du schéma GraphQL côté `packages/gql` n'est nécessaire : les champs déjà sélectionnés (`unit`, `caste`, `land_unit.onscreen_name`, `recruitment_cost`) suffisent à implémenter la correction.
