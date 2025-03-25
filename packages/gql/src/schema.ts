// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    String: string,
    Boolean: boolean,
    StringBoolean: any,
    ID: string,
    Int: number,
    Float: number,
    Upload: any,
}

export interface Query {
    ping: (Scalars['String'] | null)
    versions: ((gameVersion | null)[] | null)
    tww: (tww | null)
    __typename: 'Query'
}

export interface gameVersion {
    game: (Scalars['String'] | null)
    id: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    __typename: 'gameVersion'
}

export interface tww {
    rules: ((rule | null)[] | null)
    tww_version: (Scalars['ID'] | null)
    game_version: gameVersion
    units: ((main_unit | null)[] | null)
    unit: (main_unit | null)
    factions: ((faction | null)[] | null)
    faction: (faction | null)
    unit_stats: ((unit_stat | null)[] | null)
    abilities: ((ability | null)[] | null)
    ability: (ability | null)
    fatigue_effects: ((unit_fatigue_effect | null)[] | null)
    fatigue_morale_effects: ((kvp | null)[] | null)
    unit_experience_bonuses: ((unit_experience_bonus | null)[] | null)
    campaign_difficulty_handicap_effects: ((campaign_difficulty_handicap_effect | null)[] | null)
    unit_stats_land_experience_bonuses: ((unit_stats_land_experience_bonuse | null)[] | null)
    ui_tagged_images: ((ui_tagged_image | null)[] | null)
    kv: ((kvp | null)[] | null)
    character_trait_levels: ((character_trait_level | null)[] | null)
    unit_stat_localisations: ((unit_stat_localisation | null)[] | null)
    attributes: ((attribute | null)[] | null)
    special_ability_groups: ((special_ability_group | null)[] | null)
    ui_text_replacements: ((ui_text_replacement | null)[] | null)
    unit_stat_to_size_scaling_values: ((unit_stat_to_size_scaling_value | null)[] | null)
    __typename: 'tww'
}

export interface ui_tagged_image {
    key: (Scalars['ID'] | null)
    image_path: (Scalars['String'] | null)
    __typename: 'ui_tagged_image'
}

export interface unit_stats_land_experience_bonuse {
    xp_level: (Scalars['Int'] | null)
    fatigue: (Scalars['Int'] | null)
    mp_fixed_cost: (Scalars['Int'] | null)
    mp_experience_cost_multiplier: (Scalars['Float'] | null)
    additional_melee_cp: (Scalars['Int'] | null)
    additional_missile_cp: (Scalars['Int'] | null)
    __typename: 'unit_stats_land_experience_bonuse'
}

export interface kvp {
    key: (Scalars['ID'] | null)
    value: (Scalars['Float'] | null)
    description: (Scalars['String'] | null)
    __typename: 'kvp'
}

export interface rule {
    key: (Scalars['ID'] | null)
    value: (Scalars['Float'] | null)
    description: (Scalars['String'] | null)
    __typename: 'rule'
}

export interface melee_weapon {
    key: (Scalars['ID'] | null)
    bonus_v_cavalry: (Scalars['Int'] | null)
    bonus_v_large: (Scalars['Int'] | null)
    bonus_v_infantry: (Scalars['Int'] | null)
    damage: (Scalars['Int'] | null)
    ap_damage: (Scalars['Int'] | null)
    first_strike: (Scalars['Int'] | null)
    weapon_length: (Scalars['Float'] | null)
    melee_weapon_type: (Scalars['String'] | null)
    splash_attack_target_size: (Scalars['String'] | null)
    splash_attack_max_attacks: (Scalars['Int'] | null)
    splash_attack_power_multiplier: (Scalars['Float'] | null)
    ignition_amount: (Scalars['Int'] | null)
    is_magical: (Scalars['StringBoolean'] | null)
    contact_phase: (phase | null)
    collision_attack_max_targets: (Scalars['Int'] | null)
    collision_attack_max_targets_cooldown: (Scalars['Int'] | null)
    melee_attack_interval: (Scalars['Float'] | null)
    building_damage: (Scalars['Int'] | null)
    __typename: 'melee_weapon'
}

export interface explosion {
    key: (Scalars['ID'] | null)
    detonation_radius: (Scalars['Float'] | null)
    detonation_duration: (Scalars['Float'] | null)
    detonation_speed: (Scalars['Int'] | null)
    detonation_damage: (Scalars['Int'] | null)
    shrapnel_type: (Scalars['String'] | null)
    shrapnel_amount: (Scalars['Int'] | null)
    distance_from_target: (Scalars['Int'] | null)
    contact_phase_effect: (phase | null)
    ignition_amount: (Scalars['Int'] | null)
    is_magical: (Scalars['StringBoolean'] | null)
    detonation_damage_ap: (Scalars['Int'] | null)
    detonation_force: (Scalars['Int'] | null)
    __typename: 'explosion'
}

export interface projectile {
    key: (Scalars['ID'] | null)
    category: (Scalars['String'] | null)
    shot_type: (Scalars['String'] | null)
    explosion: (explosion | null)
    projectile_number: (Scalars['Int'] | null)
    effective_range: (Scalars['Int'] | null)
    minimum_range: (Scalars['Int'] | null)
    max_elevation: (Scalars['Int'] | null)
    muzzle_velocity: (Scalars['Int'] | null)
    marksmanship_bonus: (Scalars['Float'] | null)
    spread: (Scalars['Float'] | null)
    damage: (Scalars['Int'] | null)
    ap_damage: (Scalars['Int'] | null)
    can_bounce: (Scalars['StringBoolean'] | null)
    collision_radius: (Scalars['Float'] | null)
    base_reload_time: (Scalars['Float'] | null)
    calibration_distance: (Scalars['Float'] | null)
    calibration_area: (Scalars['Float'] | null)
    bonus_v_infantry: (Scalars['Int'] | null)
    bonus_v_cavalry: (Scalars['Int'] | null)
    bonus_v_large: (Scalars['Int'] | null)
    overhead_stat_effect: (phase | null)
    shockwave_radius: (Scalars['Float'] | null)
    can_damage_buildings: (Scalars['StringBoolean'] | null)
    contact_stat_effect: (phase | null)
    gravity: (Scalars['Float'] | null)
    burst_size: (Scalars['Int'] | null)
    burst_shot_delay: (Scalars['Float'] | null)
    mass: (Scalars['Int'] | null)
    homing_param: (Scalars['String'] | null)
    ignition_amount: (Scalars['Int'] | null)
    is_magical: (Scalars['StringBoolean'] | null)
    can_target_airborne: (Scalars['StringBoolean'] | null)
    fixed_elevation: (Scalars['Int'] | null)
    projectile_penetration: (projectile_penetration | null)
    expiry_range: (Scalars['Int'] | null)
    is_beam_launch_burst: (Scalars['StringBoolean'] | null)
    expire_on_impact: (Scalars['StringBoolean'] | null)
    can_roll: (Scalars['StringBoolean'] | null)
    trail_always_on: (Scalars['StringBoolean'] | null)
    shots_per_volley: (Scalars['Int'] | null)
    __typename: 'projectile'
}

export interface projectile_penetration {
    key: (Scalars['String'] | null)
    entity_size_cap: (Scalars['String'] | null)
    max_penetration: (Scalars['Int'] | null)
    description: (Scalars['String'] | null)
    __typename: 'projectile_penetration'
}

export interface missile_weapon {
    key: (Scalars['ID'] | null)
    default_projectile: (projectile | null)
    use_secondary_ammo_pool: (Scalars['StringBoolean'] | null)
    __typename: 'missile_weapon'
}

export interface unit_shield_type {
    key: (Scalars['ID'] | null)
    parry_chance: (Scalars['Int'] | null)
    material: (Scalars['String'] | null)
    __typename: 'unit_shield_type'
}

export interface bullet_point_generator {
    bullet_point_enum: (Scalars['String'] | null)
    text_override: (Scalars['String'] | null)
    unit_class: (Scalars['String'] | null)
    unit_stat: (Scalars['String'] | null)
    unit_stat_threshold: (Scalars['Int'] | null)
    __typename: 'bullet_point_generator'
}

export interface unit_class {
    key: (Scalars['ID'] | null)
    onscreen: (Scalars['String'] | null)
    sort_priority: (Scalars['Int'] | null)
    bullet_point_generators: ((bullet_point_generator | null)[] | null)
    __typename: 'unit_class'
}

export interface armour {
    key: (Scalars['ID'] | null)
    armour_value: (Scalars['Int'] | null)
    __typename: 'armour'
}

export interface land_unit {
    key: (Scalars['String'] | null)
    accuracy: (Scalars['Int'] | null)
    category: (Scalars['String'] | null)
    charge_bonus: (Scalars['Int'] | null)
    dismounted_charge_bonus: (Scalars['Int'] | null)
    dismounted_melee_attack: (Scalars['Int'] | null)
    historical_description_text: (Scalars['String'] | null)
    melee_attack: (Scalars['Int'] | null)
    melee_defence: (Scalars['Int'] | null)
    ground_stat_effect_group: (ground_type_stat_effect_group | null)
    morale: (Scalars['Int'] | null)
    bonus_hit_points: (Scalars['Int'] | null)
    short_description_text: (Scalars['String'] | null)
    visibility_spotting_range_min: (Scalars['Int'] | null)
    visibility_spotting_range_max: (Scalars['Int'] | null)
    attribute_group: (Scalars['String'] | null)
    spot_dist_tree: (Scalars['Int'] | null)
    spot_dist_scrub: (Scalars['Int'] | null)
    reload: (Scalars['Int'] | null)
    hiding_scalar: (Scalars['Float'] | null)
    secondary_ammo: (Scalars['Int'] | null)
    primary_ammo: (Scalars['Int'] | null)
    damage_mod_flame: (Scalars['Int'] | null)
    damage_mod_flames: (Scalars['Int'] | null)
    damage_mod_magic: (Scalars['Int'] | null)
    damage_mod_physical: (Scalars['Int'] | null)
    damage_mod_missile: (Scalars['Int'] | null)
    damage_mod_missiles: (Scalars['Int'] | null)
    damage_mod_all: (Scalars['Int'] | null)
    num_engines: (Scalars['Int'] | null)
    num_mounts: (Scalars['Int'] | null)
    ai_usage_group: (Scalars['String'] | null)
    can_skirmish: (Scalars['StringBoolean'] | null)
    onscreen_name: (Scalars['String'] | null)
    armour: (armour | null)
    unit_class: (unit_class | null)
    mount: (mount | null)
    primary_melee_weapon: (melee_weapon | null)
    primary_missile_weapon: (missile_weapon | null)
    shield: (unit_shield_type | null)
    attributes: ((attribute | null)[] | null)
    abilities: ((ability | null)[] | null)
    special_ability_groups: ((special_ability_group | null)[] | null)
    battle_entity: (battle_entity | null)
    engine: (engine | null)
    officers: (land_unit_officers | null)
    variant: (unit_variant | null)
    articulated_vehicle_entity: (battle_entity | null)
    __typename: 'land_unit'
}

export interface ground_type_stat_effect_group {
    group_name: (Scalars['String'] | null)
    onscreen_name: (Scalars['String'] | null)
    stat_effects: ((ground_type_to_stat_effect | null)[] | null)
    __typename: 'ground_type_stat_effect_group'
}

