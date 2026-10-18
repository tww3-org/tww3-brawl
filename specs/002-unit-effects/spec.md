# Feature Specification: Effets de jeu (buffs / debuffs / effets de contact) appliqués au duel

**Feature Branch**: `ccr-6b4b44a9-wcfz23`
**Created**: 2026-10-18
**Status**: Étape 2 — décisions produit validées, UI en cours.
**Input**: "Permettre la gestion des nombreux modificateurs que le jeu peut traiter (attaque magique activable/désactivable, effets de contact comme le poison, buffs/debuffs). Répertorier les effets depuis le GraphQL avec leurs noms et icônes, whitelister ceux pertinents pour le corps à corps, et associer à chaque identifiant d'effet un JSON de modificateurs dans l'espace tww3-brawl."

## Source des données

Tout vient de `https://broker.twwstats.com/graphql` (les icônes sont celles de twwstats, servies par le CDN Cloudinary via `getImageUrl(version, path)`).

| Famille | Requête GraphQL | Icône | Volume (Patch 9.0.0) |
|---|---|---|---|
| Effets de contact (poison, frostbite, sundered armour…) | `units { land_unit { primary_melee_weapon { contact_phase } } }` + `abilities { phases { imbue_contact } }` | `ui/battle ui/ability_icons/<phase id>.png` | ~30 |
| Capacités (passives et actives : Frenzy, Hatred, sorts, objets…) | `abilities { phases { stat_effects, imbue_* } unit_special_ability { passive, affect_self, target_enemies } }` | `ui/battle ui/ability_icons/<icon_name>.png` | 3179, dont ~1200 touchent le corps à corps |
| Attributs (Unyielding Assault, Slayer, Immune to Contact Effects…) | `attributes { key bullet_text }` | `ui/battle ui/ability_icons/<key>.png` | 89, dont 3 ont un effet sur le calcul |
| Propriétés d'arme (attaque magique, enflammée) | `primary_melee_weapon { is_magical ignition_amount }` | `ui/skins/default/modifier_icon_magical.png` / `modifier_icon_flaming.png` | 2 (builtin) |

Un effet = un `phase` du jeu : une liste de `stat_effects` (`stat`, `value`, `how: add|mult`) plus des drapeaux `imbue_magical`, `imbue_ignition`, `imbue_contact`.

## Whitelist « corps à corps »

Un effet est retenu si, une fois traduit dans l'espace tww3-brawl, il modifie au moins une valeur utilisée par le calcul du duel. Table de correspondance (le reste — moral, vitesse, tir, charge, rechargement… — est ignoré) :

| Stat du jeu | Modificateur tww3-brawl |
|---|---|
| `stat_melee_attack` | `attack` |
| `stat_melee_defence` | `defense` |
| `stat_armour` | `armor` |
| `stat_melee_damage_base` | `damage.normal` |
| `stat_melee_damage_ap` | `damage.piercing` |
| `stat_bonus_vs_large` / `stat_bonus_vs_infantry` | `damage.bonus_v_large` / `damage.bonus_v_infantry` |
| `stat_resistance_physical` | `resistance.physical` |
| `stat_resistance_magic` | `resistance.magic` |
| `stat_resistance_flame`, `stat_weakness_flame` | `resistance.fire` |
| `stat_resistance_all` | `resistance.ward_save` |
| `imbue_magical` | `damage.is_magical: true` |
| `imbue_ignition > 0` | `damage.is_fire: true` |
| `imbue_contact` | `contact_effect: <id>` |

