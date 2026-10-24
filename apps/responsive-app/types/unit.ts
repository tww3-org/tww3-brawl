import type { UnitWithEntityNumber } from '@tww3-brawl/sdk/src/logic/twoSideCalculations';
import type { Unit, Version, Faction } from '@tww3-brawl/sdk/src/types'
import type { Paths } from '~/shared/jsonpath';
import { getNativeCardEffects } from '@tww3-brawl/sdk/src/logic/applyEffects';
import {
  EFFECTIVE_UNIT_LAYERS,
  UNIT_BONUS_PATHS,
  derivedValuesLayer,
  runLayers,
  type LayerContext,
  type UnitBonusPath,
} from '@tww3-brawl/sdk/src/logic/unitLayers';
import { getEffect } from '@tww3-brawl/sdk';

// Type for unit selection with version and faction
export interface UnitSelection {
  unit?: Unit;
  version?: Version;
  faction?: Faction;
  // Name pinned at the moment of the original hero/unit pick (see
  // updateUnitSelection in UnitCard/index.vue). Kept stable across later
  // mount swaps (updateUnit), which replace `unit` with the mounted
  // variant's own data but must NOT change the displayed card title
  // (spec.md FR-008).
  displayName?: string;
}

// Type for unit with active entity count
export interface UnitWithEntityNumberAndBonus {
  selection: UnitSelection;
  entityNumber: number;
  bonus: UnitBonus;
  /** Optionnel : absent des états persistés avant l'ajout des effets */
  effects?: UnitEffectState;
}

/**
 * État des effets d'une carte :
 * - `overrides` : activation forcée par id (prioritaire sur l'état par défaut)
 * - `added` : ids du catalogue ajoutés manuellement (actifs par défaut)
 */
export interface UnitEffectState {
  overrides: Record<string, boolean>;
  added: string[];
}

export function defaultEffectState(): UnitEffectState {
  return { overrides: {}, added: [] };
}

/** Effet affiché sur une carte avec son état courant */
export interface DisplayedEffect {
  id: string;
  /** true : effet natif de l'unité (ou sort de l'adversaire) ; false : ajouté manuellement */
  native: boolean;
  active: boolean;
  /** 'opponent' : effet natif placé ici parce que l'adversaire le porte */
  source: 'own' | 'opponent';
}

type SideData = Readonly<UnitWithEntityNumberAndBonus> | null | undefined;

/**
 * Effets affichés sur la carte d'un côté : natifs (selon l'adversaire) puis ajoutés.
 * Actif = override explicite, sinon état par défaut (passif pour un natif, actif pour un ajouté).
 */
export function displayedEffects(side: SideData, other: SideData): DisplayedEffect[] {
  const unit = side?.selection?.unit;
  if (!unit) {
    return [];
  }
  const overrides = side.effects?.overrides ?? {};
  const result: DisplayedEffect[] = getNativeCardEffects(unit, other?.selection?.unit).map(e => ({
    id: e.id,
    native: true,
    active: overrides[e.id] ?? e.active,
    source: e.source,
  }));
  const seen = new Set(result.map(e => e.id));
  for (const id of side.effects?.added ?? []) {
    if (!seen.has(id) && getEffect(id)) {
      seen.add(id);
      result.push({ id, native: false, active: overrides[id] ?? true, source: 'own' });
    }
  }
  return result;
}

/** Ids des effets actifs affichés sur la carte d'un côté */
export function activeEffectIds(side: SideData, other: SideData): string[] {
  return displayedEffects(side, other).filter(e => e.active).map(e => e.id);
}

/**
 * Unités effectives d'un duel : couches appliquées dans l'ordre obligatoire du SDK
 * (valeurs dérivées, bonus manuel, effets positifs, effets négatifs).
 * Point d'entrée unique pour tous les calculs de combat.
 */
export function effectiveUnits(
  left: SideData,
  right: SideData
): { left: UnitWithEntityNumber | null; right: UnitWithEntityNumber | null } {
  const build = (side: SideData, other: SideData): UnitWithEntityNumber | null => {
    if (!side) {
      return null;
    }
    return {
      selection: {
        unit: fullyEffectiveUnit(side, other),
        version: side.selection?.version,
        faction: side.selection?.faction,
      },
      entityNumber: side.entityNumber,
    };
  };
  return { left: build(left, right), right: build(right, left) };
}

/** Unité de base d'un côté (valeurs dérivées uniquement, sans bonus ni effets) */
export function baseUnit(side: SideData): Unit | undefined {
  const unit = side?.selection?.unit;
  return unit && runLayers(unit, [derivedValuesLayer]);
}

/** Unité d'un côté après toutes les couches (valeurs dérivées, bonus manuel, effets) */
export function fullyEffectiveUnit(side: SideData, other: SideData): Unit | undefined {
  const unit = side?.selection?.unit;
  return unit && runLayers(unit, EFFECTIVE_UNIT_LAYERS, layerContext(side, other));
}

function layerContext(side: NonNullable<SideData>, other: SideData): LayerContext {
  return {
    manual: side.bonus,
    cardEffects: activeEffectIds(side, other),
    opponentCardEffects: activeEffectIds(other, side),
  };
}

export type UnitBonus = {[key in UnitBonusPathes]: number};

export function defaultUnitBonus(): UnitBonus {
  return UnitBonusPathes.reduce((acc, path) => {
    acc[path] = 0;
    return acc;
  }, {} as UnitBonus);
}

export type UnitPaths = Paths<Required<Unit>>;

/** Chemins modifiables manuellement : liste définie par le SDK (source unique, pour éviter toute dérive) */
export const UnitBonusPathes = UNIT_BONUS_PATHS;

export type UnitBonusPathes = UnitBonusPath;

export const statistics: { path: UnitPaths, color: string, label: string }[] = [
  { path: 'health.unit', color: 'green', label: 'Health' },
  { path: 'attack', color: 'blue', label: 'Attack' },
  { path: 'damage.normal', color: 'green', label: 'Damage Normal' },
  { path: 'damage.piercing', color: 'green', label: 'Damage Piercing' },
  { path: 'damage.bonus_v_large', color: 'green', label: 'Bonus V Large' },
  { path: 'damage.bonus_v_infantry', color: 'green', label: 'Bonus V Infantry' },
  { path: 'defense', color: 'red', label: 'Defense' },
  { path: 'armor', color: 'orange', label: 'Armor' },
  { path: 'resistance.physical', color: 'pink', label: 'Resistance Physical' },
  { path: 'resistance.magic', color: 'pink', label: 'Resistance Magic' },
  { path: 'resistance.fire', color: 'pink', label: 'Resistance Fire' },
  { path: 'resistance.ward_save', color: 'pink', label: 'Resistance Ward Save' },
  { path: 'recruitment_cost', color: '#B8860B', label: 'Recruitment Cost' },
  { path: 'upkeep_cost', color: '#B8860B', label: 'Upkeep Cost' },
] as const