export interface ground_type_to_stat_effect {
    ground_type: (Scalars['String'] | null)
    affected_stat: (Scalars['String'] | null)
    multiplier: (Scalars['Float'] | null)
    affected_group: (Scalars['String'] | null)
    __typename: 'ground_type_to_stat_effect'
}

export interface attribute {
    key: (Scalars['ID'] | null)
    bullet_text: (Scalars['String'] | null)
    imbued_effect_text: (Scalars['String'] | null)
    __typename: 'attribute'
}

export interface mount {
    key: (Scalars['ID'] | null)
    battle_entity: (battle_entity | null)
    variant: (Scalars['String'] | null)
    __typename: 'mount'
}

export interface engine {
    key: (Scalars['ID'] | null)
    engine_type: (Scalars['String'] | null)
    missile_weapon: (missile_weapon | null)
    battle_entity: (battle_entity | null)
    __typename: 'engine'
}

export interface land_unit_officers {
    officer_1: (battle_personality | null)
    additionnal_personalities: ((battle_personality | null)[] | null)
    __typename: 'land_unit_officers'
}

export interface battle_mount {
    base_unit: (Scalars['String'] | null)
    mounted_unit: (Scalars['String'] | null)
    icon_name: (Scalars['String'] | null)
    mount_name: (Scalars['String'] | null)
    localised_description: (Scalars['String'] | null)
    __typename: 'battle_mount'
}

export interface battle_personality {
    key: (Scalars['ID'] | null)
    type: (Scalars['String'] | null)
    missile_type: (projectile | null)
    variant: (unit_variant | null)
    battle_entity: (battle_entity | null)
    rider_attachment_point: (Scalars['String'] | null)
    battle_entity_stats: (battle_entity_stats | null)
    autonomous_rider_hero: (Scalars['StringBoolean'] | null)
    __typename: 'battle_personality'
}

export interface battle_entity_stats {
    primary_melee_weapon: (melee_weapon | null)
    primary_missile_weapon: (missile_weapon | null)
    __typename: 'battle_entity_stats'
}

export interface battle_entity {
    key: (Scalars['ID'] | null)
    type: (Scalars['String'] | null)
    walk_speed: (Scalars['Float'] | null)
    run_speed: (Scalars['Float'] | null)
    acceleration: (Scalars['Float'] | null)
    deceleration: (Scalars['Float'] | null)
    charge_speed: (Scalars['Float'] | null)
    crawl_speed: (Scalars['Int'] | null)
    charge_distance_commence_run: (Scalars['Float'] | null)
    charge_distance_adopt_charge_pose: (Scalars['Float'] | null)
    charge_distance_pick_target: (Scalars['Float'] | null)
    shape: (Scalars['String'] | null)
    radius: (Scalars['Float'] | null)
    mass: (Scalars['Float'] | null)
    height: (Scalars['Float'] | null)
    fire_arc_close: (Scalars['Float'] | null)
    turn_speed: (Scalars['Float'] | null)
    hit_points: (Scalars['Int'] | null)
    min_turning_speed: (Scalars['Float'] | null)
    fly_speed: (Scalars['Float'] | null)
    flying_charge_speed: (Scalars['Float'] | null)
    size: (Scalars['String'] | null)
    strafe_speed: (Scalars['Float'] | null)
    combat_reaction_radius: (Scalars['Float'] | null)
    entity_effects: (Scalars['String'] | null)
    hit_reactions_ignore_chance: (Scalars['Float'] | null)
    knock_interrupts_ignore_chance: (Scalars['Float'] | null)
    __typename: 'battle_entity'
}

export interface special_ability_group {
    ability_group: (Scalars['ID'] | null)
    icon_path: (Scalars['String'] | null)
    special_edition_mask: (Scalars['Int'] | null)
    sort_order: (Scalars['Int'] | null)
    is_naval: (Scalars['StringBoolean'] | null)
    colour_r: (Scalars['Int'] | null)
    colour_g: (Scalars['Int'] | null)
    colour_b: (Scalars['Int'] | null)
    button_name: (Scalars['String'] | null)
    abilities: ((ability | null)[] | null)
    name: (Scalars['String'] | null)
    is_composite_group: (Scalars['StringBoolean'] | null)
    __typename: 'special_ability_group'
}

export interface ability {
    key: (Scalars['ID'] | null)
    supercedes_ability: (Scalars['StringBoolean'] | null)
    requires_effect_enabling: (Scalars['StringBoolean'] | null)
    icon_name: (Scalars['String'] | null)
    uniqueness: (Scalars['String'] | null)
    is_unit_upgrade: (Scalars['StringBoolean'] | null)
    is_hidden_in_ui: (Scalars['StringBoolean'] | null)
    name: (Scalars['String'] | null)
    tooltip: (Scalars['String'] | null)
    type: (ability_type | null)
    unit_special_ability: (special_ability | null)
    overpower_option: (ability | null)
    phases: ((phase | null)[] | null)
    special_ability_groups: ((special_ability_group | null)[] | null)
    additional_ui_effects: ((additional_ui_effect | null)[] | null)
    __typename: 'ability'
}

export interface additional_ui_effect {
    key: (Scalars['ID'] | null)
    localised_text: (Scalars['String'] | null)
    sort_order: (Scalars['Int'] | null)
    __typename: 'additional_ui_effect'
}

export interface invalid_usage_flag {
    flag_key: (Scalars['ID'] | null)
    flag_description: (Scalars['String'] | null)
    alt_description: (Scalars['String'] | null)
    __typename: 'invalid_usage_flag'
}

export interface special_ability {
    key: (Scalars['ID'] | null)
    active_time: (Scalars['Float'] | null)
    recharge_time: (Scalars['Float'] | null)
    num_uses: (Scalars['Int'] | null)
    effect_range: (Scalars['Int'] | null)
    affect_self: (Scalars['StringBoolean'] | null)
    num_effected_friendly_units: (Scalars['Int'] | null)
    num_effected_enemy_units: (Scalars['Int'] | null)
    update_targets_every_frame: (Scalars['StringBoolean'] | null)
    initial_recharge: (Scalars['Float'] | null)
    target_friends: (Scalars['StringBoolean'] | null)
    target_enemies: (Scalars['StringBoolean'] | null)
    target_ground: (Scalars['StringBoolean'] | null)
    target_intercept_range: (Scalars['Int'] | null)
    assume_specific_behaviour: (Scalars['String'] | null)
    clear_current_order: (Scalars['StringBoolean'] | null)
    wind_up_time: (Scalars['Float'] | null)
    passive: (Scalars['StringBoolean'] | null)
    unique_id: (Scalars['Int'] | null)
    wind_up_stance: (Scalars['String'] | null)
    mana_cost: (Scalars['Int'] | null)
    min_range: (Scalars['Int'] | null)
    targetting_aoe: (Scalars['String'] | null)
    passive_aoe: (Scalars['String'] | null)
    active_aoe: (Scalars['String'] | null)
    activation_effect: (Scalars['String'] | null)
    vortex: (vortex | null)
    miscast_chance: (Scalars['Float'] | null)
    ai_usage: (Scalars['String'] | null)
    special_ability_display: (Scalars['String'] | null)
    additional_melee_cp: (Scalars['Float'] | null)
    additional_missile_cp: (Scalars['Float'] | null)
    bombardment: (projectile_bombardments | null)
    spawned_unit: (land_unit | null)
    miscast_explosion: (explosion | null)
    parent_ability: (special_ability | null)
    activated_projectile: (projectile | null)
    phases: ((phase | null)[] | null)
    invalid_targets: (Scalars['String'][] | null)
    invalid_usages: (Scalars['String'][] | null)
    auto_deactivate_flags: (invalid_usage_flag[] | null)
    __typename: 'special_ability'
}

export interface projectile_bombardments {
    arrival_window: (Scalars['Float'] | null)
    bombardment_key: (Scalars['ID'] | null)
    num_projectiles: (Scalars['Int'] | null)
    radius_spread: (Scalars['Float'] | null)
    start_time: (Scalars['Float'] | null)
    launch_source: (Scalars['String'] | null)
    launch_height: (Scalars['Int'] | null)
    launch_height_underground: (Scalars['Int'] | null)
    projectile_type: (projectile | null)
    __typename: 'projectile_bombardments'
}

export interface vortex {
    change_max_angle: (Scalars['Int'] | null)
    contact_effect: (phase | null)
    damage: (Scalars['Int'] | null)
    damage_ap: (Scalars['Int'] | null)
    duration: (Scalars['Float'] | null)
    expansion_speed: (Scalars['Float'] | null)
    goal_radius: (Scalars['Float'] | null)
    infinite_height: (Scalars['StringBoolean'] | null)
    move_change_freq: (Scalars['Float'] | null)
    movement_speed: (Scalars['Float'] | null)
    start_radius: (Scalars['Float'] | null)
    vortex_key: (Scalars['ID'] | null)
    ignition_amount: (Scalars['Int'] | null)
    is_magical: (Scalars['StringBoolean'] | null)
    detonation_force: (Scalars['Int'] | null)
    launch_source: (Scalars['String'] | null)
    building_collision: (Scalars['String'] | null)
    height_off_ground: (Scalars['Float'] | null)
    delay: (Scalars['Float'] | null)
    num_vortexs: (Scalars['Int'] | null)
    __typename: 'vortex'
}

export interface phase {
    id: (Scalars['ID'] | null)
    onscreen_name: (Scalars['String'] | null)
    duration: (Scalars['Float'] | null)
    effect_type: (Scalars['String'] | null)
    requested_stance: (Scalars['String'] | null)
    unbreakable: (Scalars['StringBoolean'] | null)
    cant_move: (Scalars['StringBoolean'] | null)
    freeze_fatigue: (Scalars['StringBoolean'] | null)
    fatigue_change_ratio: (Scalars['Float'] | null)
    inspiration_aura_change_mod: (Scalars['Float'] | null)
    ability_recharge_change: (Scalars['Float'] | null)
    hp_change_frequency: (Scalars['Float'] | null)
    heal_amount: (Scalars['Float'] | null)
    damage_chance: (Scalars['Float'] | null)
    damage_amount: (Scalars['Int'] | null)
    max_damaged_entities: (Scalars['Int'] | null)
    resurrect: (Scalars['StringBoolean'] | null)
    mana_regen_mod: (Scalars['Float'] | null)
    mana_max_depletion_mod: (Scalars['Float'] | null)
    imbue_magical: (Scalars['StringBoolean'] | null)
    imbue_ignition: (Scalars['Float'] | null)
    imbue_contact: (phase | null)
    phase_display: (Scalars['String'] | null)
    stat_effects: ((stat_effect | null)[] | null)
    attribute_effects: ((attribute_effect | null)[] | null)
    __typename: 'phase'
}

export interface stat_effect {
    phase: (Scalars['ID'] | null)
    stat: (Scalars['String'] | null)
    value: (Scalars['Float'] | null)
    how: (Scalars['String'] | null)
    __typename: 'stat_effect'
}

export interface attribute_effect {
    phase: (Scalars['ID'] | null)
    attribute: (Scalars['String'] | null)
    attribute_type: (Scalars['String'] | null)
    __typename: 'attribute_effect'
}

