import type { UnitWithEntityNumber } from '@tww3-brawl/sdk/src/logic/twoSideCalculations';
import type { Unit, Version, Faction } from '@tww3-brawl/sdk/src/types'
import { getTyped, setTyped, type Paths } from '~/shared/jsonpath';
import { applyEffects, getNativeCardEffects } from '@tww3-brawl/sdk/src/logic/applyEffects';
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

/** Unité d'un côté après application des effets (sans le bonus manuel) */
export function unitWithEffects(side: SideData, other: SideData): Unit | undefined {
  const unit = side?.selection?.unit;
  if (!unit) {
    return undefined;
  }
  return applyEffects(unit, activeEffectIds(side, other), activeEffectIds(other, side));
}

/**
 * Unités effectives d'un duel : effets des deux cartes appliqués, puis bonus manuel par-dessus.
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
    const unit = unitWithEffects(side, other);
    return unitWithBonus({ ...side, selection: { ...side.selection, unit } });
  };
  return { left: build(left, right), right: build(right, left) };
}

export type UnitBonus = {[key in UnitBonusPathes]: number};

export function defaultUnitBonus(): UnitBonus {
  return UnitBonusPathes.reduce((acc, path) => {
    acc[path] = 0;
    return acc;
  }, {} as UnitBonus);
}

export type UnitPaths = Paths<Required<Unit>>;

export const UnitBonusPathes: UnitPaths[] = [
  'health.unit',
  'armor',
  'attack',
  'defense',
  'damage.normal',
  'damage.piercing',
  'damage.bonus_v_large',
  'damage.bonus_v_infantry',
  'resistance.physical',
  'resistance.magic',
  'resistance.fire',
  'resistance.ward_save',
  'recruitment_cost',
  'upkeep_cost',
] as const;

export type UnitBonusPathes = typeof UnitBonusPathes[number];

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




export function unitWithBonus(unit: Readonly<UnitWithEntityNumberAndBonus> ): UnitWithEntityNumber {   
  if (!unit.selection.unit) {
    return unit;
  }
  // Deep clone the unit
  const finalUnit: Unit = JSON.parse(JSON.stringify(unit.selection.unit));
  for (const path of Object.keys(unit.bonus) as UnitBonusPathes[]) {
    if (typeof unit.bonus[path] === 'number') {
      const value = getTyped(finalUnit, path as Paths<Unit>) as number;
      setTyped(finalUnit, path as Paths<Unit>, (value + unit.bonus[path]) as unknown as Paths<Unit, Paths<Unit>>)
    }
  }
  
  return {
    selection: {
      unit: finalUnit,
      version: unit.selection.version,
      faction: unit.selection.faction
    },
    entityNumber: unit.entityNumber
  }
}


