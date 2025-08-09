import type { Unit, Version, Faction } from '@tww3-brawl/sdk/src/types'

// Type for unit selection with version and faction
export interface UnitSelection {
  unit?: Unit;
  version?: Version;
  faction?: Faction;
}

// Type for unit with active entity count
export interface UnitWithEntityNumber {
  selection: UnitSelection;
  entityNumber: number;
} 