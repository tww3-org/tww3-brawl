# tww3-brawl

data can be directly fecth from https://broker.twwstats.com/graphql => no need to supabase (i guess)

## TODO

Add logic for health calculation to the right place (https://discordapp.com/channels/428934953628205064/428934953628205070/1364214417746690068)

```
function unitHealth(data) {
  const lu = data.land_unit;

  const caste = data.caste.toLowerCase();

  const engine_count = lu.num_engines;
  const engine_hp = lu.engine !== null ? lu.engine.battle_entity.hit_points : 0;
  const engine_type = lu.engine !== null ? lu.engine.battle_entity.type : null;

  const av_hp = lu.articulated_vehicle_entity
    ? lu.articulated_vehicle_entity.hit_points
    : 0;

  const mount_count = lu.num_mounts;
  const mount_hp = lu.mount !== null ? lu.mount.battle_entity.hit_points : 0;

  const unit_count = data.num_men;
  const unit_hp = lu.battle_entity.hit_points;
  const unit_type = lu.battle_entity.type;

  const bonus = lu.bonus_hit_points;

  let hp = 0;
  if (engine_count) {
    // I hope someday I can sit down with a CA dev that explains to me how in hell this is actually computed in the game :P
    // Tests and experimentations in https://docs.google.com/spreadsheets/d/16MUdJds1PM7poKy6bUrzpbcNRbmV68y9NonT5h_TJlE/edit#gid=1621620210
    if (
      caste === "war machine" &&
      unit_type === "man" &&
      engine_type !== "chariot"
    ) {
      // - M1 from the spreadsheet
      // - As of Paunch & Warden no unit matching this had a mount or articulated_vehicle so I exclude them from the equation here
      // but it's possible they need to be taken into account if such a case ever arise
      hp = unit_count * (unit_hp + bonus) + engine_count * (engine_hp + bonus);
    } else if (caste === "chariot") {
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
      caste === "melee cavalry" ||
      caste === "missile cavalry" ||
      caste === "war beast"
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

  return Math.round(hp * unitSizeMultiplier[globalSettings().unit_size]);
}
```

	