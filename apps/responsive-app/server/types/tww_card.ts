type caste_type = "Lord" | "Hero" | "Melee Infantry" | "Missile Infantry" | "War Beast" | "Monstrous Infantry" | "Monster" | "War Machine" | "Melee Cavalry" | "Missile Cavalry" | "Chariot" |  "Generic" | "Monstrous Cavalry"

type category_type = "Assassin" | "Axe Infantry" | "Berserker Axe Infantry" | "Bestial Cavalry" | "Bestial Cavalry Great Weapons" | "Bestial Missile Cavalry " | "Catapult" | "Cavalry" | "Chariot" | "Close-Quarters Infantry" | "Close-Quarters Missile Infantry" | "Cold One Cavalry" | "Cold One Spear Cavalry" | "Creature Infantry" | "Cudgel Infantry" | "Dragon Ogre Shaggoth" | "Dual Dagger Infantry" | "Dual Sword Infantry" | "Exploding Monster" | "Explosives Infantry" | "Field Artillery" | "Field Gun" | "Flail Infantry" | "Flamethrower Infantry" | "Flying Cavalry" | "Flying Melee Infantry" | "Flying Missile Cavalry" | "Flying Monster" | "Flying Monstrous Cavalry" | "Flying Monstrous Infantry" | "Flying Pistol Cavalry" | "Flying War Beasts" | "Flying War Machine" | "Glaive Infantry" | "Great Axe Infantry" | "Greatsword Infantry" | "Guandao Infantry" | "Halberd Infantry" | "Hammer Infantry" | "Handbow Infantry" | "Hunting Packs" | "Hybrid Weapon Specialist" | "Hybrid-Weapon Cavalry" | "Hybrid-Weapon Infantry" | "Javelin Infantry" | "Mace Infantry" | "Magic Chariot" | "Magical Artillery" | "Magical Cavalry" | "Melee Infantry" | "Melee Specialist" | "Missile & Spear Infantry" | "Missile Cavalry" | "Missile Chariot" | "Missile Infantry" | "Missile Monster" | "Missile Specialist" | "Mistwalker Hybrid Infantry" | "Mistwalker Monstrous Cavalry" | "Mistwalker Sword Infantry" | "Monster" | "Monstrous Beasts" | "Monstrous Cavalry" | "Monstrous Chariot" | "Monstrous Infantry" | "Monstrous Missile Beasts" | "Monstrous Missile Infantry" | "Monstrous Shock Cavalry" | "Pickaxe Infantry" | "Pistol Missile Infantry" | "Rocket Battery" | "Scythe Infantry" | "Shock Cavalry" | "Siege Artillery" | "Skin Wolf Werekin" | "Sneaky Infantry" | "Spear & Whip Infantry" | "Spear Cavalry" | "Spear Infantry" | "Specialist Artillery" | "Specialist Missile Infantry" | "Support Infantry" | "Support Monster" | "Support Specialist" | "Sword Infantry" | "Torpedo Missile Infantry" | "Triple Sword Infantry" | "War Beasts" | "War Machine" | "Weapon Team" | "Whip Infantry" | "Wizard"
type category_icon = string
type weight_type = string
type entity_size_type = string
type splash_attack_target_size_type = entity_size_type
type ground_type = string


export interface TWW_card_I {
    abilities?: Ability_I[],
    acceleration: number,
    accuracy: number,
    armour: number,
    attributes?: Attribute_I[],
    blessed: boolean,
    bullet_points: Array<any>,
    can_siege: boolean,
    can_skirmish: boolean,
    tww_version: number,
    rank: number,
    fatigue: number,
    key: string,
    special_category: string,
    ror: boolean,
    elector: boolean,
    crafted: boolean,
    tech: boolean,
    factions: Factions_I[],
    caste: caste_type,
    category: category_type,
    category_icon: category_icon,
    category_tooltip: string,
    multiplayer_cost: number,
    fatigue_modifier: number,
    singleplayer_cost: number,
    singleplayer_upkeep: number,
    weight: weight_type,
    create_time: number,
    is_high_threat: boolean,
    name: string,
    unit_size: number,
    health: number,
    mass: number,
    health_per_entity: number,
    walk_speed: number,
    run_speed: number,
    fly_speed: number,
    speed: number,
    turn_speed: number,
    charge_speed: number,
    flying_charge_speed: number,
    deceleration: number,
    height: number,
    combat_reaction_radius: number,
    hit_reactions_ignore_chance: number,
    knock_interrupts_ignore_chance: number,
    entity_size: entity_size_type,
    reload: number,
    ground_stat_effect_group: ground_stat_effect_groupground_stat_effect_group_I,
    parry_chance: number,
    leadership: number,
    is_large: boolean,
    melee_attack: number,
    melee_defence: number,
    charge_bonus: number,
    damage_mod_flame: number,
    damage_mod_magic: number,
    damage_mod_physical: number,
    damage_mod_missile: number,
    damage_mod_all: number,
    spells: [],
    unit_card: string,
    primary_melee_weapon: {
        tww_version: string,
        ignition_amount: boolean,
        is_magical: boolean,
        base_damage: number,
        ap_damage: number,
        ap_ratio: number,
        bonus_v_large: number,
        bonus_v_infantry: number,
        splash_attack_target_size: splash_attack_target_size_type,
        splash_attack_max_attacks: number,
        splash_attack_power_multiplier: number,
        weapon_length: number,
        collision_attack_max_targets: number,
        collision_attack_max_targets_cooldown: number,
        melee_attack_interval: number,
        damage: number,
        phase: null
    },
    primary_missile_weapon: number,
    secondary_missile_weapon: number

} 

export interface ground_stat_effect_groupground_stat_effect_group_I {
    group_name: entity_size_type,
    onscreen_name: string,
    stat_effects: {            
        ground_type: ground_type,
        affected_group: entity_size_type,
        affected_stat: string,
        multiplier: number,
        __typename: "ground_type_to_stat_effect"
    }[],
    __typename: "ground_type_stat_effect_group"
}


export interface Ability_I {
        icon_name: string,
        key: string,
        name: string,
        tooltip: string,
        __typename: "ability"
}

export interface Attribute_I {
    tww_version: string,
    key: string,
    bullet_text: string,
    imbued_effect_text: string
}

export interface Factions_I {

        key: string
        screen_name: string
        flags_url: string
        name_group: number,
        __typename: "faction"

}