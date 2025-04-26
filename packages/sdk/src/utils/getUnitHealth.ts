import { main_unit } from '@tww3-brawl/gql';

// Type détaillé pour les propriétés de battle_entity utilisées
type BattleEntityProps = {
  hit_points?: number;
  type?: string;
};

// Type détaillé pour engine
type EngineProps = {
  battle_entity?: BattleEntityProps;
};

// Type détaillé pour mount
type MountProps = {
  battle_entity?: BattleEntityProps;
};

// Type détaillé pour articulated_vehicle_entity
type ArticulatedVehicleProps = {
  hit_points?: number;
};

// Type détaillé pour land_unit incluant uniquement les propriétés utilisées
type LandUnitProps = {
  num_engines?: number;
  engine?: EngineProps | null;
  articulated_vehicle_entity?: ArticulatedVehicleProps;
  num_mounts?: number;
  mount?: MountProps | null;
  battle_entity?: BattleEntityProps;
  bonus_hit_points?: number;
};

// Type raffiné qui combine Pick et définition précise des propriétés imbriquées
type UnitHealthProps = Pick<main_unit, 'caste' | 'num_men'> & {
  land_unit?: LandUnitProps;
};

// All credit to this function goes to
export function unitHealth(unit: UnitHealthProps) {
  const lu = unit.land_unit;

  if (!lu) {
    return 0;
  }

  const caste = unit.caste?.toLowerCase() || '';

  const engine_count = lu?.num_engines || 0;
  const engine_hp =
    lu?.engine !== null ? lu.engine?.battle_entity?.hit_points || 0 : 0;
  const engine_type =
    lu?.engine !== null ? lu.engine?.battle_entity?.type || null : null;

  const av_hp = lu?.articulated_vehicle_entity
    ? lu.articulated_vehicle_entity.hit_points || 0
    : 0;

  const mount_count = lu?.num_mounts || 0;
  const mount_hp =
    lu?.mount !== null ? lu.mount?.battle_entity?.hit_points || 0 : 0;

  const unit_count = unit.num_men || 0;
  const unit_hp = lu?.battle_entity?.hit_points || 0;
  const unit_type = lu?.battle_entity?.type || '';

  const bonus = lu?.bonus_hit_points || 0;

  let hp = 0;
  if (engine_count) {
    // I hope someday I can sit down with a CA dev that explains to me how in hell this is actually computed in the game :P
    // Tests and experimentations in https://docs.google.com/spreadsheets/d/16MUdJds1PM7poKy6bUrzpbcNRbmV68y9NonT5h_TJlE/edit#gid=1621620210
    if (
      caste === 'war machine' &&
      unit_type === 'man' &&
      engine_type !== 'chariot'
    ) {
      // - M1 from the spreadsheet
      // - As of Paunch & Warden no unit matching this had a mount or articulated_vehicle so I exclude them from the equation here
      // but it's possible they need to be taken into account if such a case ever arise
      hp = unit_count * (unit_hp + bonus) + engine_count * (engine_hp + bonus);
    } else if (caste === 'chariot') {
      // - M4 from the spreadsheet
      hp =
        unit_count * unit_hp +
        mount_count * engine_count * mount_hp +
        engine_count * (engine_hp + bonus) +
        engine_count * av_hp;
    } else {
      // Lord, Hero and "weird" War Machines
      // - M3 from the spreadsheet
      hp =
        unit_count * unit_hp +
        mount_count * mount_hp +
        engine_count * (engine_hp + bonus) +
        engine_count * av_hp;
    }
  } else if (mount_count) {
    if (
      caste === 'melee cavalry' ||
      caste === 'missile cavalry' ||
      caste === 'war beast'
    ) {
      // Using unit_count for mounts as well as it appears some units like squig hoppers have less mounts than units strangely and using mount_count
      // gives invalid value in this case. It might actually be JUST the squig hoppers and their ROR
      hp = unit_count * unit_hp + unit_count * (mount_hp + bonus);
    } else {
      hp = unit_count * unit_hp + mount_count * (mount_hp + bonus);
    }
  } else {
    hp = unit_count * (unit_hp + bonus);
  }

  // Define the unit size multiplier based on global settings
  const unitSizeMultiplier: Record<string, number> = {
    small: 0.65,
    normal: 1.0,
    large: 1.35,
    ultra: 1.7,
  };

  // Get the current unit size from some global settings
  // Note: In a real implementation, this would come from global app settings
  const globalSettings = () => {
    return {
      unit_size: 'normal', // Default to normal size
    };
  };

  console.log('DEBUG hp', hp * unitSizeMultiplier[globalSettings().unit_size]);
  return Math.round(hp * unitSizeMultiplier[globalSettings().unit_size]);
}
