import type { Unit, Version, Faction } from '@tww3-brawl/sdk/src/types'

// Type pour la sélection d'unité avec version et faction
export interface UnitSelection {
  unit?: Unit;
  version?: Version;
  faction?: Faction;
} 