export interface ability_type {
    key: (Scalars['String'] | null)
    icon: (Scalars['String'] | null)
    onscreen_name: (Scalars['String'] | null)
    __typename: 'ability_type'
}

export interface unit_variant {
    unit: (Scalars['ID'] | null)
    faction: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    variant: (Scalars['String'] | null)
    unit_card: (Scalars['String'] | null)
    unit_card_url: (Scalars['String'] | null)
    __typename: 'unit_variant'
}

export interface ui_unit_group {
    icon: (Scalars['String'] | null)
    key: (Scalars['ID'] | null)
    parent_group: (ui_unit_group_parent | null)
    name: (Scalars['String'] | null)
    tooltip: (Scalars['String'] | null)
    __typename: 'ui_unit_group'
}

export interface ui_unit_group_parent {
    key: (Scalars['ID'] | null)
    onscreen_name: (Scalars['String'] | null)
    icon: (Scalars['String'] | null)
    order: (Scalars['Int'] | null)
    mp_cap: (Scalars['Int'] | null)
    __typename: 'ui_unit_group_parent'
}

export interface battle_set_piece_armies_character {
    character_level: (Scalars['Int'] | null)
    character_name: (Scalars['ID'] | null)
    forename: (Scalars['String'] | null)
    magic_lore: (Scalars['String'] | null)
    num_men: (Scalars['Int'] | null)
    surname: (Scalars['String'] | null)
    unit_type: (Scalars['String'] | null)
    agent_type: (Scalars['String'] | null)
    agent_subtype: (Scalars['String'] | null)
    portrait: (Scalars['String'] | null)
    character_model: (Scalars['Int'] | null)
    skillset: (Scalars['String'] | null)
    male: (Scalars['StringBoolean'] | null)
    ancillaries: ((ancillary | null)[] | null)
    __typename: 'battle_set_piece_armies_character'
}

export interface ancillary {
    key: (Scalars['ID'] | null)
    onscreen_name: (Scalars['String'] | null)
    applies_to: (Scalars['String'] | null)
    transferrable: (Scalars['StringBoolean'] | null)
    unique_to_world: (Scalars['StringBoolean'] | null)
    unique_to_faction: (Scalars['StringBoolean'] | null)
    precedence: (Scalars['Int'] | null)
    legendary_item: (Scalars['StringBoolean'] | null)
    uniqueness_score: (Scalars['Int'] | null)
    turns_before_swap_allowed: (Scalars['Int'] | null)
    randomly_dropped: (Scalars['StringBoolean'] | null)
    provided_bodyguard_unit: (Scalars['String'] | null)
    provided_banner: (banner | null)
    subcategory: (Scalars['String'] | null)
    category: (Scalars['String'] | null)
    type: (Scalars['String'] | null)
    ancillary_effects: ((ancillary_effect | null)[] | null)
    __typename: 'ancillary'
}

export interface ancillary_effect {
    value: (Scalars['Float'] | null)
    effect_scope: (Scalars['String'] | null)
    effect: (effect | null)
    __typename: 'ancillary_effect'
}

export interface banner {
    banner: (Scalars['ID'] | null)
    effect_bundle: (effect_bundle | null)
    __typename: 'banner'
}

export interface effect_bundle {
    key: (Scalars['ID'] | null)
    localised_title: (Scalars['String'] | null)
    localised_description: (Scalars['String'] | null)
    ui_icon: (Scalars['String'] | null)
    bundle_target: (Scalars['String'] | null)
    priority: (Scalars['Int'] | null)
    effect_bundle_effects: ((effect_bundle_effect | null)[] | null)
    __typename: 'effect_bundle'
}

export interface effect_bundle_effect {
    effect: (effect | null)
    value: (Scalars['Int'] | null)
    effect_scope: (Scalars['String'] | null)
    advancement_stage: (Scalars['String'] | null)
    __typename: 'effect_bundle_effect'
}

export interface agent_action {
    ability: (ability | null)
    localised_action_name: (Scalars['String'] | null)
    localised_action_description: (Scalars['String'] | null)
    unique_id: (Scalars['String'] | null)
    critical_success_proportion_modifier: (Scalars['Float'] | null)
    opportune_failure_proportion_modifier: (Scalars['Float'] | null)
    critical_failure_proportion_modifier: (Scalars['Float'] | null)
    chance_of_success: (Scalars['Int'] | null)
    icon_path: (Scalars['String'] | null)
    show_action_info_in_ui: (Scalars['StringBoolean'] | null)
    subculture: (subculture | null)
    succeed_always_override: (Scalars['StringBoolean'] | null)
    order: (Scalars['Int'] | null)
    __typename: 'agent_action'
}

export interface effect {
    effect: (Scalars['ID'] | null)
    icon: (Scalars['String'] | null)
    priority: (Scalars['Int'] | null)
    description: (Scalars['String'] | null)
    icon_negative: (Scalars['String'] | null)
    category: (Scalars['String'] | null)
    is_positive_value_good: (Scalars['StringBoolean'] | null)
    agent_actions: ((effect_bonus | null)[] | null)
    phases: ((effect_bonus | null)[] | null)
    attributes: ((effect_bonus | null)[] | null)
    abilities: ((effect_bonus | null)[] | null)
    __typename: 'effect'
}

export type effect_bonus_value = (agent_action | phase | ability | attribute_effect) & { __isUnion?: true }

export interface effect_bonus {
    bonus_value_id: (Scalars['String'] | null)
    value: (effect_bonus_value | null)
    __typename: 'effect_bonus'
}

export interface main_unit {
    unit: (Scalars['ID'] | null)
    land_unit: (land_unit | null)
    num_men: (Scalars['Int'] | null)
    multiplayer_cost: (Scalars['Int'] | null)
    weight: (Scalars['String'] | null)
    recruitment_cost: (Scalars['Int'] | null)
    upkeep_cost: (Scalars['Int'] | null)
    create_time: (Scalars['Int'] | null)
    campaign_cap: (Scalars['Int'] | null)
    multiplayer_cap: (Scalars['Int'] | null)
    caste: (Scalars['String'] | null)
    unique_index: (Scalars['Int'] | null)
    ui_unit_group: (ui_unit_group | null)
    tier: (Scalars['Int'] | null)
    is_high_threat: (Scalars['StringBoolean'] | null)
    campaign_mount: (campaign_mount | null)
    mount_name: (Scalars['String'] | null)
    battle_mounts: ((battle_mount | null)[] | null)
    melee_cp: (Scalars['Float'] | null)
    missile_cp: (Scalars['Float'] | null)
    is_monstrous: (Scalars['StringBoolean'] | null)
    campaign_factions: ((faction | null)[] | null)
    factions: ((faction | null)[] | null)
    custom_battle_permissions: ((unit_custom_battle_permission | null)[] | null)
    bullet_points: ((bullet_point | null)[] | null)
    is_naval: (Scalars['StringBoolean'] | null)
    unit_sets: ((unit_set | null)[] | null)
    agent_subtype: (agent_subtype | null)
    can_siege: (Scalars['StringBoolean'] | null)
    barrier_health: (Scalars['Float'] | null)
    __typename: 'main_unit'
}

export interface unit_set {
    key: Scalars['ID']
    use_unit_exp_level_range: (Scalars['StringBoolean'] | null)
    min_unit_exp_level_inclusive: (Scalars['Int'] | null)
    max_unit_exp_level_inclusive: (Scalars['Int'] | null)
    special_category: (Scalars['String'] | null)
    __typename: 'unit_set'
}

export interface unit_custom_battle_permission {
    faction: (Scalars['String'] | null)
    general_unit: (Scalars['StringBoolean'] | null)
    unit: (Scalars['String'] | null)
    siege_unit_attacker: (Scalars['StringBoolean'] | null)
    siege_unit_defender: (Scalars['StringBoolean'] | null)
    general_portrait: (Scalars['String'] | null)
    general_uniform: (Scalars['String'] | null)
    set_piece_character: (battle_set_piece_armies_character | null)
    campaign_exclusive: (Scalars['StringBoolean'] | null)
    __typename: 'unit_custom_battle_permission'
}

export interface campaign_mount {
    model: (Scalars['String'] | null)
    variant: (Scalars['String'] | null)
    scale: (Scalars['Float'] | null)
    actor: (Scalars['String'] | null)
    __typename: 'campaign_mount'
}

export interface bullet_point {
    key: (Scalars['ID'] | null)
    state: (Scalars['String'] | null)
    sort_order: (Scalars['Int'] | null)
    onscreen_name: (Scalars['String'] | null)
    tooltip: (Scalars['String'] | null)
    __typename: 'bullet_point'
}

export interface unit_fatigue_effect {
    key: (Scalars['ID'] | null)
    fatigue_threshold: (Scalars['Int'] | null)
    fatigue_level: (Scalars['String'] | null)
    scalar_speed: (Scalars['Float'] | null)
    stat_melee_attack: (Scalars['Float'] | null)
    stat_reloading: (Scalars['Float'] | null)
    stat_armour: (Scalars['Float'] | null)
    stat_charge_bonus: (Scalars['Float'] | null)
    stat_melee_damage_ap: (Scalars['Float'] | null)
    stat_melee_defense: (Scalars['Float'] | null)
    stat_melee_defence: (Scalars['Float'] | null)
    __typename: 'unit_fatigue_effect'
}

export interface unit_experience_bonus {
    stat: (Scalars['ID'] | null)
    value: (Scalars['Int'] | null)
    growth_rate: (Scalars['Float'] | null)
    growth_scalar: (Scalars['Float'] | null)
    __typename: 'unit_experience_bonus'
}

export interface military_group {
    name: (Scalars['String'] | null)
    __typename: 'military_group'
}

export interface faction {
    key: (Scalars['ID'] | null)
    subculture: (subculture | null)
    screen_name: (Scalars['String'] | null)
    screen_adjective: (Scalars['String'] | null)
    is_rebel: (Scalars['StringBoolean'] | null)
    mp_available: (Scalars['StringBoolean'] | null)
    flags_path: (Scalars['String'] | null)
    flags_url: (Scalars['String'] | null)
    name_group: (Scalars['String'] | null)
    primary_colour_hex: (Scalars['String'] | null)
    secondary_colour_hex: (Scalars['String'] | null)
    military_group: (Scalars['String'] | null)
    can_be_horde: (Scalars['StringBoolean'] | null)
    faction_swapping_id: (Scalars['String'] | null)
    is_waaagh_faction: (Scalars['StringBoolean'] | null)
    is_quest_faction: (Scalars['StringBoolean'] | null)
    units: ((main_unit | null)[] | null)
    __typename: 'faction'
}

export interface subculture {
    subculture: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    culture: (culture | null)
    __typename: 'subculture'
}

export interface culture {
    key: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    __typename: 'culture'
}

export interface unit_stat {
    key: (Scalars['ID'] | null)
    max_value: (Scalars['Int'] | null)
    campaign_only: (Scalars['StringBoolean'] | null)
    sort_order: (Scalars['Int'] | null)
    localisation: (Scalars['String'] | null)
    icon: (Scalars['String'] | null)
    __typename: 'unit_stat'
}

