import { Unit } from '../types';

export function getMaxEntities(unit: Unit) {
  if (unit.land_unit.num_engines > 0 && (unit.land_unit.num_engines !== unit.num_men) || (unit.land_unit.num_mounts > 0 && unit.land_unit.num_mounts !== unit.num_men)) {
    return 1;
  }
  return unit.num_men || 1;
}
