import type { Unit, Version, Faction } from '@tww3-brawl/sdk/src/types'
import type { Paths } from '~/shared/jsonpath';

// Type for unit selection with version and faction
export interface UnitSelection {
  unit?: Unit;
  version?: Version;
  faction?: Faction;
}

// Type for unit with active entity count
export interface UnitWithEntityNumberAndBonus {
  selection: UnitSelection;
  entityNumber: number;
  bonus: UnitBonus;
}

export type UnitBonus = {[key in UnitBonusPathes]: number};

export function defaultUnitBonus(): UnitBonus {
  return UnitBonusPathes.reduce((acc, path) => {
    acc[path] = 0;
    return acc;
  }, {} as UnitBonus);
}

export type UnitPaths = Paths<Required<Unit>>;

export const UnitBonusPathes: readonly UnitPaths[] = [
  'armor',
  'attack',
  'defense',
  'damage.normal',
  'damage.piercing',
  'damage.bonus_v_large',
  'damage.bonus_v_infantry',
  'resistance.physical',
  'resistance.magical',
  'resistance.ward_save',
] as const;

export type UnitBonusPathes = typeof UnitBonusPathes[number];


export const statistics: { path: Paths<Required<Unit>>, color: string, label: string }[] = [
  { path: 'health.unit', color: 'green', label: 'Health' },
  { path: 'attack', color: 'blue', label: 'Attack' },
  { path: 'damage.normal', color: 'green', label: 'Damage Normal' },
  { path: 'damage.piercing', color: 'green', label: 'Damage Piercing' },
  { path: 'damage.bonus_v_large', color: 'green', label: 'Damage Bonus V Large' },
  { path: 'damage.bonus_v_infantry', color: 'green', label: 'Damage Bonus V Infantry' },
  { path: 'defense', color: 'red', label: 'Defense' },
  { path: 'armor', color: 'orange', label: 'Armor' },
  { path: 'resistance.physical', color: 'pink', label: 'Resistance Physical' },
  { path: 'resistance.fire', color: 'pink', label: 'Resistance Fire' },
  { path: 'resistance.ward_save', color: 'pink', label: 'Resistance Ward Save' },
] as const