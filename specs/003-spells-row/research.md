# Research: 003-spells-row

Données observées sur `broker.twwstats.com`, version Patch 9.0.0 (`4512102377651127604`).

## R1 — Identifier un sort

- **Decision**: un sort est une `ability` dont `unit_special_ability.mana_cost > 0` et qui n'est pas la cible d'un `overpower_option`.
- **Rationale**: 417 capacités ont un coût en mana. 176 d'entre elles sont des overcasts (cibles d'`overpower_option`, en général `*_upgraded`, aucune cachée dans l'UI). Le type d'ability (`wh_type_*`) n'est pas fiable pour distinguer sort et capacité.
- **Alternatives considered**: préfixe de clé `*_spell_*` (rate les sorts liés, les sorts de personnage et les variantes) ; `ability.type` (mélange sorts et capacités).

## R2 — Overcast

- **Decision**: la version overcast est `ability.overpower_option`, traitée comme une ability à part entière (ses propres phases et sa propre durée). On la stocke dans `SpellDefinition.overcast`, et elle n'est jamais listée seule dans le sélecteur.
- **Rationale**: 193 sorts pointent vers un overcast. Les valeurs diffèrent souvent, et la durée aussi (ex. Glean Magic 23 s → Upgraded 46 s).
- **Alternatives considered**: un overcast défini comme multiplicateur des valeurs simples (faux pour de nombreux sorts).

## R3 — Durée d'un sort

- **Decision**: la durée est le maximum des `phase.duration > 0` parmi les phases qui produisent des modificateurs retenus (whitelist 002, plus le DoT en 004). Repli : `unit_special_ability.active_time`. Un sort sans durée positive est exclu.
- **Rationale**: 11 sorts ont plusieurs phases, de durées égales (ex. Heart of Winter Upgraded 4 × 8 s, Writhing Mist 2 × 24 s) ou proches (Pavane 10/14 s). Le maximum simplifie la règle sans erreur notable. On le documente comme hypothèse (principe II).
- **Alternatives considered**: une durée par phase, chaque phase devenant un effet distinct ; c'est plus fidèle mais multiplie les effets. On le reporte, la structure le permet (voir data-model : `effects[]`).

## R4 — Catalogue global, pas sorts natifs

- **Decision**: le sélecteur propose tout le catalogue de sorts. Il n'y a pas de sort natif sur la carte.
- **Rationale**: seules 11 unités sur 2658 listent leurs sorts dans `land_unit.abilities` (Daemon Princes, Be'lakor, Cultist…). Les sorts viennent normalement des compétences, qui ne sont pas modélisées. Un buff peut aussi être lancé par un héros allié.
- **Alternatives considered**: sorts natifs pré-affichés à 0 lancer pour ces 11 unités ; reportable, sans impact sur le modèle.

## R5 — Dédoublonnage

- **Decision**: les sorts de même nom et de mêmes modificateurs et durée sont fusionnés. La clé conservée est celle qui contient `_spell_<lore>_`, sinon la plus courte. Les sorts liés (`*_spell_bound_*`) et les variantes de personnage (suffixe de nom de personnage) disparaissent ainsi du sélecteur.
- **Rationale**: par exemple « The Fate of Bjuna » existe en 5 clés aux phases identiques.
- **Alternatives considered**: tout lister, ce qui rend le sélecteur illisible.

## R6 — Réutiliser les couches d'effets

- **Decision**: les modificateurs d'un sort sont les `EffectDefinition` produits par la même fonction `abilityEntries` du générateur (`key`, `key__enemy`, variantes…). Ils restent dans `EFFECTS_CATALOG` avec un champ `spell: { spell_id }`. À chaque phase, les ids des effets de sort actifs sont injectés dans `cardEffects` : ceux du lanceur s'ils visent `self`, ceux de l'adversaire s'ils visent `enemy`. C'est la même convention que `getNativeCardEffects`.
- **Rationale**: on n'écrit pas de second moteur de stats. Les immunités, polarités, `contact_effect` et booléens magique/feu marchent sans travail supplémentaire.
- **Alternatives considered**: des `BrawlModifiers` copiés dans `SpellDefinition` et une couche dédiée ; c'est une duplication de logique.

## R7 — Exclusion de la ligne « Effets »

- **Decision**: `EffectPickerDialog` et `getNativeCardEffects` ignorent les entrées dont `spell` est défini. Un id de sort présent dans un ancien état persisté (`effects.added`) ou une ancienne URL est ignoré silencieusement.
- **Rationale**: FR-009 et SC-004 (pas de double comptage).
- **Alternatives considered**: migrer automatiquement un ancien `added` vers 1 lancer ; c'est faisable mais rare, donc on ne le fait pas pour l'instant.

## R8 — Algorithme de phases et non-régression

- **Decision**:
  - `nₑ = Σ lancers × durée / 4`, par (sort, version, côté).
  - Bornes = union triée des nₑ des deux côtés, plus une phase finale infinie.
  - Pour chaque phase, on calcule les unités effectives puis les dégâts nets par coup des deux côtés.
  - On parcourt les phases par côté, comme décrit dans la spec.
  - `calculateWinner(l, r)` délègue à `calculatePhasedWinner([{ hits: Infinity, left: l, right: r }])`. Avec une seule phase infinie, le parcours se réduit exactement à `vie / dégâts`, la formule actuelle.
  - Le soin limité (`burst`) reste ajouté à la vie de départ et vient des unités de la **dernière** phase, car il dépend des effets on/off seulement.
- **Rationale**: déterministe, sans simulation, conforme à la demande ; la non-régression est garantie par construction et vérifiée par test.
- **Alternatives considered**: simulation coup par coup (rejetée par l'utilisateur).

## R9 — Persistance et URL

- **Decision**: chaque côté porte `spells?: { casts: Record<spellId, { normal: number; overcast: number }> }`, optionnel pour les états persistés anciens. Dans l'URL, la clé est `s` : `s=<spellId>~<normal>~<overcast>`, répétée, avec seulement les compteurs non nuls. Un sort ajouté à 0/0 n'est pas encodé.
- **Rationale**: même logique que `effects` (`useUrlSync`), sans conflit avec les clés de bonus.
- **Alternatives considered**: fusion dans `effects` ; mélange on/off et compteurs.