export interface campaign_difficulty_handicap_effect {
    key: (Scalars['ID'] | null)
    campaign_difficulty_handicap: (Scalars['Int'] | null)
    human: (Scalars['StringBoolean'] | null)
    effect: (effect | null)
    effect_scope: (Scalars['String'] | null)
    effect_value: (Scalars['String'] | null)
    optional_campaign_key: (Scalars['String'] | null)
    __typename: 'campaign_difficulty_handicap_effect'
}

export interface character_trait_level {
    key: Scalars['ID']
    onscreen_name: (Scalars['String'] | null)
    character_trait: (character_trait | null)
    level: (Scalars['Int'] | null)
    threshold_points: (Scalars['Int'] | null)
    colour_text: (Scalars['String'] | null)
    explanation_text: (Scalars['String'] | null)
    removal_text: (Scalars['String'] | null)
    trait_level_effects: ((trait_level_effect | null)[] | null)
    __typename: 'character_trait_level'
}

export interface trait_level_effect {
    effect: (effect | null)
    value: (Scalars['Float'] | null)
    effect_scope: (Scalars['String'] | null)
    __typename: 'trait_level_effect'
}

export interface character_trait {
    key: Scalars['ID']
    no_going_back_level: (Scalars['Int'] | null)
    hidden: Scalars['StringBoolean']
    precedence: (Scalars['Int'] | null)
    category: (trait_category | null)
    author: (Scalars['String'] | null)
    comment: (Scalars['String'] | null)
    ui_priority: (Scalars['Int'] | null)
    antitrait: (Scalars['String'] | null)
    __typename: 'character_trait'
}

export interface trait_category {
    category: Scalars['ID']
    icon_path: (Scalars['String'] | null)
    __typename: 'trait_category'
}

export interface agent_subtype {
    key: Scalars['ID']
    auto_generate: (Scalars['StringBoolean'] | null)
    is_caster: (Scalars['StringBoolean'] | null)
    small_icon: (Scalars['String'] | null)
    associated_unit_override: Scalars['String']
    audio_voiceover_actor_group: (Scalars['String'] | null)
    show_in_ui: (Scalars['StringBoolean'] | null)
    cap: (Scalars['Int'] | null)
    has_female_name: (Scalars['StringBoolean'] | null)
    can_gain_xp: (Scalars['StringBoolean'] | null)
    loyality_is_applicable: (Scalars['StringBoolean'] | null)
    contributes_to_agent_cap: (Scalars['StringBoolean'] | null)
    onscreen_name_override: (Scalars['String'] | null)
    description_text_override: (Scalars['String'] | null)
    character_skill_node_set: (character_skill_node_set | null)
    __typename: 'agent_subtype'
}

export interface character_skill_node_set {
    agent_key: (Scalars['String'] | null)
    campaign_key: (Scalars['String'] | null)
    faction_key: (Scalars['String'] | null)
    key: (Scalars['String'] | null)
    subculture: (Scalars['String'] | null)
    for_army: (Scalars['StringBoolean'] | null)
    for_navy: (Scalars['StringBoolean'] | null)
    agent_subtype_key: (Scalars['String'] | null)
    enc_title: (Scalars['String'] | null)
    character_skill_nodes: ((character_skill_node | null)[] | null)
    __typename: 'character_skill_node_set'
}

export interface character_skill_node {
    campaign_key: (Scalars['String'] | null)
    character_skill_key: (Scalars['String'] | null)
    character_skill_node_set_key: (Scalars['String'] | null)
    faction_key: (Scalars['String'] | null)
    indent: (Scalars['Int'] | null)
    key: Scalars['ID']
    tier: (Scalars['Int'] | null)
    subculture: (Scalars['String'] | null)
    points_on_creation: (Scalars['Int'] | null)
    required_num_parents: (Scalars['Int'] | null)
    visible_in_ui: (Scalars['StringBoolean'] | null)
    __typename: 'character_skill_node'
}

export interface character_skill {
    image_path: (Scalars['String'] | null)
    key: (Scalars['ID'] | null)
    localised_description: (Scalars['String'] | null)
    localised_name: (Scalars['String'] | null)
    unlocked_at_rank: (Scalars['Int'] | null)
    is_background_skill: (Scalars['StringBoolean'] | null)
    is_female_only_background_skill: (Scalars['StringBoolean'] | null)
    is_male_only_background_skill: (Scalars['StringBoolean'] | null)
    background_weighting: (Scalars['Int'] | null)
    influence_cost: (Scalars['Int'] | null)
    __typename: 'character_skill'
}

export interface character_skill_category {
    key: (Scalars['ID'] | null)
    max_incident: (Scalars['Int'] | null)
    min_incident: (Scalars['Int'] | null)
    order: (Scalars['Int'] | null)
    col_r: (Scalars['Int'] | null)
    col_g: (Scalars['Int'] | null)
    col_b: (Scalars['Int'] | null)
    agent_subtype_override: (Scalars['String'] | null)
    __typename: 'character_skill_category'
}

export interface character_skill_level_detail {
    campaign_key: (Scalars['ID'] | null)
    faction_key: (Scalars['ID'] | null)
    image_path: (Scalars['String'] | null)
    level: (Scalars['Int'] | null)
    skill_key: (Scalars['String'] | null)
    subculture_key: (Scalars['String'] | null)
    unlocked_at_rank: (Scalars['Int'] | null)
    localised_name: (Scalars['String'] | null)
    localised_description: (Scalars['String'] | null)
    __typename: 'character_skill_level_detail'
}

export interface unit_stat_localisation {
    stat_key: (Scalars['ID'] | null)
    onscreen_name: (Scalars['String'] | null)
    tooltip_text: (Scalars['String'] | null)
    __typename: 'unit_stat_localisation'
}

export interface ui_text_replacement {
    key: (Scalars['ID'] | null)
    localised_text: (Scalars['String'] | null)
    __typename: 'ui_text_replacement'
}

export interface unit_stat_to_size_scaling_value {
    stat: (Scalars['ID'] | null)
    size: (Scalars['String'] | null)
    single_entity_value: (Scalars['Float'] | null)
    multi_entity_value: (Scalars['Float'] | null)
    __typename: 'unit_stat_to_size_scaling_value'
}

export type CacheControlScope = 'PUBLIC' | 'PRIVATE'

