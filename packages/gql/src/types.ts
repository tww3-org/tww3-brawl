export default {
    "scalars": [
        0,
        1,
        2,
        6,
        7,
        10,
        83,
        84
    ],
    "types": {
        "String": {},
        "Boolean": {},
        "StringBoolean": {},
        "Query": {
            "ping": [
                0
            ],
            "versions": [
                4
            ],
            "tww": [
                5,
                {
                    "tww_version": [
                        0,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                0
            ]
        },
        "gameVersion": {
            "game": [
                0
            ],
            "id": [
                0
            ],
            "name": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "tww": {
            "rules": [
                12
            ],
            "tww_version": [
                6
            ],
            "game_version": [
                4
            ],
            "units": [
                57,
                {
                    "offset": [
                        7,
                        "Int!"
                    ],
                    "size": [
                        7,
                        "Int!"
                    ],
                    "includeQb": [
                        1
                    ],
                    "includeSummoned": [
                        1
                    ],
                    "includeBosses": [
                        1
                    ],
                    "includeSouthenRealms": [
                        1
                    ],
                    "includeKislev": [
                        1
                    ],
                    "query": [
                        0
                    ]
                }
            ],
            "unit": [
                57,
                {
                    "id": [
                        0
                    ]
                }
            ],
            "factions": [
                65,
                {
                    "include_non_mp": [
                        2
                    ]
                }
            ],
            "faction": [
                65,
                {
                    "id": [
                        0
                    ]
                }
            ],
            "unit_stats": [
                68
            ],
            "abilities": [
                34,
                {
                    "offset": [
                        7,
                        "Int!"
                    ],
                    "size": [
                        7,
                        "Int!"
                    ],
                    "special_ability_group": [
                        0
                    ],
                    "query": [
                        0
                    ],
                    "noGroupsOnly": [
                        1
                    ]
                }
            ],
            "ability": [
                34,
                {
                    "id": [
                        0
                    ]
                }
            ],
            "fatigue_effects": [
                62
            ],
            "fatigue_morale_effects": [
                11
            ],
            "unit_experience_bonuses": [
                63
            ],
            "campaign_difficulty_handicap_effects": [
                69
            ],
            "unit_stats_land_experience_bonuses": [
                9
            ],
            "ui_tagged_images": [
                8
            ],
            "kv": [
                11,
                {
                    "name": [
                        0,
                        "String!"
                    ]
                }
            ],
            "character_trait_levels": [
                70
            ],
            "unit_stat_localisations": [
                80
            ],
            "attributes": [
                25
            ],
            "special_ability_groups": [
                33
            ],
            "ui_text_replacements": [
                81
            ],
            "unit_stat_to_size_scaling_values": [
                82
            ],
            "__typename": [
                0
            ]
        },
        "ID": {},
        "Int": {},
        "ui_tagged_image": {
            "key": [
                6
            ],
            "image_path": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "unit_stats_land_experience_bonuse": {
            "xp_level": [
                7
            ],
            "fatigue": [
                7
            ],
            "mp_fixed_cost": [
                7
            ],
            "mp_experience_cost_multiplier": [
                10
            ],
            "additional_melee_cp": [
                7
            ],
            "additional_missile_cp": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "Float": {},
        "kvp": {
            "key": [
                6
            ],
            "value": [
                10
            ],
            "description": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "rule": {
            "key": [
                6
            ],
            "value": [
                10
            ],
            "description": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "melee_weapon": {
            "key": [
                6
            ],
            "bonus_v_cavalry": [
                7
            ],
            "bonus_v_large": [
                7
            ],
            "bonus_v_infantry": [
                7
            ],
            "damage": [
                7
            ],
            "ap_damage": [
                7
            ],
            "first_strike": [
                7
            ],
            "weapon_length": [
                10
            ],
            "melee_weapon_type": [
                0
            ],
            "splash_attack_target_size": [
                0
            ],
            "splash_attack_max_attacks": [
                7
            ],
            "splash_attack_power_multiplier": [
                10
            ],
            "ignition_amount": [
                7
            ],
            "is_magical": [
                2
            ],
            "contact_phase": [
                40
            ],
            "collision_attack_max_targets": [
                7
            ],
            "collision_attack_max_targets_cooldown": [
                7
            ],
            "melee_attack_interval": [
                10
            ],
            "building_damage": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "explosion": {
            "key": [
                6
            ],
            "detonation_radius": [
                10
            ],
            "detonation_duration": [
                10
            ],
            "detonation_speed": [
                7
            ],
            "detonation_damage": [
                7
            ],
            "shrapnel_type": [
                0
            ],
            "shrapnel_amount": [
                7
            ],
            "distance_from_target": [
                7
            ],
            "contact_phase_effect": [
                40
            ],
            "ignition_amount": [
                7
            ],
            "is_magical": [
                2
            ],
            "detonation_damage_ap": [
                7
            ],
            "detonation_force": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "projectile": {
            "key": [
                6
            ],
            "category": [
                0
            ],
            "shot_type": [
                0
            ],
            "explosion": [
                14
            ],
            "projectile_number": [
                7
            ],
            "effective_range": [
                7
            ],
            "minimum_range": [
                7
            ],
            "max_elevation": [
                7
            ],
            "muzzle_velocity": [
                7
            ],
            "marksmanship_bonus": [
                10
            ],
            "spread": [
                10
            ],
            "damage": [
                7
            ],
            "ap_damage": [
                7
            ],
            "can_bounce": [
                2
            ],
            "collision_radius": [
                10
            ],
            "base_reload_time": [
                10
            ],
            "calibration_distance": [
                10
            ],
            "calibration_area": [
                10
            ],
            "bonus_v_infantry": [
                7
            ],
            "bonus_v_cavalry": [
                7
            ],
            "bonus_v_large": [
                7
            ],
            "overhead_stat_effect": [
                40
            ],
            "shockwave_radius": [
                10
            ],
            "can_damage_buildings": [
                2
            ],
            "contact_stat_effect": [
                40
            ],
            "gravity": [
                10
            ],
            "burst_size": [
                7
            ],
            "burst_shot_delay": [
                10
            ],
            "mass": [
                7
            ],
            "homing_param": [
                0
            ],
            "ignition_amount": [
                7
            ],
            "is_magical": [
                2
            ],
            "can_target_airborne": [
                2
            ],
            "fixed_elevation": [
                7
            ],
            "projectile_penetration": [
                16
            ],
            "expiry_range": [
                7
            ],
            "is_beam_launch_burst": [
                2
            ],
            "expire_on_impact": [
                2
            ],
            "can_roll": [
                2
            ],
            "trail_always_on": [
                2
            ],
            "shots_per_volley": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "projectile_penetration": {
            "key": [
                0
            ],
            "entity_size_cap": [
                0
            ],
            "max_penetration": [
                7
            ],
            "description": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "missile_weapon": {
            "key": [
                6
            ],
            "default_projectile": [
                15
            ],
            "use_secondary_ammo_pool": [
                2
            ],
            "__typename": [
                0
            ]
        },
        "unit_shield_type": {
            "key": [
                6
            ],
            "parry_chance": [
                7
            ],
            "material": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "bullet_point_generator": {
            "bullet_point_enum": [
                0
            ],
            "text_override": [
                0
            ],
            "unit_class": [
                0
            ],
            "unit_stat": [
                0
            ],
            "unit_stat_threshold": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "unit_class": {
            "key": [
                6
            ],
            "onscreen": [
                0
            ],
            "sort_priority": [
                7
            ],
            "bullet_point_generators": [
                19
            ],
            "__typename": [
                0
            ]
        },
        "armour": {
            "key": [
                6
            ],
            "armour_value": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "land_unit": {
            "key": [
                0
            ],
            "accuracy": [
                7
            ],
            "category": [
                0
            ],
            "charge_bonus": [
                7
            ],
            "dismounted_charge_bonus": [
                7
            ],
            "dismounted_melee_attack": [
                7
            ],
            "historical_description_text": [
                0
            ],
            "melee_attack": [
                7
            ],
            "melee_defence": [
                7
            ],
            "ground_stat_effect_group": [
                23
            ],
            "morale": [
                7
            ],
            "bonus_hit_points": [
                7
            ],
            "short_description_text": [
                0
            ],
            "visibility_spotting_range_min": [
                7
            ],
            "visibility_spotting_range_max": [
                7
            ],
            "attribute_group": [
                0
            ],
            "spot_dist_tree": [
                7
            ],
            "spot_dist_scrub": [
                7
            ],
            "reload": [
                7
            ],
            "hiding_scalar": [
                10
            ],
            "secondary_ammo": [
                7
            ],
            "primary_ammo": [
                7
            ],
            "damage_mod_flame": [
                7
            ],
            "damage_mod_flames": [
                7
            ],
            "damage_mod_magic": [
                7
            ],
            "damage_mod_physical": [
                7
            ],
            "damage_mod_missile": [
                7
            ],
            "damage_mod_missiles": [
                7
            ],
            "damage_mod_all": [
                7
            ],
            "num_engines": [
                7
            ],
            "num_mounts": [
                7
            ],
            "ai_usage_group": [
                0
            ],
            "can_skirmish": [
                2
            ],
            "onscreen_name": [
                0
            ],
            "armour": [
                21
            ],
            "unit_class": [
                20
            ],
            "mount": [
                26
            ],
            "primary_melee_weapon": [
                13
            ],
            "primary_missile_weapon": [
                17
            ],
            "shield": [
                18
            ],
            "attributes": [
                25
            ],
            "abilities": [
                34
            ],
            "special_ability_groups": [
                33
            ],
            "battle_entity": [
                32
            ],
            "engine": [
                27
            ],
            "officers": [
                28
            ],
            "variant": [
                44
            ],
            "articulated_vehicle_entity": [
                32
            ],
            "__typename": [
                0
            ]
        },
        "ground_type_stat_effect_group": {
            "group_name": [
                0
            ],
            "onscreen_name": [
                0
            ],
            "stat_effects": [
                24
            ],
            "__typename": [
                0
            ]
        },
        "ground_type_to_stat_effect": {
            "ground_type": [
                0
            ],
            "affected_stat": [
                0
            ],
            "multiplier": [
                10
            ],
            "affected_group": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "attribute": {
            "key": [
                6
            ],
            "bullet_text": [
                0
            ],
            "imbued_effect_text": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "mount": {
            "key": [
                6
            ],
            "battle_entity": [
                32
            ],
            "variant": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "engine": {
            "key": [
                6
            ],
            "engine_type": [
                0
            ],
            "missile_weapon": [
                17
            ],
            "battle_entity": [
                32
            ],
            "__typename": [
                0
            ]
        },
        "land_unit_officers": {
            "officer_1": [
                30
            ],
            "additionnal_personalities": [
                30
            ],
            "__typename": [
                0
            ]
        },
        "battle_mount": {
            "base_unit": [
                0
            ],
            "mounted_unit": [
                0
            ],
            "icon_name": [
                0
            ],
            "mount_name": [
                0
            ],
            "localised_description": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "battle_personality": {
            "key": [
                6
            ],
            "type": [
                0
            ],
            "missile_type": [
                15
            ],
            "variant": [
                44
            ],
            "battle_entity": [
                32
            ],
            "rider_attachment_point": [
                0
            ],
            "battle_entity_stats": [
                31
            ],
            "autonomous_rider_hero": [
                2
            ],
            "__typename": [
                0
            ]
        },
        "battle_entity_stats": {
            "primary_melee_weapon": [
                13
            ],
            "primary_missile_weapon": [
                17
            ],
            "__typename": [
                0
            ]
        },
        "battle_entity": {
            "key": [
                6
            ],
            "type": [
                0
            ],
            "walk_speed": [
                10
            ],
            "run_speed": [
                10
            ],
            "acceleration": [
                10
            ],
            "deceleration": [
                10
            ],
            "charge_speed": [
                10
            ],
            "crawl_speed": [
                7
            ],
            "charge_distance_commence_run": [
                10
            ],
            "charge_distance_adopt_charge_pose": [
                10
            ],
            "charge_distance_pick_target": [
                10
            ],
            "shape": [
                0
            ],
            "radius": [
                10
            ],
            "mass": [
                10
            ],
            "height": [
                10
            ],
            "fire_arc_close": [
                10
            ],
            "turn_speed": [
                10
            ],
            "hit_points": [
                7
            ],
            "min_turning_speed": [
                10
            ],
            "fly_speed": [
                10
            ],
            "flying_charge_speed": [
                10
            ],
            "size": [
                0
            ],
            "strafe_speed": [
                10
            ],
            "combat_reaction_radius": [
                10
            ],
            "entity_effects": [
                0
            ],
            "hit_reactions_ignore_chance": [
                10
            ],
            "knock_interrupts_ignore_chance": [
                10
            ],
            "__typename": [
                0
            ]
        },
        "special_ability_group": {
            "ability_group": [
                6
            ],
            "icon_path": [
                0
            ],
            "special_edition_mask": [
                7
            ],
            "sort_order": [
                7
            ],
            "is_naval": [
                2
            ],
            "colour_r": [
                7
            ],
            "colour_g": [
                7
            ],
            "colour_b": [
                7
            ],
            "button_name": [
                0
            ],
            "abilities": [
                34
            ],
            "name": [
                0
            ],
            "is_composite_group": [
                2
            ],
            "__typename": [
                0
            ]
        },
        "ability": {
            "key": [
                6
            ],
            "supercedes_ability": [
                2
            ],
            "requires_effect_enabling": [
                2
            ],
            "icon_name": [
                0
            ],
            "uniqueness": [
                0
            ],
            "is_unit_upgrade": [
                2
            ],
            "is_hidden_in_ui": [
                2
            ],
            "name": [
                0
            ],
            "tooltip": [
                0
            ],
            "type": [
                43
            ],
            "unit_special_ability": [
                37
            ],
            "overpower_option": [
                34
            ],
            "phases": [
                40
            ],
            "special_ability_groups": [
                33
            ],
            "additional_ui_effects": [
                35
            ],
            "__typename": [
                0
            ]
        },
        "additional_ui_effect": {
            "key": [
                6
            ],
            "localised_text": [
                0
            ],
            "sort_order": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "invalid_usage_flag": {
            "flag_key": [
                6
            ],
            "flag_description": [
                0
            ],
            "alt_description": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "special_ability": {
            "key": [
                6
            ],
            "active_time": [
                10
            ],
            "recharge_time": [
                10
            ],
            "num_uses": [
                7
            ],
            "effect_range": [
                7
            ],
            "affect_self": [
                2
            ],
            "num_effected_friendly_units": [
                7
            ],
            "num_effected_enemy_units": [
                7
            ],
            "update_targets_every_frame": [
                2
            ],
            "initial_recharge": [
                10
            ],
            "target_friends": [
                2
            ],
            "target_enemies": [
                2
            ],
            "target_ground": [
                2
            ],
            "target_intercept_range": [
                7
            ],
            "assume_specific_behaviour": [
                0
            ],
            "clear_current_order": [
                2
            ],
            "wind_up_time": [
                10
            ],
            "passive": [
                2
            ],
            "unique_id": [
                7
            ],
            "wind_up_stance": [
                0
            ],
            "mana_cost": [
                7
            ],
            "min_range": [
                7
            ],
            "targetting_aoe": [
                0
            ],
            "passive_aoe": [
                0
            ],
            "active_aoe": [
                0
            ],
            "activation_effect": [
                0
            ],
            "vortex": [
                39
            ],
            "miscast_chance": [
                10
            ],
            "ai_usage": [
                0
            ],
            "special_ability_display": [
                0
            ],
            "additional_melee_cp": [
                10
            ],
            "additional_missile_cp": [
                10
            ],
            "bombardment": [
                38
            ],
            "spawned_unit": [
                22
            ],
            "miscast_explosion": [
                14
            ],
            "parent_ability": [
                37
            ],
            "activated_projectile": [
                15
            ],
            "phases": [
                40
            ],
            "invalid_targets": [
                0
            ],
            "invalid_usages": [
                0
            ],
            "auto_deactivate_flags": [
                36
            ],
            "__typename": [
                0
            ]
        },
        "projectile_bombardments": {
            "arrival_window": [
                10
            ],
            "bombardment_key": [
                6
            ],
            "num_projectiles": [
                7
            ],
            "radius_spread": [
                10
            ],
            "start_time": [
                10
            ],
            "launch_source": [
                0
            ],
            "launch_height": [
                7
            ],
            "launch_height_underground": [
                7
            ],
            "projectile_type": [
                15
            ],
            "__typename": [
                0
            ]
        },
        "vortex": {
            "change_max_angle": [
                7
            ],
            "contact_effect": [
                40
            ],
            "damage": [
                7
            ],
            "damage_ap": [
                7
            ],
            "duration": [
                10
            ],
            "expansion_speed": [
                10
            ],
            "goal_radius": [
                10
            ],
            "infinite_height": [
                2
            ],
            "move_change_freq": [
                10
            ],
            "movement_speed": [
                10
            ],
            "start_radius": [
                10
            ],
            "vortex_key": [
                6
            ],
            "ignition_amount": [
                7
            ],
            "is_magical": [
                2
            ],
            "detonation_force": [
                7
            ],
            "launch_source": [
                0
            ],
            "building_collision": [
                0
            ],
            "height_off_ground": [
                10
            ],
            "delay": [
                10
            ],
            "num_vortexs": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "phase": {
            "id": [
                6
            ],
            "onscreen_name": [
                0
            ],
            "duration": [
                10
            ],
            "effect_type": [
                0
            ],
            "requested_stance": [
                0
            ],
            "unbreakable": [
                2
            ],
            "cant_move": [
                2
            ],
            "freeze_fatigue": [
                2
            ],
            "fatigue_change_ratio": [
                10
            ],
            "inspiration_aura_change_mod": [
                10
            ],
            "ability_recharge_change": [
                10
            ],
            "hp_change_frequency": [
                10
            ],
            "heal_amount": [
                10
            ],
            "damage_chance": [
                10
            ],
            "damage_amount": [
                7
            ],
            "max_damaged_entities": [
                7
            ],
            "resurrect": [
                2
            ],
            "mana_regen_mod": [
                10
            ],
            "mana_max_depletion_mod": [
                10
            ],
            "imbue_magical": [
                2
            ],
            "imbue_ignition": [
                10
            ],
            "imbue_contact": [
                40
            ],
            "phase_display": [
                0
            ],
            "stat_effects": [
                41
            ],
            "attribute_effects": [
                42
            ],
            "__typename": [
                0
            ]
        },
        "stat_effect": {
            "phase": [
                6
            ],
            "stat": [
                0
            ],
            "value": [
                10
            ],
            "how": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "attribute_effect": {
            "phase": [
                6
            ],
            "attribute": [
                0
            ],
            "attribute_type": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "ability_type": {
            "key": [
                0
            ],
            "icon": [
                0
            ],
            "onscreen_name": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "unit_variant": {
            "unit": [
                6
            ],
            "faction": [
                0
            ],
            "name": [
                0
            ],
            "variant": [
                0
            ],
            "unit_card": [
                0
            ],
            "unit_card_url": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "ui_unit_group": {
            "icon": [
                0
            ],
            "key": [
                6
            ],
            "parent_group": [
                46
            ],
            "name": [
                0
            ],
            "tooltip": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "ui_unit_group_parent": {
            "key": [
                6
            ],
            "onscreen_name": [
                0
            ],
            "icon": [
                0
            ],
            "order": [
                7
            ],
            "mp_cap": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "battle_set_piece_armies_character": {
            "character_level": [
                7
            ],
            "character_name": [
                6
            ],
            "forename": [
                0
            ],
            "magic_lore": [
                0
            ],
            "num_men": [
                7
            ],
            "surname": [
                0
            ],
            "unit_type": [
                0
            ],
            "agent_type": [
                0
            ],
            "agent_subtype": [
                0
            ],
            "portrait": [
                0
            ],
            "character_model": [
                7
            ],
            "skillset": [
                0
            ],
            "male": [
                2
            ],
            "ancillaries": [
                48
            ],
            "__typename": [
                0
            ]
        },
        "ancillary": {
            "key": [
                6
            ],
            "onscreen_name": [
                0
            ],
            "applies_to": [
                0
            ],
            "transferrable": [
                2
            ],
            "unique_to_world": [
                2
            ],
            "unique_to_faction": [
                2
            ],
            "precedence": [
                7
            ],
            "legendary_item": [
                2
            ],
            "uniqueness_score": [
                7
            ],
            "turns_before_swap_allowed": [
                7
            ],
            "randomly_dropped": [
                2
            ],
            "provided_bodyguard_unit": [
                0
            ],
            "provided_banner": [
                50
            ],
            "subcategory": [
                0
            ],
            "category": [
                0
            ],
            "type": [
                0
            ],
            "ancillary_effects": [
                49
            ],
            "__typename": [
                0
            ]
        },
        "ancillary_effect": {
            "value": [
                10
            ],
            "effect_scope": [
                0
            ],
            "effect": [
                54
            ],
            "__typename": [
                0
            ]
        },
        "banner": {
            "banner": [
                6
            ],
            "effect_bundle": [
                51
            ],
            "__typename": [
                0
            ]
        },
        "effect_bundle": {
            "key": [
                6
            ],
            "localised_title": [
                0
            ],
            "localised_description": [
                0
            ],
            "ui_icon": [
                0
            ],
            "bundle_target": [
                0
            ],
            "priority": [
                7
            ],
            "effect_bundle_effects": [
                52
            ],
            "__typename": [
                0
            ]
        },
        "effect_bundle_effect": {
            "effect": [
                54
            ],
            "value": [
                7
            ],
            "effect_scope": [
                0
            ],
            "advancement_stage": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "agent_action": {
            "ability": [
                34
            ],
            "localised_action_name": [
                0
            ],
            "localised_action_description": [
                0
            ],
            "unique_id": [
                0
            ],
            "critical_success_proportion_modifier": [
                10
            ],
            "opportune_failure_proportion_modifier": [
                10
            ],
            "critical_failure_proportion_modifier": [
                10
            ],
            "chance_of_success": [
                7
            ],
            "icon_path": [
                0
            ],
            "show_action_info_in_ui": [
                2
            ],
            "subculture": [
                66
            ],
            "succeed_always_override": [
                2
            ],
            "order": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "effect": {
            "effect": [
                6
            ],
            "icon": [
                0
            ],
            "priority": [
                7
            ],
            "description": [
                0
            ],
            "icon_negative": [
                0
            ],
            "category": [
                0
            ],
            "is_positive_value_good": [
                2
            ],
            "agent_actions": [
                56
            ],
            "phases": [
                56
            ],
            "attributes": [
                56
            ],
            "abilities": [
                56
            ],
            "__typename": [
                0
            ]
        },
        "effect_bonus_value": {
            "on_agent_action": [
                53
            ],
            "on_phase": [
                40
            ],
            "on_ability": [
                34
            ],
            "on_attribute_effect": [
                42
            ],
            "__typename": [
                0
            ]
        },
        "effect_bonus": {
            "bonus_value_id": [
                0
            ],
            "value": [
                55
            ],
            "__typename": [
                0
            ]
        },
        "main_unit": {
            "unit": [
                6
            ],
            "land_unit": [
                22
            ],
            "num_men": [
                7
            ],
            "multiplayer_cost": [
                7
            ],
            "weight": [
                0
            ],
            "recruitment_cost": [
                7
            ],
            "upkeep_cost": [
                7
            ],
            "create_time": [
                7
            ],
            "campaign_cap": [
                7
            ],
            "multiplayer_cap": [
                7
            ],
            "caste": [
                0
            ],
            "unique_index": [
                7
            ],
            "ui_unit_group": [
                45
            ],
            "tier": [
                7
            ],
            "is_high_threat": [
                2
            ],
            "campaign_mount": [
                60
            ],
            "mount_name": [
                0
            ],
            "battle_mounts": [
                29
            ],
            "melee_cp": [
                10
            ],
            "missile_cp": [
                10
            ],
            "is_monstrous": [
                2
            ],
            "campaign_factions": [
                65,
                {
                    "include_non_mp": [
                        2
                    ]
                }
            ],
            "factions": [
                65,
                {
                    "include_non_mp": [
                        2
                    ]
                }
            ],
            "custom_battle_permissions": [
                59
            ],
            "bullet_points": [
                61
            ],
            "is_naval": [
                2
            ],
            "unit_sets": [
                58
            ],
            "agent_subtype": [
                74
            ],
            "can_siege": [
                2
            ],
            "barrier_health": [
                10
            ],
            "__typename": [
                0
            ]
        },
        "unit_set": {
            "key": [
                6
            ],
            "use_unit_exp_level_range": [
                2
            ],
            "min_unit_exp_level_inclusive": [
                7
            ],
            "max_unit_exp_level_inclusive": [
                7
            ],
            "special_category": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "unit_custom_battle_permission": {
            "faction": [
                0
            ],
            "general_unit": [
                2
            ],
            "unit": [
                0
            ],
            "siege_unit_attacker": [
                2
            ],
            "siege_unit_defender": [
                2
            ],
            "general_portrait": [
                0
            ],
            "general_uniform": [
                0
            ],
            "set_piece_character": [
                47
            ],
            "campaign_exclusive": [
                2
            ],
            "__typename": [
                0
            ]
        },
        "campaign_mount": {
            "model": [
                0
            ],
            "variant": [
                0
            ],
            "scale": [
                10
            ],
            "actor": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "bullet_point": {
            "key": [
                6
            ],
            "state": [
                0
            ],
            "sort_order": [
                7
            ],
            "onscreen_name": [
                0
            ],
            "tooltip": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "unit_fatigue_effect": {
            "key": [
                6
            ],
            "fatigue_threshold": [
                7
            ],
            "fatigue_level": [
                0
            ],
            "scalar_speed": [
                10
            ],
            "stat_melee_attack": [
                10
            ],
            "stat_reloading": [
                10
            ],
            "stat_armour": [
                10
            ],
            "stat_charge_bonus": [
                10
            ],
            "stat_melee_damage_ap": [
                10
            ],
            "stat_melee_defense": [
                10
            ],
            "stat_melee_defence": [
                10
            ],
            "__typename": [
                0
            ]
        },
        "unit_experience_bonus": {
            "stat": [
                6
            ],
            "value": [
                7
            ],
            "growth_rate": [
                10
            ],
            "growth_scalar": [
                10
            ],
            "__typename": [
                0
            ]
        },
        "military_group": {
            "name": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "faction": {
            "key": [
                6
            ],
            "subculture": [
                66
            ],
            "screen_name": [
                0
            ],
            "screen_adjective": [
                0
            ],
            "is_rebel": [
                2
            ],
            "mp_available": [
                2
            ],
            "flags_path": [
                0
            ],
            "flags_url": [
                0
            ],
            "name_group": [
                0
            ],
            "primary_colour_hex": [
                0
            ],
            "secondary_colour_hex": [
                0
            ],
            "military_group": [
                0
            ],
            "can_be_horde": [
                2
            ],
            "faction_swapping_id": [
                0
            ],
            "is_waaagh_faction": [
                2
            ],
            "is_quest_faction": [
                2
            ],
            "units": [
                57,
                {
                    "groupHeroesAndLords": [
                        2
                    ]
                }
            ],
            "__typename": [
                0
            ]
        },
        "subculture": {
            "subculture": [
                0
            ],
            "name": [
                0
            ],
            "culture": [
                67
            ],
            "__typename": [
                0
            ]
        },
        "culture": {
            "key": [
                0
            ],
            "name": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "unit_stat": {
            "key": [
                6
            ],
            "max_value": [
                7
            ],
            "campaign_only": [
                2
            ],
            "sort_order": [
                7
            ],
            "localisation": [
                0
            ],
            "icon": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "campaign_difficulty_handicap_effect": {
            "key": [
                6
            ],
            "campaign_difficulty_handicap": [
                7
            ],
            "human": [
                2
            ],
            "effect": [
                54
            ],
            "effect_scope": [
                0
            ],
            "effect_value": [
                0
            ],
            "optional_campaign_key": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "character_trait_level": {
            "key": [
                6
            ],
            "onscreen_name": [
                0
            ],
            "character_trait": [
                72
            ],
            "level": [
                7
            ],
            "threshold_points": [
                7
            ],
            "colour_text": [
                0
            ],
            "explanation_text": [
                0
            ],
            "removal_text": [
                0
            ],
            "trait_level_effects": [
                71
            ],
            "__typename": [
                0
            ]
        },
        "trait_level_effect": {
            "effect": [
                54
            ],
            "value": [
                10
            ],
            "effect_scope": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "character_trait": {
            "key": [
                6
            ],
            "no_going_back_level": [
                7
            ],
            "hidden": [
                2
            ],
            "precedence": [
                7
            ],
            "category": [
                73
            ],
            "author": [
                0
            ],
            "comment": [
                0
            ],
            "ui_priority": [
                7
            ],
            "antitrait": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "trait_category": {
            "category": [
                6
            ],
            "icon_path": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "agent_subtype": {
            "key": [
                6
            ],
            "auto_generate": [
                2
            ],
            "is_caster": [
                2
            ],
            "small_icon": [
                0
            ],
            "associated_unit_override": [
                0
            ],
            "audio_voiceover_actor_group": [
                0
            ],
            "show_in_ui": [
                2
            ],
            "cap": [
                7
            ],
            "has_female_name": [
                2
            ],
            "can_gain_xp": [
                2
            ],
            "loyality_is_applicable": [
                2
            ],
            "contributes_to_agent_cap": [
                2
            ],
            "onscreen_name_override": [
                0
            ],
            "description_text_override": [
                0
            ],
            "character_skill_node_set": [
                75
            ],
            "__typename": [
                0
            ]
        },
        "character_skill_node_set": {
            "agent_key": [
                0
            ],
            "campaign_key": [
                0
            ],
            "faction_key": [
                0
            ],
            "key": [
                0
            ],
            "subculture": [
                0
            ],
            "for_army": [
                2
            ],
            "for_navy": [
                2
            ],
            "agent_subtype_key": [
                0
            ],
            "enc_title": [
                0
            ],
            "character_skill_nodes": [
                76
            ],
            "__typename": [
                0
            ]
        },
        "character_skill_node": {
            "campaign_key": [
                0
            ],
            "character_skill_key": [
                0
            ],
            "character_skill_node_set_key": [
                0
            ],
            "faction_key": [
                0
            ],
            "indent": [
                7
            ],
            "key": [
                6
            ],
            "tier": [
                7
            ],
            "subculture": [
                0
            ],
            "points_on_creation": [
                7
            ],
            "required_num_parents": [
                7
            ],
            "visible_in_ui": [
                2
            ],
            "__typename": [
                0
            ]
        },
        "character_skill": {
            "image_path": [
                0
            ],
            "key": [
                6
            ],
            "localised_description": [
                0
            ],
            "localised_name": [
                0
            ],
            "unlocked_at_rank": [
                7
            ],
            "is_background_skill": [
                2
            ],
            "is_female_only_background_skill": [
                2
            ],
            "is_male_only_background_skill": [
                2
            ],
            "background_weighting": [
                7
            ],
            "influence_cost": [
                7
            ],
            "__typename": [
                0
            ]
        },
        "character_skill_category": {
            "key": [
                6
            ],
            "max_incident": [
                7
            ],
            "min_incident": [
                7
            ],
            "order": [
                7
            ],
            "col_r": [
                7
            ],
            "col_g": [
                7
            ],
            "col_b": [
                7
            ],
            "agent_subtype_override": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "character_skill_level_detail": {
            "campaign_key": [
                6
            ],
            "faction_key": [
                6
            ],
            "image_path": [
                0
            ],
            "level": [
                7
            ],
            "skill_key": [
                0
            ],
            "subculture_key": [
                0
            ],
            "unlocked_at_rank": [
                7
            ],
            "localised_name": [
                0
            ],
            "localised_description": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "unit_stat_localisation": {
            "stat_key": [
                6
            ],
            "onscreen_name": [
                0
            ],
            "tooltip_text": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "ui_text_replacement": {
            "key": [
                6
            ],
            "localised_text": [
                0
            ],
            "__typename": [
                0
            ]
        },
        "unit_stat_to_size_scaling_value": {
            "stat": [
                6
            ],
            "size": [
                0
            ],
            "single_entity_value": [
                10
            ],
            "multi_entity_value": [
                10
            ],
            "__typename": [
                0
            ]
        },
        "CacheControlScope": {},
        "Upload": {}
    }
}