# Feature Specification: Effets de jeu (buffs / debuffs / effets de contact) appliqués au duel

**Feature Branch**: `ccr-6b4b44a9-wcfz23`
**Created**: 2026-10-18
**Status**: Draft — étape 1 (inventaire + modèle de données SDK). L'UI/UX reste à valider.
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
  "target": "enemy",            // qui reçoit les modificateurs : le porteur (self) ou son adversaire (enemy)
  "passive": true,              // actif par défaut dans le jeu
  "polarity": "negative",
  "modifiers": { "damage": { "normal": { "mult": 0.85 }, "piercing": { "mult": 0.85 } } }
}
```

`modifiers` reprend la forme de `Unit` : chaque stat numérique reçoit `{ add?, mult? }` et vaut `base × Πmult + Σadd`.

- `scripts/generate-effects-catalog.mjs` (`pnpm effects:generate [versionId]`) régénère `catalog.generated.ts` depuis le GraphQL ; les deux effets d'arme sont définis à la main dans `builtinEffects.ts`.
- `Unit.effects` liste les identifiants d'effets natifs de l'unité (propriétés d'arme, effet de contact de l'arme, capacités, attributs).
- `applyEffects(unit, ownEffects, enemyEffects)` renvoie une copie modifiée de l'unité. `getDefaultEffects(unit)` renvoie ses effets natifs passifs. Rien n'est encore branché dans l'UI : les résultats actuels ne changent pas.

## Questions ouvertes (à trancher avant l'UI)

1. **Activation par défaut** : faut-il activer tous les passifs natifs au chargement d'une unité ? Plus fidèle au jeu (Frenzy +10 attaque…), mais certains passifs sont conditionnels (Hatred contre une race, Frenzy perdu sous 50 % de moral, bonus « si un Kroxigor est proche »…). Proposition : actifs par défaut, désactivables d'un clic.
2. **Résistance magique** : `damage_mod_magic` est maintenant récupéré mais pas utilisé. Dans le jeu, elle s'applique contre les attaques magiques. Faut-il l'ajouter au calcul (cela changerait les résultats des duels contre une unité magique) ?
3. **Effets avec cible « enemy »** (hexes, effets de contact) : affichés côté porteur (dans sa case attaque / sa ligne effets) et appliqués à l'adversaire. Faut-il aussi les montrer côté adversaire ?
4. **Le bouton « + »** propose ~1200 capacités : il faut une recherche par nom et des filtres (buff/debuff, type). Faut-il limiter la liste aux capacités des unités de la faction ?
5. **Ordre d'application** : modèle actuel `base × Πmult + Σadd`. Les bonus manuels existants (`UnitBonus`) s'ajoutent ensuite.
6. **Taille du bundle** : le catalogue généré pèse quelques centaines de Ko ; on pourra le charger à la demande (import dynamique) quand l'UI arrivera.

## UI/UX proposée (à valider)

- Case **Attaque** du tableau de détail : icônes des effets `placement: attack` (magique, enflammé, poison, armure brisée…).
- Nouvelle ligne **Effets** : icônes des effets `placement: effects` (buffs/debuffs, attributs).
- Clic sur une icône = activer/désactiver ; un effet désactivé est assombri (filtre `brightness(0.35) grayscale(1)`).
- Bouton **+** : boîte de dialogue de recherche dans le catalogue pour ajouter un effet.
- Info-bulle : nom, description, modificateurs traduits (« +10 Attaque », « Dégâts ×0,85 »).
- État dans le store Pinia (`ownEffects` par côté) et synchronisé dans l'URL comme les bonus actuels.