export interface QueryGenqlSelection{
    ping?: boolean | number
    versions?: gameVersionGenqlSelection
    tww?: (twwGenqlSelection & { __args: {tww_version: Scalars['String']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface gameVersionGenqlSelection{
    game?: boolean | number
    id?: boolean | number
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface twwGenqlSelection{
    rules?: ruleGenqlSelection
    tww_version?: boolean | number
    game_version?: gameVersionGenqlSelection
    units?: (main_unitGenqlSelection & { __args: {offset: Scalars['Int'], size: Scalars['Int'], includeQb?: (Scalars['Boolean'] | null), includeSummoned?: (Scalars['Boolean'] | null), includeBosses?: (Scalars['Boolean'] | null), includeSouthenRealms?: (Scalars['Boolean'] | null), includeKislev?: (Scalars['Boolean'] | null), query?: (Scalars['String'] | null)} })
    unit?: (main_unitGenqlSelection & { __args?: {id?: (Scalars['String'] | null)} })
    factions?: (factionGenqlSelection & { __args?: {include_non_mp?: (Scalars['StringBoolean'] | null)} })
    faction?: (factionGenqlSelection & { __args?: {id?: (Scalars['String'] | null)} })
    unit_stats?: unit_statGenqlSelection
    abilities?: (abilityGenqlSelection & { __args: {offset: Scalars['Int'], size: Scalars['Int'], special_ability_group?: (Scalars['String'] | null), query?: (Scalars['String'] | null), noGroupsOnly?: (Scalars['Boolean'] | null)} })
    ability?: (abilityGenqlSelection & { __args?: {id?: (Scalars['String'] | null)} })
    fatigue_effects?: unit_fatigue_effectGenqlSelection
    fatigue_morale_effects?: kvpGenqlSelection
    unit_experience_bonuses?: unit_experience_bonusGenqlSelection
    campaign_difficulty_handicap_effects?: campaign_difficulty_handicap_effectGenqlSelection
    unit_stats_land_experience_bonuses?: unit_stats_land_experience_bonuseGenqlSelection
    ui_tagged_images?: ui_tagged_imageGenqlSelection
    kv?: (kvpGenqlSelection & { __args: {name: Scalars['String']} })
    character_trait_levels?: character_trait_levelGenqlSelection
    unit_stat_localisations?: unit_stat_localisationGenqlSelection
    attributes?: attributeGenqlSelection
    special_ability_groups?: special_ability_groupGenqlSelection
    ui_text_replacements?: ui_text_replacementGenqlSelection
    unit_stat_to_size_scaling_values?: unit_stat_to_size_scaling_valueGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ui_tagged_imageGenqlSelection{
    key?: boolean | number
    image_path?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_stats_land_experience_bonuseGenqlSelection{
    xp_level?: boolean | number
    fatigue?: boolean | number
    mp_fixed_cost?: boolean | number
    mp_experience_cost_multiplier?: boolean | number
    additional_melee_cp?: boolean | number
    additional_missile_cp?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface kvpGenqlSelection{
    key?: boolean | number
    value?: boolean | number
    description?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ruleGenqlSelection{
    key?: boolean | number
    value?: boolean | number
    description?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface melee_weaponGenqlSelection{
    key?: boolean | number
    bonus_v_cavalry?: boolean | number
    bonus_v_large?: boolean | number
    bonus_v_infantry?: boolean | number
    damage?: boolean | number
    ap_damage?: boolean | number
    first_strike?: boolean | number
    weapon_length?: boolean | number
    melee_weapon_type?: boolean | number
    splash_attack_target_size?: boolean | number
    splash_attack_max_attacks?: boolean | number
    splash_attack_power_multiplier?: boolean | number
    ignition_amount?: boolean | number
    is_magical?: boolean | number
    contact_phase?: phaseGenqlSelection
    collision_attack_max_targets?: boolean | number
    collision_attack_max_targets_cooldown?: boolean | number
    melee_attack_interval?: boolean | number
    building_damage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface explosionGenqlSelection{
    key?: boolean | number
    detonation_radius?: boolean | number
    detonation_duration?: boolean | number
    detonation_speed?: boolean | number
    detonation_damage?: boolean | number
    shrapnel_type?: boolean | number
    shrapnel_amount?: boolean | number
    distance_from_target?: boolean | number
    contact_phase_effect?: phaseGenqlSelection
    ignition_amount?: boolean | number
    is_magical?: boolean | number
    detonation_damage_ap?: boolean | number
    detonation_force?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface projectileGenqlSelection{
    key?: boolean | number
    category?: boolean | number
    shot_type?: boolean | number
    explosion?: explosionGenqlSelection
    projectile_number?: boolean | number
    effective_range?: boolean | number
    minimum_range?: boolean | number
    max_elevation?: boolean | number
    muzzle_velocity?: boolean | number
    marksmanship_bonus?: boolean | number
    spread?: boolean | number
    damage?: boolean | number
    ap_damage?: boolean | number
    can_bounce?: boolean | number
    collision_radius?: boolean | number
    base_reload_time?: boolean | number
    calibration_distance?: boolean | number
    calibration_area?: boolean | number
    bonus_v_infantry?: boolean | number
    bonus_v_cavalry?: boolean | number
    bonus_v_large?: boolean | number
    overhead_stat_effect?: phaseGenqlSelection
    shockwave_radius?: boolean | number
    can_damage_buildings?: boolean | number
    contact_stat_effect?: phaseGenqlSelection
    gravity?: boolean | number
    burst_size?: boolean | number
    burst_shot_delay?: boolean | number
    mass?: boolean | number
    homing_param?: boolean | number
    ignition_amount?: boolean | number
    is_magical?: boolean | number
    can_target_airborne?: boolean | number
    fixed_elevation?: boolean | number
    projectile_penetration?: projectile_penetrationGenqlSelection
    expiry_range?: boolean | number
    is_beam_launch_burst?: boolean | number
    expire_on_impact?: boolean | number
    can_roll?: boolean | number
    trail_always_on?: boolean | number
    shots_per_volley?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface projectile_penetrationGenqlSelection{
    key?: boolean | number
    entity_size_cap?: boolean | number
    max_penetration?: boolean | number
    description?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface missile_weaponGenqlSelection{
    key?: boolean | number
    default_projectile?: projectileGenqlSelection
    use_secondary_ammo_pool?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_shield_typeGenqlSelection{
    key?: boolean | number
    parry_chance?: boolean | number
    material?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface bullet_point_generatorGenqlSelection{
    bullet_point_enum?: boolean | number
    text_override?: boolean | number
    unit_class?: boolean | number
    unit_stat?: boolean | number
    unit_stat_threshold?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_classGenqlSelection{
    key?: boolean | number
    onscreen?: boolean | number
    sort_priority?: boolean | number
    bullet_point_generators?: bullet_point_generatorGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface armourGenqlSelection{
    key?: boolean | number
    armour_value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface land_unitGenqlSelection{
    key?: boolean | number
    accuracy?: boolean | number
    category?: boolean | number
    charge_bonus?: boolean | number
    dismounted_charge_bonus?: boolean | number
    dismounted_melee_attack?: boolean | number
    historical_description_text?: boolean | number
    melee_attack?: boolean | number
    melee_defence?: boolean | number
    ground_stat_effect_group?: ground_type_stat_effect_groupGenqlSelection
    morale?: boolean | number
    bonus_hit_points?: boolean | number
    short_description_text?: boolean | number
    visibility_spotting_range_min?: boolean | number
    visibility_spotting_range_max?: boolean | number
    attribute_group?: boolean | number
    spot_dist_tree?: boolean | number
    spot_dist_scrub?: boolean | number
    reload?: boolean | number
    hiding_scalar?: boolean | number
    secondary_ammo?: boolean | number
    primary_ammo?: boolean | number
    damage_mod_flame?: boolean | number
    damage_mod_flames?: boolean | number
    damage_mod_magic?: boolean | number
    damage_mod_physical?: boolean | number
    damage_mod_missile?: boolean | number
    damage_mod_missiles?: boolean | number
    damage_mod_all?: boolean | number
    num_engines?: boolean | number
    num_mounts?: boolean | number
    ai_usage_group?: boolean | number
    can_skirmish?: boolean | number
    onscreen_name?: boolean | number
    armour?: armourGenqlSelection
    unit_class?: unit_classGenqlSelection
    mount?: mountGenqlSelection
    primary_melee_weapon?: melee_weaponGenqlSelection
    primary_missile_weapon?: missile_weaponGenqlSelection
    shield?: unit_shield_typeGenqlSelection
    attributes?: attributeGenqlSelection
    abilities?: abilityGenqlSelection
    special_ability_groups?: special_ability_groupGenqlSelection
    battle_entity?: battle_entityGenqlSelection
    engine?: engineGenqlSelection
    officers?: land_unit_officersGenqlSelection
    variant?: unit_variantGenqlSelection
    articulated_vehicle_entity?: battle_entityGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ground_type_stat_effect_groupGenqlSelection{
    group_name?: boolean | number
    onscreen_name?: boolean | number
    stat_effects?: ground_type_to_stat_effectGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ground_type_to_stat_effectGenqlSelection{
    ground_type?: boolean | number
    affected_stat?: boolean | number
    multiplier?: boolean | number
    affected_group?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface attributeGenqlSelection{
    key?: boolean | number
    bullet_text?: boolean | number
    imbued_effect_text?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface mountGenqlSelection{
    key?: boolean | number
    battle_entity?: battle_entityGenqlSelection
    variant?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface engineGenqlSelection{
    key?: boolean | number
    engine_type?: boolean | number
    missile_weapon?: missile_weaponGenqlSelection
    battle_entity?: battle_entityGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface land_unit_officersGenqlSelection{
    officer_1?: battle_personalityGenqlSelection
    additionnal_personalities?: battle_personalityGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface battle_mountGenqlSelection{
    base_unit?: boolean | number
    mounted_unit?: boolean | number
    icon_name?: boolean | number
    mount_name?: boolean | number
    localised_description?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface battle_personalityGenqlSelection{
    key?: boolean | number
    type?: boolean | number
    missile_type?: projectileGenqlSelection
    variant?: unit_variantGenqlSelection
    battle_entity?: battle_entityGenqlSelection
    rider_attachment_point?: boolean | number
    battle_entity_stats?: battle_entity_statsGenqlSelection
    autonomous_rider_hero?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface battle_entity_statsGenqlSelection{
    primary_melee_weapon?: melee_weaponGenqlSelection
    primary_missile_weapon?: missile_weaponGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface battle_entityGenqlSelection{
    key?: boolean | number
    type?: boolean | number
    walk_speed?: boolean | number
    run_speed?: boolean | number
    acceleration?: boolean | number
    deceleration?: boolean | number
    charge_speed?: boolean | number
    crawl_speed?: boolean | number
    charge_distance_commence_run?: boolean | number
    charge_distance_adopt_charge_pose?: boolean | number
    charge_distance_pick_target?: boolean | number
    shape?: boolean | number
    radius?: boolean | number
    mass?: boolean | number
    height?: boolean | number
    fire_arc_close?: boolean | number
    turn_speed?: boolean | number
    hit_points?: boolean | number
    min_turning_speed?: boolean | number
    fly_speed?: boolean | number
    flying_charge_speed?: boolean | number
    size?: boolean | number
    strafe_speed?: boolean | number
    combat_reaction_radius?: boolean | number
    entity_effects?: boolean | number
    hit_reactions_ignore_chance?: boolean | number
    knock_interrupts_ignore_chance?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface special_ability_groupGenqlSelection{
    ability_group?: boolean | number
    icon_path?: boolean | number
    special_edition_mask?: boolean | number
    sort_order?: boolean | number
    is_naval?: boolean | number
    colour_r?: boolean | number
    colour_g?: boolean | number
    colour_b?: boolean | number
    button_name?: boolean | number
    abilities?: abilityGenqlSelection
    name?: boolean | number
    is_composite_group?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface abilityGenqlSelection{
    key?: boolean | number
    supercedes_ability?: boolean | number
    requires_effect_enabling?: boolean | number
    icon_name?: boolean | number
    uniqueness?: boolean | number
    is_unit_upgrade?: boolean | number
    is_hidden_in_ui?: boolean | number
    name?: boolean | number
    tooltip?: boolean | number
    type?: ability_typeGenqlSelection
    unit_special_ability?: special_abilityGenqlSelection
    overpower_option?: abilityGenqlSelection
    phases?: phaseGenqlSelection
    special_ability_groups?: special_ability_groupGenqlSelection
    additional_ui_effects?: additional_ui_effectGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface additional_ui_effectGenqlSelection{
    key?: boolean | number
    localised_text?: boolean | number
    sort_order?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface invalid_usage_flagGenqlSelection{
    flag_key?: boolean | number
    flag_description?: boolean | number
    alt_description?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface special_abilityGenqlSelection{
    key?: boolean | number
    active_time?: boolean | number
    recharge_time?: boolean | number
    num_uses?: boolean | number
    effect_range?: boolean | number
    affect_self?: boolean | number
    num_effected_friendly_units?: boolean | number
    num_effected_enemy_units?: boolean | number
    update_targets_every_frame?: boolean | number
    initial_recharge?: boolean | number
    target_friends?: boolean | number
    target_enemies?: boolean | number
    target_ground?: boolean | number
    target_intercept_range?: boolean | number
    assume_specific_behaviour?: boolean | number
    clear_current_order?: boolean | number
    wind_up_time?: boolean | number
    passive?: boolean | number
    unique_id?: boolean | number
    wind_up_stance?: boolean | number
    mana_cost?: boolean | number
    min_range?: boolean | number
    targetting_aoe?: boolean | number
    passive_aoe?: boolean | number
    active_aoe?: boolean | number
    activation_effect?: boolean | number
    vortex?: vortexGenqlSelection
    miscast_chance?: boolean | number
    ai_usage?: boolean | number
    special_ability_display?: boolean | number
    additional_melee_cp?: boolean | number
    additional_missile_cp?: boolean | number
    bombardment?: projectile_bombardmentsGenqlSelection
    spawned_unit?: land_unitGenqlSelection
    miscast_explosion?: explosionGenqlSelection
    parent_ability?: special_abilityGenqlSelection
    activated_projectile?: projectileGenqlSelection
    phases?: phaseGenqlSelection
    invalid_targets?: boolean | number
    invalid_usages?: boolean | number
    auto_deactivate_flags?: invalid_usage_flagGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface projectile_bombardmentsGenqlSelection{
    arrival_window?: boolean | number
    bombardment_key?: boolean | number
    num_projectiles?: boolean | number
    radius_spread?: boolean | number
    start_time?: boolean | number
    launch_source?: boolean | number
    launch_height?: boolean | number
    launch_height_underground?: boolean | number
    projectile_type?: projectileGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface vortexGenqlSelection{
    change_max_angle?: boolean | number
    contact_effect?: phaseGenqlSelection
    damage?: boolean | number
    damage_ap?: boolean | number
    duration?: boolean | number
    expansion_speed?: boolean | number
    goal_radius?: boolean | number
    infinite_height?: boolean | number
    move_change_freq?: boolean | number
    movement_speed?: boolean | number
    start_radius?: boolean | number
    vortex_key?: boolean | number
    ignition_amount?: boolean | number
    is_magical?: boolean | number
    detonation_force?: boolean | number
    launch_source?: boolean | number
    building_collision?: boolean | number
    height_off_ground?: boolean | number
    delay?: boolean | number
    num_vortexs?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface phaseGenqlSelection{
    id?: boolean | number
    onscreen_name?: boolean | number
    duration?: boolean | number
    effect_type?: boolean | number
    requested_stance?: boolean | number
    unbreakable?: boolean | number
    cant_move?: boolean | number
    freeze_fatigue?: boolean | number
    fatigue_change_ratio?: boolean | number
    inspiration_aura_change_mod?: boolean | number
    ability_recharge_change?: boolean | number
    hp_change_frequency?: boolean | number
    heal_amount?: boolean | number
    damage_chance?: boolean | number
    damage_amount?: boolean | number
    max_damaged_entities?: boolean | number
    resurrect?: boolean | number
    mana_regen_mod?: boolean | number
    mana_max_depletion_mod?: boolean | number
    imbue_magical?: boolean | number
    imbue_ignition?: boolean | number
    imbue_contact?: phaseGenqlSelection
    phase_display?: boolean | number
    stat_effects?: stat_effectGenqlSelection
    attribute_effects?: attribute_effectGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface stat_effectGenqlSelection{
    phase?: boolean | number
    stat?: boolean | number
    value?: boolean | number
    how?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface attribute_effectGenqlSelection{
    phase?: boolean | number
    attribute?: boolean | number
    attribute_type?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ability_typeGenqlSelection{
    key?: boolean | number
    icon?: boolean | number
    onscreen_name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_variantGenqlSelection{
    unit?: boolean | number
    faction?: boolean | number
    name?: boolean | number
    variant?: boolean | number
    unit_card?: boolean | number
    unit_card_url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ui_unit_groupGenqlSelection{
    icon?: boolean | number
    key?: boolean | number
    parent_group?: ui_unit_group_parentGenqlSelection
    name?: boolean | number
    tooltip?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ui_unit_group_parentGenqlSelection{
    key?: boolean | number
    onscreen_name?: boolean | number
    icon?: boolean | number
    order?: boolean | number
    mp_cap?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface battle_set_piece_armies_characterGenqlSelection{
    character_level?: boolean | number
    character_name?: boolean | number
    forename?: boolean | number
    magic_lore?: boolean | number
    num_men?: boolean | number
    surname?: boolean | number
    unit_type?: boolean | number
    agent_type?: boolean | number
    agent_subtype?: boolean | number
    portrait?: boolean | number
    character_model?: boolean | number
    skillset?: boolean | number
    male?: boolean | number
    ancillaries?: ancillaryGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ancillaryGenqlSelection{
    key?: boolean | number
    onscreen_name?: boolean | number
    applies_to?: boolean | number
    transferrable?: boolean | number
    unique_to_world?: boolean | number
    unique_to_faction?: boolean | number
    precedence?: boolean | number
    legendary_item?: boolean | number
    uniqueness_score?: boolean | number
    turns_before_swap_allowed?: boolean | number
    randomly_dropped?: boolean | number
    provided_bodyguard_unit?: boolean | number
    provided_banner?: bannerGenqlSelection
    subcategory?: boolean | number
    category?: boolean | number
    type?: boolean | number
    ancillary_effects?: ancillary_effectGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ancillary_effectGenqlSelection{
    value?: boolean | number
    effect_scope?: boolean | number
    effect?: effectGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface bannerGenqlSelection{
    banner?: boolean | number
    effect_bundle?: effect_bundleGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface effect_bundleGenqlSelection{
    key?: boolean | number
    localised_title?: boolean | number
    localised_description?: boolean | number
    ui_icon?: boolean | number
    bundle_target?: boolean | number
    priority?: boolean | number
    effect_bundle_effects?: effect_bundle_effectGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface effect_bundle_effectGenqlSelection{
    effect?: effectGenqlSelection
    value?: boolean | number
    effect_scope?: boolean | number
    advancement_stage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface agent_actionGenqlSelection{
    ability?: abilityGenqlSelection
    localised_action_name?: boolean | number
    localised_action_description?: boolean | number
    unique_id?: boolean | number
    critical_success_proportion_modifier?: boolean | number
    opportune_failure_proportion_modifier?: boolean | number
    critical_failure_proportion_modifier?: boolean | number
    chance_of_success?: boolean | number
    icon_path?: boolean | number
    show_action_info_in_ui?: boolean | number
    subculture?: subcultureGenqlSelection
    succeed_always_override?: boolean | number
    order?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface effectGenqlSelection{
    effect?: boolean | number
    icon?: boolean | number
    priority?: boolean | number
    description?: boolean | number
    icon_negative?: boolean | number
    category?: boolean | number
    is_positive_value_good?: boolean | number
    agent_actions?: effect_bonusGenqlSelection
    phases?: effect_bonusGenqlSelection
    attributes?: effect_bonusGenqlSelection
    abilities?: effect_bonusGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface effect_bonus_valueGenqlSelection{
    on_agent_action?:agent_actionGenqlSelection,
    on_phase?:phaseGenqlSelection,
    on_ability?:abilityGenqlSelection,
    on_attribute_effect?:attribute_effectGenqlSelection,
    __typename?: boolean | number
}

export interface effect_bonusGenqlSelection{
    bonus_value_id?: boolean | number
    value?: effect_bonus_valueGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface main_unitGenqlSelection{
    unit?: boolean | number
    land_unit?: land_unitGenqlSelection
    num_men?: boolean | number
    multiplayer_cost?: boolean | number
    weight?: boolean | number
    recruitment_cost?: boolean | number
    upkeep_cost?: boolean | number
    create_time?: boolean | number
    campaign_cap?: boolean | number
    multiplayer_cap?: boolean | number
    caste?: boolean | number
    unique_index?: boolean | number
    ui_unit_group?: ui_unit_groupGenqlSelection
    tier?: boolean | number
    is_high_threat?: boolean | number
    campaign_mount?: campaign_mountGenqlSelection
    mount_name?: boolean | number
    battle_mounts?: battle_mountGenqlSelection
    melee_cp?: boolean | number
    missile_cp?: boolean | number
    is_monstrous?: boolean | number
    campaign_factions?: (factionGenqlSelection & { __args?: {include_non_mp?: (Scalars['StringBoolean'] | null)} })
    factions?: (factionGenqlSelection & { __args?: {include_non_mp?: (Scalars['StringBoolean'] | null)} })
    custom_battle_permissions?: unit_custom_battle_permissionGenqlSelection
    bullet_points?: bullet_pointGenqlSelection
    is_naval?: boolean | number
    unit_sets?: unit_setGenqlSelection
    agent_subtype?: agent_subtypeGenqlSelection
    can_siege?: boolean | number
    barrier_health?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_setGenqlSelection{
    key?: boolean | number
    use_unit_exp_level_range?: boolean | number
    min_unit_exp_level_inclusive?: boolean | number
    max_unit_exp_level_inclusive?: boolean | number
    special_category?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_custom_battle_permissionGenqlSelection{
    faction?: boolean | number
    general_unit?: boolean | number
    unit?: boolean | number
    siege_unit_attacker?: boolean | number
    siege_unit_defender?: boolean | number
    general_portrait?: boolean | number
    general_uniform?: boolean | number
    set_piece_character?: battle_set_piece_armies_characterGenqlSelection
    campaign_exclusive?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface campaign_mountGenqlSelection{
    model?: boolean | number
    variant?: boolean | number
    scale?: boolean | number
    actor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface bullet_pointGenqlSelection{
    key?: boolean | number
    state?: boolean | number
    sort_order?: boolean | number
    onscreen_name?: boolean | number
    tooltip?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_fatigue_effectGenqlSelection{
    key?: boolean | number
    fatigue_threshold?: boolean | number
    fatigue_level?: boolean | number
    scalar_speed?: boolean | number
    stat_melee_attack?: boolean | number
    stat_reloading?: boolean | number
    stat_armour?: boolean | number
    stat_charge_bonus?: boolean | number
    stat_melee_damage_ap?: boolean | number
    stat_melee_defense?: boolean | number
    stat_melee_defence?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_experience_bonusGenqlSelection{
    stat?: boolean | number
    value?: boolean | number
    growth_rate?: boolean | number
    growth_scalar?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface military_groupGenqlSelection{
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface factionGenqlSelection{
    key?: boolean | number
    subculture?: subcultureGenqlSelection
    screen_name?: boolean | number
    screen_adjective?: boolean | number
    is_rebel?: boolean | number
    mp_available?: boolean | number
    flags_path?: boolean | number
    flags_url?: boolean | number
    name_group?: boolean | number
    primary_colour_hex?: boolean | number
    secondary_colour_hex?: boolean | number
    military_group?: boolean | number
    can_be_horde?: boolean | number
    faction_swapping_id?: boolean | number
    is_waaagh_faction?: boolean | number
    is_quest_faction?: boolean | number
    units?: (main_unitGenqlSelection & { __args?: {groupHeroesAndLords?: (Scalars['StringBoolean'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface subcultureGenqlSelection{
    subculture?: boolean | number
    name?: boolean | number
    culture?: cultureGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface cultureGenqlSelection{
    key?: boolean | number
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_statGenqlSelection{
    key?: boolean | number
    max_value?: boolean | number
    campaign_only?: boolean | number
    sort_order?: boolean | number
    localisation?: boolean | number
    icon?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface campaign_difficulty_handicap_effectGenqlSelection{
    key?: boolean | number
    campaign_difficulty_handicap?: boolean | number
    human?: boolean | number
    effect?: effectGenqlSelection
    effect_scope?: boolean | number
    effect_value?: boolean | number
    optional_campaign_key?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface character_trait_levelGenqlSelection{
    key?: boolean | number
    onscreen_name?: boolean | number
    character_trait?: character_traitGenqlSelection
    level?: boolean | number
    threshold_points?: boolean | number
    colour_text?: boolean | number
    explanation_text?: boolean | number
    removal_text?: boolean | number
    trait_level_effects?: trait_level_effectGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface trait_level_effectGenqlSelection{
    effect?: effectGenqlSelection
    value?: boolean | number
    effect_scope?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface character_traitGenqlSelection{
    key?: boolean | number
    no_going_back_level?: boolean | number
    hidden?: boolean | number
    precedence?: boolean | number
    category?: trait_categoryGenqlSelection
    author?: boolean | number
    comment?: boolean | number
    ui_priority?: boolean | number
    antitrait?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface trait_categoryGenqlSelection{
    category?: boolean | number
    icon_path?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface agent_subtypeGenqlSelection{
    key?: boolean | number
    auto_generate?: boolean | number
    is_caster?: boolean | number
    small_icon?: boolean | number
    associated_unit_override?: boolean | number
    audio_voiceover_actor_group?: boolean | number
    show_in_ui?: boolean | number
    cap?: boolean | number
    has_female_name?: boolean | number
    can_gain_xp?: boolean | number
    loyality_is_applicable?: boolean | number
    contributes_to_agent_cap?: boolean | number
    onscreen_name_override?: boolean | number
    description_text_override?: boolean | number
    character_skill_node_set?: character_skill_node_setGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface character_skill_node_setGenqlSelection{
    agent_key?: boolean | number
    campaign_key?: boolean | number
    faction_key?: boolean | number
    key?: boolean | number
    subculture?: boolean | number
    for_army?: boolean | number
    for_navy?: boolean | number
    agent_subtype_key?: boolean | number
    enc_title?: boolean | number
    character_skill_nodes?: character_skill_nodeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface character_skill_nodeGenqlSelection{
    campaign_key?: boolean | number
    character_skill_key?: boolean | number
    character_skill_node_set_key?: boolean | number
    faction_key?: boolean | number
    indent?: boolean | number
    key?: boolean | number
    tier?: boolean | number
    subculture?: boolean | number
    points_on_creation?: boolean | number
    required_num_parents?: boolean | number
    visible_in_ui?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface character_skillGenqlSelection{
    image_path?: boolean | number
    key?: boolean | number
    localised_description?: boolean | number
    localised_name?: boolean | number
    unlocked_at_rank?: boolean | number
    is_background_skill?: boolean | number
    is_female_only_background_skill?: boolean | number
    is_male_only_background_skill?: boolean | number
    background_weighting?: boolean | number
    influence_cost?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface character_skill_categoryGenqlSelection{
    key?: boolean | number
    max_incident?: boolean | number
    min_incident?: boolean | number
    order?: boolean | number
    col_r?: boolean | number
    col_g?: boolean | number
    col_b?: boolean | number
    agent_subtype_override?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface character_skill_level_detailGenqlSelection{
    campaign_key?: boolean | number
    faction_key?: boolean | number
    image_path?: boolean | number
    level?: boolean | number
    skill_key?: boolean | number
    subculture_key?: boolean | number
    unlocked_at_rank?: boolean | number
    localised_name?: boolean | number
    localised_description?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_stat_localisationGenqlSelection{
    stat_key?: boolean | number
    onscreen_name?: boolean | number
    tooltip_text?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ui_text_replacementGenqlSelection{
    key?: boolean | number
    localised_text?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface unit_stat_to_size_scaling_valueGenqlSelection{
    stat?: boolean | number
    size?: boolean | number
    single_entity_value?: boolean | number
    multi_entity_value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const gameVersion_possibleTypes: string[] = ['gameVersion']
    export const isgameVersion = (obj?: { __typename?: any } | null): obj is gameVersion => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isgameVersion"')
      return gameVersion_possibleTypes.includes(obj.__typename)
    }
    


    const tww_possibleTypes: string[] = ['tww']
    export const istww = (obj?: { __typename?: any } | null): obj is tww => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istww"')
      return tww_possibleTypes.includes(obj.__typename)
    }
    


    const ui_tagged_image_possibleTypes: string[] = ['ui_tagged_image']
    export const isui_tagged_image = (obj?: { __typename?: any } | null): obj is ui_tagged_image => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isui_tagged_image"')
      return ui_tagged_image_possibleTypes.includes(obj.__typename)
    }
    


    const unit_stats_land_experience_bonuse_possibleTypes: string[] = ['unit_stats_land_experience_bonuse']
    export const isunit_stats_land_experience_bonuse = (obj?: { __typename?: any } | null): obj is unit_stats_land_experience_bonuse => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_stats_land_experience_bonuse"')
      return unit_stats_land_experience_bonuse_possibleTypes.includes(obj.__typename)
    }
    


    const kvp_possibleTypes: string[] = ['kvp']
    export const iskvp = (obj?: { __typename?: any } | null): obj is kvp => {
      if (!obj?.__typename) throw new Error('__typename is missing in "iskvp"')
      return kvp_possibleTypes.includes(obj.__typename)
    }
    


    const rule_possibleTypes: string[] = ['rule']
    export const isrule = (obj?: { __typename?: any } | null): obj is rule => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isrule"')
      return rule_possibleTypes.includes(obj.__typename)
    }
    


    const melee_weapon_possibleTypes: string[] = ['melee_weapon']
    export const ismelee_weapon = (obj?: { __typename?: any } | null): obj is melee_weapon => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ismelee_weapon"')
      return melee_weapon_possibleTypes.includes(obj.__typename)
    }
    


    const explosion_possibleTypes: string[] = ['explosion']
    export const isexplosion = (obj?: { __typename?: any } | null): obj is explosion => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isexplosion"')
      return explosion_possibleTypes.includes(obj.__typename)
    }
    


    const projectile_possibleTypes: string[] = ['projectile']
    export const isprojectile = (obj?: { __typename?: any } | null): obj is projectile => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isprojectile"')
      return projectile_possibleTypes.includes(obj.__typename)
    }
    


    const projectile_penetration_possibleTypes: string[] = ['projectile_penetration']
    export const isprojectile_penetration = (obj?: { __typename?: any } | null): obj is projectile_penetration => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isprojectile_penetration"')
      return projectile_penetration_possibleTypes.includes(obj.__typename)
    }
    


    const missile_weapon_possibleTypes: string[] = ['missile_weapon']
    export const ismissile_weapon = (obj?: { __typename?: any } | null): obj is missile_weapon => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ismissile_weapon"')
      return missile_weapon_possibleTypes.includes(obj.__typename)
    }
    


    const unit_shield_type_possibleTypes: string[] = ['unit_shield_type']
    export const isunit_shield_type = (obj?: { __typename?: any } | null): obj is unit_shield_type => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_shield_type"')
      return unit_shield_type_possibleTypes.includes(obj.__typename)
    }
    


    const bullet_point_generator_possibleTypes: string[] = ['bullet_point_generator']
    export const isbullet_point_generator = (obj?: { __typename?: any } | null): obj is bullet_point_generator => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isbullet_point_generator"')
      return bullet_point_generator_possibleTypes.includes(obj.__typename)
    }
    


    const unit_class_possibleTypes: string[] = ['unit_class']
    export const isunit_class = (obj?: { __typename?: any } | null): obj is unit_class => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_class"')
      return unit_class_possibleTypes.includes(obj.__typename)
    }
    


    const armour_possibleTypes: string[] = ['armour']
    export const isarmour = (obj?: { __typename?: any } | null): obj is armour => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isarmour"')
      return armour_possibleTypes.includes(obj.__typename)
    }
    


    const land_unit_possibleTypes: string[] = ['land_unit']
    export const island_unit = (obj?: { __typename?: any } | null): obj is land_unit => {
      if (!obj?.__typename) throw new Error('__typename is missing in "island_unit"')
      return land_unit_possibleTypes.includes(obj.__typename)
    }
    


    const ground_type_stat_effect_group_possibleTypes: string[] = ['ground_type_stat_effect_group']
    export const isground_type_stat_effect_group = (obj?: { __typename?: any } | null): obj is ground_type_stat_effect_group => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isground_type_stat_effect_group"')
      return ground_type_stat_effect_group_possibleTypes.includes(obj.__typename)
    }
    


    const ground_type_to_stat_effect_possibleTypes: string[] = ['ground_type_to_stat_effect']
    export const isground_type_to_stat_effect = (obj?: { __typename?: any } | null): obj is ground_type_to_stat_effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isground_type_to_stat_effect"')
      return ground_type_to_stat_effect_possibleTypes.includes(obj.__typename)
    }
    


    const attribute_possibleTypes: string[] = ['attribute']
    export const isattribute = (obj?: { __typename?: any } | null): obj is attribute => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isattribute"')
      return attribute_possibleTypes.includes(obj.__typename)
    }
    


    const mount_possibleTypes: string[] = ['mount']
    export const ismount = (obj?: { __typename?: any } | null): obj is mount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ismount"')
      return mount_possibleTypes.includes(obj.__typename)
    }
    


    const engine_possibleTypes: string[] = ['engine']
    export const isengine = (obj?: { __typename?: any } | null): obj is engine => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isengine"')
      return engine_possibleTypes.includes(obj.__typename)
    }
    


    const land_unit_officers_possibleTypes: string[] = ['land_unit_officers']
    export const island_unit_officers = (obj?: { __typename?: any } | null): obj is land_unit_officers => {
      if (!obj?.__typename) throw new Error('__typename is missing in "island_unit_officers"')
      return land_unit_officers_possibleTypes.includes(obj.__typename)
    }
    


    const battle_mount_possibleTypes: string[] = ['battle_mount']
    export const isbattle_mount = (obj?: { __typename?: any } | null): obj is battle_mount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isbattle_mount"')
      return battle_mount_possibleTypes.includes(obj.__typename)
    }
    


    const battle_personality_possibleTypes: string[] = ['battle_personality']
    export const isbattle_personality = (obj?: { __typename?: any } | null): obj is battle_personality => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isbattle_personality"')
      return battle_personality_possibleTypes.includes(obj.__typename)
    }
    


    const battle_entity_stats_possibleTypes: string[] = ['battle_entity_stats']
    export const isbattle_entity_stats = (obj?: { __typename?: any } | null): obj is battle_entity_stats => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isbattle_entity_stats"')
      return battle_entity_stats_possibleTypes.includes(obj.__typename)
    }
    


    const battle_entity_possibleTypes: string[] = ['battle_entity']
    export const isbattle_entity = (obj?: { __typename?: any } | null): obj is battle_entity => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isbattle_entity"')
      return battle_entity_possibleTypes.includes(obj.__typename)
    }
    


    const special_ability_group_possibleTypes: string[] = ['special_ability_group']
    export const isspecial_ability_group = (obj?: { __typename?: any } | null): obj is special_ability_group => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isspecial_ability_group"')
      return special_ability_group_possibleTypes.includes(obj.__typename)
    }
    


    const ability_possibleTypes: string[] = ['ability']
    export const isability = (obj?: { __typename?: any } | null): obj is ability => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isability"')
      return ability_possibleTypes.includes(obj.__typename)
    }
    


    const additional_ui_effect_possibleTypes: string[] = ['additional_ui_effect']
    export const isadditional_ui_effect = (obj?: { __typename?: any } | null): obj is additional_ui_effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isadditional_ui_effect"')
      return additional_ui_effect_possibleTypes.includes(obj.__typename)
    }
    


    const invalid_usage_flag_possibleTypes: string[] = ['invalid_usage_flag']
    export const isinvalid_usage_flag = (obj?: { __typename?: any } | null): obj is invalid_usage_flag => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isinvalid_usage_flag"')
      return invalid_usage_flag_possibleTypes.includes(obj.__typename)
    }
    


    const special_ability_possibleTypes: string[] = ['special_ability']
    export const isspecial_ability = (obj?: { __typename?: any } | null): obj is special_ability => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isspecial_ability"')
      return special_ability_possibleTypes.includes(obj.__typename)
    }
    


    const projectile_bombardments_possibleTypes: string[] = ['projectile_bombardments']
    export const isprojectile_bombardments = (obj?: { __typename?: any } | null): obj is projectile_bombardments => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isprojectile_bombardments"')
      return projectile_bombardments_possibleTypes.includes(obj.__typename)
    }
    


    const vortex_possibleTypes: string[] = ['vortex']
    export const isvortex = (obj?: { __typename?: any } | null): obj is vortex => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isvortex"')
      return vortex_possibleTypes.includes(obj.__typename)
    }
    


    const phase_possibleTypes: string[] = ['phase']
    export const isphase = (obj?: { __typename?: any } | null): obj is phase => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isphase"')
      return phase_possibleTypes.includes(obj.__typename)
    }
    


    const stat_effect_possibleTypes: string[] = ['stat_effect']
    export const isstat_effect = (obj?: { __typename?: any } | null): obj is stat_effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isstat_effect"')
      return stat_effect_possibleTypes.includes(obj.__typename)
    }
    


    const attribute_effect_possibleTypes: string[] = ['attribute_effect']
    export const isattribute_effect = (obj?: { __typename?: any } | null): obj is attribute_effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isattribute_effect"')
      return attribute_effect_possibleTypes.includes(obj.__typename)
    }
    


    const ability_type_possibleTypes: string[] = ['ability_type']
    export const isability_type = (obj?: { __typename?: any } | null): obj is ability_type => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isability_type"')
      return ability_type_possibleTypes.includes(obj.__typename)
    }
    


    const unit_variant_possibleTypes: string[] = ['unit_variant']
    export const isunit_variant = (obj?: { __typename?: any } | null): obj is unit_variant => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_variant"')
      return unit_variant_possibleTypes.includes(obj.__typename)
    }
    


    const ui_unit_group_possibleTypes: string[] = ['ui_unit_group']
    export const isui_unit_group = (obj?: { __typename?: any } | null): obj is ui_unit_group => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isui_unit_group"')
      return ui_unit_group_possibleTypes.includes(obj.__typename)
    }
    


    const ui_unit_group_parent_possibleTypes: string[] = ['ui_unit_group_parent']
    export const isui_unit_group_parent = (obj?: { __typename?: any } | null): obj is ui_unit_group_parent => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isui_unit_group_parent"')
      return ui_unit_group_parent_possibleTypes.includes(obj.__typename)
    }
    


    const battle_set_piece_armies_character_possibleTypes: string[] = ['battle_set_piece_armies_character']
    export const isbattle_set_piece_armies_character = (obj?: { __typename?: any } | null): obj is battle_set_piece_armies_character => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isbattle_set_piece_armies_character"')
      return battle_set_piece_armies_character_possibleTypes.includes(obj.__typename)
    }
    


    const ancillary_possibleTypes: string[] = ['ancillary']
    export const isancillary = (obj?: { __typename?: any } | null): obj is ancillary => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isancillary"')
      return ancillary_possibleTypes.includes(obj.__typename)
    }
    


    const ancillary_effect_possibleTypes: string[] = ['ancillary_effect']
    export const isancillary_effect = (obj?: { __typename?: any } | null): obj is ancillary_effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isancillary_effect"')
      return ancillary_effect_possibleTypes.includes(obj.__typename)
    }
    


    const banner_possibleTypes: string[] = ['banner']
    export const isbanner = (obj?: { __typename?: any } | null): obj is banner => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isbanner"')
      return banner_possibleTypes.includes(obj.__typename)
    }
    


    const effect_bundle_possibleTypes: string[] = ['effect_bundle']
    export const iseffect_bundle = (obj?: { __typename?: any } | null): obj is effect_bundle => {
      if (!obj?.__typename) throw new Error('__typename is missing in "iseffect_bundle"')
      return effect_bundle_possibleTypes.includes(obj.__typename)
    }
    


    const effect_bundle_effect_possibleTypes: string[] = ['effect_bundle_effect']
    export const iseffect_bundle_effect = (obj?: { __typename?: any } | null): obj is effect_bundle_effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "iseffect_bundle_effect"')
      return effect_bundle_effect_possibleTypes.includes(obj.__typename)
    }
    


    const agent_action_possibleTypes: string[] = ['agent_action']
    export const isagent_action = (obj?: { __typename?: any } | null): obj is agent_action => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isagent_action"')
      return agent_action_possibleTypes.includes(obj.__typename)
    }
    


    const effect_possibleTypes: string[] = ['effect']
    export const iseffect = (obj?: { __typename?: any } | null): obj is effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "iseffect"')
      return effect_possibleTypes.includes(obj.__typename)
    }
    


    const effect_bonus_value_possibleTypes: string[] = ['agent_action','phase','ability','attribute_effect']
    export const iseffect_bonus_value = (obj?: { __typename?: any } | null): obj is effect_bonus_value => {
      if (!obj?.__typename) throw new Error('__typename is missing in "iseffect_bonus_value"')
      return effect_bonus_value_possibleTypes.includes(obj.__typename)
    }
    


    const effect_bonus_possibleTypes: string[] = ['effect_bonus']
    export const iseffect_bonus = (obj?: { __typename?: any } | null): obj is effect_bonus => {
      if (!obj?.__typename) throw new Error('__typename is missing in "iseffect_bonus"')
      return effect_bonus_possibleTypes.includes(obj.__typename)
    }
    


    const main_unit_possibleTypes: string[] = ['main_unit']
    export const ismain_unit = (obj?: { __typename?: any } | null): obj is main_unit => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ismain_unit"')
      return main_unit_possibleTypes.includes(obj.__typename)
    }
    


    const unit_set_possibleTypes: string[] = ['unit_set']
    export const isunit_set = (obj?: { __typename?: any } | null): obj is unit_set => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_set"')
      return unit_set_possibleTypes.includes(obj.__typename)
    }
    


    const unit_custom_battle_permission_possibleTypes: string[] = ['unit_custom_battle_permission']
    export const isunit_custom_battle_permission = (obj?: { __typename?: any } | null): obj is unit_custom_battle_permission => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_custom_battle_permission"')
      return unit_custom_battle_permission_possibleTypes.includes(obj.__typename)
    }
    


    const campaign_mount_possibleTypes: string[] = ['campaign_mount']
    export const iscampaign_mount = (obj?: { __typename?: any } | null): obj is campaign_mount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "iscampaign_mount"')
      return campaign_mount_possibleTypes.includes(obj.__typename)
    }
    


    const bullet_point_possibleTypes: string[] = ['bullet_point']
    export const isbullet_point = (obj?: { __typename?: any } | null): obj is bullet_point => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isbullet_point"')
      return bullet_point_possibleTypes.includes(obj.__typename)
    }
    


    const unit_fatigue_effect_possibleTypes: string[] = ['unit_fatigue_effect']
    export const isunit_fatigue_effect = (obj?: { __typename?: any } | null): obj is unit_fatigue_effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_fatigue_effect"')
      return unit_fatigue_effect_possibleTypes.includes(obj.__typename)
    }
    


    const unit_experience_bonus_possibleTypes: string[] = ['unit_experience_bonus']
    export const isunit_experience_bonus = (obj?: { __typename?: any } | null): obj is unit_experience_bonus => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_experience_bonus"')
      return unit_experience_bonus_possibleTypes.includes(obj.__typename)
    }
    


    const military_group_possibleTypes: string[] = ['military_group']
    export const ismilitary_group = (obj?: { __typename?: any } | null): obj is military_group => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ismilitary_group"')
      return military_group_possibleTypes.includes(obj.__typename)
    }
    


    const faction_possibleTypes: string[] = ['faction']
    export const isfaction = (obj?: { __typename?: any } | null): obj is faction => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isfaction"')
      return faction_possibleTypes.includes(obj.__typename)
    }
    


    const subculture_possibleTypes: string[] = ['subculture']
    export const issubculture = (obj?: { __typename?: any } | null): obj is subculture => {
      if (!obj?.__typename) throw new Error('__typename is missing in "issubculture"')
      return subculture_possibleTypes.includes(obj.__typename)
    }
    


    const culture_possibleTypes: string[] = ['culture']
    export const isculture = (obj?: { __typename?: any } | null): obj is culture => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isculture"')
      return culture_possibleTypes.includes(obj.__typename)
    }
    


    const unit_stat_possibleTypes: string[] = ['unit_stat']
    export const isunit_stat = (obj?: { __typename?: any } | null): obj is unit_stat => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_stat"')
      return unit_stat_possibleTypes.includes(obj.__typename)
    }
    


    const campaign_difficulty_handicap_effect_possibleTypes: string[] = ['campaign_difficulty_handicap_effect']
    export const iscampaign_difficulty_handicap_effect = (obj?: { __typename?: any } | null): obj is campaign_difficulty_handicap_effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "iscampaign_difficulty_handicap_effect"')
      return campaign_difficulty_handicap_effect_possibleTypes.includes(obj.__typename)
    }
    


    const character_trait_level_possibleTypes: string[] = ['character_trait_level']
    export const ischaracter_trait_level = (obj?: { __typename?: any } | null): obj is character_trait_level => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ischaracter_trait_level"')
      return character_trait_level_possibleTypes.includes(obj.__typename)
    }
    


    const trait_level_effect_possibleTypes: string[] = ['trait_level_effect']
    export const istrait_level_effect = (obj?: { __typename?: any } | null): obj is trait_level_effect => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrait_level_effect"')
      return trait_level_effect_possibleTypes.includes(obj.__typename)
    }
    


    const character_trait_possibleTypes: string[] = ['character_trait']
    export const ischaracter_trait = (obj?: { __typename?: any } | null): obj is character_trait => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ischaracter_trait"')
      return character_trait_possibleTypes.includes(obj.__typename)
    }
    


    const trait_category_possibleTypes: string[] = ['trait_category']
    export const istrait_category = (obj?: { __typename?: any } | null): obj is trait_category => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrait_category"')
      return trait_category_possibleTypes.includes(obj.__typename)
    }
    


    const agent_subtype_possibleTypes: string[] = ['agent_subtype']
    export const isagent_subtype = (obj?: { __typename?: any } | null): obj is agent_subtype => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isagent_subtype"')
      return agent_subtype_possibleTypes.includes(obj.__typename)
    }
    


    const character_skill_node_set_possibleTypes: string[] = ['character_skill_node_set']
    export const ischaracter_skill_node_set = (obj?: { __typename?: any } | null): obj is character_skill_node_set => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ischaracter_skill_node_set"')
      return character_skill_node_set_possibleTypes.includes(obj.__typename)
    }
    


    const character_skill_node_possibleTypes: string[] = ['character_skill_node']
    export const ischaracter_skill_node = (obj?: { __typename?: any } | null): obj is character_skill_node => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ischaracter_skill_node"')
      return character_skill_node_possibleTypes.includes(obj.__typename)
    }
    


    const character_skill_possibleTypes: string[] = ['character_skill']
    export const ischaracter_skill = (obj?: { __typename?: any } | null): obj is character_skill => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ischaracter_skill"')
      return character_skill_possibleTypes.includes(obj.__typename)
    }
    


    const character_skill_category_possibleTypes: string[] = ['character_skill_category']
    export const ischaracter_skill_category = (obj?: { __typename?: any } | null): obj is character_skill_category => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ischaracter_skill_category"')
      return character_skill_category_possibleTypes.includes(obj.__typename)
    }
    


    const character_skill_level_detail_possibleTypes: string[] = ['character_skill_level_detail']
    export const ischaracter_skill_level_detail = (obj?: { __typename?: any } | null): obj is character_skill_level_detail => {
      if (!obj?.__typename) throw new Error('__typename is missing in "ischaracter_skill_level_detail"')
      return character_skill_level_detail_possibleTypes.includes(obj.__typename)
    }
    


    const unit_stat_localisation_possibleTypes: string[] = ['unit_stat_localisation']
    export const isunit_stat_localisation = (obj?: { __typename?: any } | null): obj is unit_stat_localisation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_stat_localisation"')
      return unit_stat_localisation_possibleTypes.includes(obj.__typename)
    }
    


    const ui_text_replacement_possibleTypes: string[] = ['ui_text_replacement']
    export const isui_text_replacement = (obj?: { __typename?: any } | null): obj is ui_text_replacement => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isui_text_replacement"')
      return ui_text_replacement_possibleTypes.includes(obj.__typename)
    }
    


    const unit_stat_to_size_scaling_value_possibleTypes: string[] = ['unit_stat_to_size_scaling_value']
    export const isunit_stat_to_size_scaling_value = (obj?: { __typename?: any } | null): obj is unit_stat_to_size_scaling_value => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isunit_stat_to_size_scaling_value"')
      return unit_stat_to_size_scaling_value_possibleTypes.includes(obj.__typename)
    }
    

export const enumCacheControlScope = {
   PUBLIC: 'PUBLIC' as const,
   PRIVATE: 'PRIVATE' as const
}
