import type { Client } from '@tww3-brawl/gql';

// Re-export le type Client du package gql pour faciliter l'importation
export type GraphQLClient = Client;

/**
 * Représente une version du jeu
 */
export interface Version {
  id: string;
  name: string;
  game: string;
}

/**
 * Représente une faction du jeu
 */
export interface Faction {
  key: string;
  screen_name: string;
  flags_url?: string;
  subculture?: {
    name: string;
  };
}

/**
 * Résultat de recherche d'unité : l'unité et sa faction
 */
export interface UnitSearchResult {
  unit: Unit;
  faction: Faction;
}

/**
 * Représente une unité du jeu
 */
export interface Unit {
  version: string;
  unit: string;
  caste: string;
  num_men: number;
  recruitment_cost?: number;
  upkeep_cost?: number;
  multiplayer_cost?: number;
  land_unit: {
    num_engines: number;
    num_mounts: number;
    onscreen_name: string;
    bonus_hit_points: number;
    battle_entity: {
      hit_points: number;
      size: string;
      type: string;
    };
  };
  battle_mounts: {
    base_unit: string,
    mounted_unit: string,
    icon_name: string,
    mount_name: string
  }[];
  health?: {
    unit: number;
    entity: number;
  };
  armor?: number;
  attack?: number;
  defense?: number;
  attack_interval?: number;
  damage?: {
    normal: number;
    piercing: number;
    is_magical: boolean;
    is_fire: boolean;
    bonus_v_large: number;
    bonus_v_infantry: number;
  };
  resistance?: {
    physical: number;
    magic: number;
    fire: number;
    ward_save: number;
  };
  /** Ids des effets du catalogue portés nativement par l'unité */
  effects?: string[];
  is_large?: boolean;
  general_portrait?: string;
  unit_card_url?: string;
  icon: string;
  group?: string;
  special_categories?: string[];
}

/**
 * Interface pour les calculs de santé des unités
 */
export interface UnitHealthProps {
  caste?: string | null;
  num_men?: number | null;
  land_unit?: {
    num_engines?: number | null;
    engine?: {
      battle_entity?: {
        hit_points?: number | null;
      } | null;
    } | null;
    articulated_vehicle_entity?: {
      hit_points?: number | null;
    } | null;
    num_mounts?: number | null;
    mount?: {
      battle_entity?: {
        hit_points?: number | null;
      } | null;
    } | null;
    battle_entity?: {
      hit_points?: number | null;
    } | null;
    bonus_hit_points?: number | null;
  } | null;
}

/**
 * Modificateur d'une statistique : résultat = (base * mult) + add
 */
export interface StatModifier {
  add?: number;
  mult?: number;
}

/**
 * Modificateurs d'un effet, exprimés dans l'espace de stats de tww3-brawl
 */
export interface BrawlModifiers {
  attack?: StatModifier;
  defense?: StatModifier;
  armor?: StatModifier;
  damage?: {
    normal?: StatModifier;
    piercing?: StatModifier;
    bonus_v_large?: StatModifier;
    bonus_v_infantry?: StatModifier;
    is_magical?: boolean;
    is_fire?: boolean;
  };
  resistance?: {
    physical?: StatModifier;
    magic?: StatModifier;
    fire?: StatModifier;
    ward_save?: StatModifier;
  };
  /** Id d'un effet de contact imbu par l'attaque de mêlée */
  contact_effect?: string;
  immunities?: EffectImmunity[];
}

export type EffectImmunity =
  | 'enemy_contact_effects'
  | 'attack_reduction'
  | 'weapon_strength_reduction';

export type EffectKind = 'weapon' | 'contact' | 'ability' | 'attribute';

/** Icône dans la cellule d'attaque ou dans la ligne « effets » */
export type EffectPlacement = 'attack' | 'effects';

/** Qui reçoit les modificateurs quand le porteur a l'effet */
export type EffectTarget = 'self' | 'enemy';

/**
 * Définition d'un effet du catalogue
 */
export interface EffectDefinition {
  id: string;
  kind: EffectKind;
  name: string;
  description?: string;
  /** Chemin brut du jeu, à passer à getImageUrl(version, icon) */
  icon: string;
  placement: EffectPlacement;
  target: EffectTarget;
  /** Toujours actif en jeu (passif natif / propriété d'arme / contact) */
  passive: boolean;
  polarity: 'positive' | 'negative';
  modifiers: BrawlModifiers;
  /** Clé de la capacité de base dont cette entrée est une partie (ennemi, alliés, après-effet, variante) */
  variant_of?: string;
}
