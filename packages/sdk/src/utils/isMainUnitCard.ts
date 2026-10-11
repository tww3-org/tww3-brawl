import type { Unit } from '../types';

/**
 * Indique si une unité est la carte principale (et non une variante de monture).
 * Toutes les variantes (`_0`.. `_4`) partagent la même liste `battle_mounts`,
 * dont `base_unit` est l'id de la carte principale.
 */
export function isMainUnitCard(
  unit: Pick<Unit, 'unit' | 'battle_mounts'>
): boolean {
  const mounts = unit.battle_mounts ?? [];
  return (
    mounts.length === 0 || mounts.some(mount => mount.base_unit === unit.unit)
  );
}
