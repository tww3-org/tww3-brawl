import { Unit } from '../types';

export function getMaxEntities(unit: Unit) {
  if (unit.land_unit.num_engines > 0 || unit.land_unit.num_mounts > 0) {
    return 1;
  }
  return unit.num_men || 1;
}