Attributs retenus manuellement (règles plutôt que stats) : `ignore_imbue_contact_effects_enemy` (ignore les effets de contact ennemis), `unyielding_assault` (l'attaque ne peut pas être réduite), `slayer` (les dégâts ne peuvent pas être réduits).

Corrections manuelles (`OVERRIDES` dans le script) : `wh2_pro08_unit_contact_dampen` retire l'attaque magique (`damage.is_magical: false`).

## Modèle de données

Le catalogue `packages/sdk/src/data/effects/` associe chaque identifiant d'effet à une `EffectDefinition` :

```jsonc
"wh_main_unit_contact_poison": {
  "id": "wh_main_unit_contact_poison",
  "kind": "contact",            // weapon | contact | ability | attribute
  "name": "Poison",
  "icon": "ui/battle ui/ability_icons/wh_main_unit_contact_poison.png",
  "placement": "attack",        // attack = icône dans la case « attaque » ; effects = ligne « Effets »
  "target": "enemy",            // effet de jeu visant l'ennemi (contact, hex) : sert à placer l'effet, voir Décisions §3
  "passive": true,              // actif par défaut dans le jeu
  "polarity": "negative",
  "modifiers": { "damage": { "normal": { "mult": 0.85 }, "piercing": { "mult": 0.85 } } }
}
```

`modifiers` reprend la forme de `Unit` : chaque stat numérique reçoit `{ add?, mult? }`. Les multiplicateurs forment une couche additive : chaque `mult` est un écart en pourcentage, et les écarts s'additionnent. `valeur = base × max(0, 1 + Σ(mult − 1)) + Σadd`. Exemple : −100 % et +50 % donnent 50 % de la base, pas 0.

- `scripts/generate-effects-catalog.mjs` (`pnpm effects:generate [versionId]`) régénère `catalog.generated.ts` depuis le GraphQL ; les deux effets d'arme sont définis à la main dans `builtinEffects.ts`.
- `Unit.effects` liste les identifiants d'effets natifs de l'unité (propriétés d'arme, effet de contact de l'arme, capacités, attributs).
- `applyEffects(unit, cardEffects, opponentCardEffects)` renvoie une copie modifiée de l'unité. `getNativeCardEffects(unit, opponent)` donne les effets natifs affichés sur la carte et leur état par défaut.

## Décisions (2026-10-18)

1. **Activation par défaut** : les passifs natifs sont actifs par défaut ; les capacités natives non passives sont affichées désactivées. Un clic active/désactive.
2. **Résistance magique** : prise en compte contre les attaques magiques (bornée à [−100, 100] comme le feu, total plafonné à 95).
3. **Où s'affiche un effet** :
   - Effets de contact (poison…) et capacités qui les confèrent : uniquement sur la carte de celui qui les inflige ; le malus s'applique à l'adversaire.
   - Sorts et capacités ciblant l'ennemi (hexes, ex. Soulblight) : directement sur la carte de l'unité qui les reçoit.
   - Donc `applyEffects(unit, cardEffects, opponentCardEffects)` : l'unité reçoit les effets de sa propre carte (sauf effets de contact) et les effets de contact de la carte adverse.
4. **Bouton +** : tout le catalogue, avec recherche et filtres, sans restriction par faction.
5. **Multiplicateurs** : couche additive (voir Modèle de données).
7. **Capacités à plusieurs phases** : seul l'état final compte (ex. Berserk de Norsca : la dernière phase, +20 % résistance physique et +13 attaque). Les étapes se lisent dans l'identifiant des phases (`_i`, `_ii`, `_1`…), l'ordre de l'API n'étant pas fiable. Les parties parallèles deviennent des entrées séparées (`variant_of`) : `__enemy` (affichée sur la carte de l'unité ciblée), `__allies`, `__debuff` (contrecoup), et une entrée par variante aléatoire (ex. Book of Secrets).
6. **Résistances** : additives entre elles (ward + physique si l'attaque n'est pas magique + magique si elle l'est + feu si elle est enflammée, chacune bornée à [−100, 100]), le total (plafonné à 95) multiplie les dégâts : `dégâts × (1 − total)`. Exemple : 30 % physique et −50 % feu ⇒ ×1,2 contre une attaque enflammée, ×1,5 si elle est aussi magique, ×0,7 contre une attaque simple.

## UI

- Case **Attaque** du tableau de détail : icônes des effets `placement: attack` (magique, enflammé, poison, armure brisée…).
- Ligne **Effets** : icônes des effets `placement: effects` (buffs/debuffs, attributs) et bouton **+**.
- Clic sur une icône = activer/désactiver ; un effet désactivé est assombri. Un repère signale les effets infligés à l'adversaire ; les effets ajoutés à la main ont un × pour les retirer.
- Info-bulle : nom, description, modificateurs (« +10 », « +10 % », « −15 % »).
- État par côté dans le store (`overrides` + `added`), synchronisé dans l'URL (`fx=id:0|1,…`, `fa=id,…`).

## Reste à faire

- Charger le catalogue à la demande (≈ 620 Ko).
- Icône de repli pour les 4 icônes absentes du CDN.
