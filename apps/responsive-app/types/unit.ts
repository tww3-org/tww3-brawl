import type { UnitWithEntityNumber } from '@tww3-brawl/sdk/src/logic/twoSideCalculations';
import type { Unit, Version, Faction } from '@tww3-brawl/sdk/src/types'
import { getTyped, setTyped, type Paths } from '~/shared/jsonpath';

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
  'resistance.fire',
  'resistance.ward_save',
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
  { path: 'resistance.fire', color: 'pink', label: 'Resistance Fire' },
  { path: 'resistance.ward_save', color: 'pink', label: 'Resistance Ward Save' },
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


