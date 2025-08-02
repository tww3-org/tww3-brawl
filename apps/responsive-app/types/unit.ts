import type { Unit, Version, Faction } from '@tww3-brawl/sdk/src/types'

// Type pour la sélection d'unité avec version et faction
export interface UnitSelection {
  unit?: Unit;
  version?: Version;
  faction?: Faction;
}

// Type pour une unité avec le nombre d'entités actives
export interface UnitWithEntityCount {
  selection: UnitSelection;
  entityCount: number;
}

// Fonction pour calculer le nombre maximum d'entités
export function getMaxEntityCount(selection: UnitSelection): number {
  if (!selection.unit?.health) {
    return 1;
  }
  
  const { unit: unitHealth, entity: entityHealth } = selection.unit.health;
  
  if (entityHealth === 0) {
    return 1;
  }
  
  return Math.floor(unitHealth / entityHealth);
} 