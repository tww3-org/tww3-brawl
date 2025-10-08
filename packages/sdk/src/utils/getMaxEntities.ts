import { Unit } from '../types';

export function getMaxEntities(unit: Unit) {
  if (['Hero','Lord'].includes(unit.caste)) {
    return 1;
  }
  if (unit.land_unit.num_engines > 0) {
    return unit.land_unit.num_engines;
  }
  return unit.num_men;
}
