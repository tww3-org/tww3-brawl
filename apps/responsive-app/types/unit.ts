import type { Unit } from '@tww3-brawl/sdk/src/types'

// Type pour la sélection d'unité avec version et faction
export interface UnitSelection {
  unit: Unit;
  version: { label: string; value: string };
  faction: { label: string; value: string };
} 