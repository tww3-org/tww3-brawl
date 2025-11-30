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
    fire: number;
    ward_save: number;
  };
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
