export default {
    "scalars": [
        0,
        1,
        3,
        6,
        8,
        68,
        69
    ],
    "types": {
        "CacheControlScope": {},
        "StringBoolean": {},
        "Query": {
            "ping": [
                3
            ],
            "versions": [
                4
            ],
            "tww": [
                5,
                {
                    "tww_version": [
                        3,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                3
            ]
        },
        "String": {},
        "gameVersion": {
            "game": [
                3
            ],
            "id": [
                3
            ],
            "name": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "tww": {
            "tww_version": [
                6
            ],
            "game_version": [
                4
            ],
            "units": [
                9,
                {
                    "offset": [
                        68,
                        "Int!"
                    ],
                    "size": [
                        68,
                        "Int!"
                    ],
                    "includeQb": [
                        69
                    ],
                    "includeSummoned": [
                        69
                    ],
                    "includeBosses": [
                        69
                    ],
                    "includeSouthenRealms": [
                        69
                    ],
                    "includeKislev": [
                        69
                    ],
                    "query": [
                        3
                    ]
                }
            ],
            "unit": [
                9,
                {
                    "id": [
                        3
                    ]
                }
            ],
            "factions": [
                49,
                {
                    "include_non_mp": [
                        1
                    ]
                }
            ],
            "faction": [
                49,
                {
                    "id": [
                        3
                    ]
                }
            ],
            "unit_stats": [
                16
            ],
            "abilities": [
                32,
                {
                    "offset": [
                        68,
                        "Int!"
                    ],
                    "size": [
                        68,
                        "Int!"
                    ],
                    "special_ability_group": [
                        3
                    ],
                    "query": [
                        3
                    ],
                    "noGroupsOnly": [
                        69
                    ]
                }
            ],
            "ability": [
                32,
                {
                    "id": [
                        3
                    ]
                }
            ],
            "fatigue_effects": [
                13
            ],
            "fatigue_morale_effects": [
                7
            ],
            "unit_experience_bonuses": [
                14
            ],
            "campaign_difficulty_handicap_effects": [
                59
            ],
            "unit_stats_land_experience_bonuses": [
                15
            ],
            "ui_tagged_images": [
                64
            ],
            "kv": [
                7,
                {
                    "name": [
                        3,
                        "String!"
                    ]
                }
            ],
            "character_trait_levels": [
                55
            ],
            "unit_stat_localisations": [
                17
            ],
            "attributes": [
                41
            ],
            "special_ability_groups": [
                33
            ],
            "ui_text_replacements": [
                67
            ],
            "unit_stat_to_size_scaling_values": [
                18
            ],
            "__typename": [
                3
            ]
        },
        "ID": {},
        "kvp": {
            "key": [
                6
            ],
            "value": [
                8
            ],
            "description": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "Float": {},
        "main_unit": {
            "unit": [
                6
            ],
            "land_unit": [
                19
            ],
            "num_men": [
                68
            ],
            "multiplayer_cost": [
                68
            ],
            "weight": [
                3
            ],
            "recruitment_cost": [
                68
            ],
            "upkeep_cost": [
                68
            ],
            "create_time": [
                68
            ],
            "caste": [
                3
            ],
            "ui_unit_group": [
                65
            ],
            "tier": [
                68
            ],
            "is_high_threat": [
                1
            ],
            "mount_name": [
                3
            ],
            "battle_mounts": [
                25
            ],
            "factions": [
                49,
                {
                    "include_non_mp": [
                        1
                    ]
                }
            ],
            "custom_battle_permissions": [
                11
            ],
            "bullet_points": [
                12
            ],
            "unit_sets": [
                10
            ],
            "can_siege": [
                1
            ],
            "barrier_health": [
                8
            ],
            "__typename": [
                3
            ]
        },
        "unit_set": {
            "key": [
                6
            ],
            "special_category": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "unit_custom_battle_permission": {
            "faction": [
                3
            ],
            "general_unit": [
                1
            ],
            "unit": [
                3
            ],
            "general_portrait": [
                3
            ],
            "set_piece_character": [
                52
            ],
            "campaign_exclusive": [
                1
            ],
            "__typename": [
                3
            ]
        },
        "bullet_point": {
            "key": [
                6
            ],
            "state": [
                3
            ],
            "sort_order": [
                68
            ],
            "onscreen_name": [
                3
            ],
            "tooltip": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "unit_fatigue_effect": {
            "key": [
                6
            ],
            "fatigue_threshold": [
                68
            ],
            "fatigue_level": [
                3
            ],
            "scalar_speed": [
                8
            ],
            "stat_melee_attack": [
                8
            ],
            "stat_reloading": [
                8
            ],
            "stat_armour": [
                8
            ],
            "stat_charge_bonus": [
                8
            ],
            "stat_melee_damage_ap": [
                8
            ],
            "stat_melee_defence": [
                8
            ],
            "__typename": [
                3
            ]
        },
        "unit_experience_bonus": {
            "stat": [
                6
            ],
            "value": [
                68
            ],
            "growth_rate": [
                8
            ],
            "growth_scalar": [
                8
            ],
            "__typename": [
                3
            ]
        },
        "unit_stats_land_experience_bonuse": {
            "xp_level": [
                68
            ],
            "fatigue": [
                68
            ],
            "mp_fixed_cost": [
                68
            ],
            "mp_experience_cost_multiplier": [
                8
            ],
            "additional_melee_cp": [
                68
            ],
            "additional_missile_cp": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "unit_stat": {
            "key": [
                6
            ],
            "sort_order": [
                68
            ],
            "icon": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "unit_stat_localisation": {
            "stat_key": [
                6
            ],
            "onscreen_name": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "unit_stat_to_size_scaling_value": {
            "stat": [
                6
            ],
            "size": [
                3
            ],
            "single_entity_value": [
                8
            ],
            "multi_entity_value": [
                8
            ],
            "__typename": [
                3
            ]
        },
        "land_unit": {
            "key": [
                3
            ],
            "accuracy": [
                68
            ],
            "category": [
                3
            ],
            "charge_bonus": [
                68
            ],
            "melee_attack": [
                68
            ],
            "melee_defence": [
                68
            ],
            "ground_stat_effect_group": [
                30
            ],
            "morale": [
                68
            ],
            "bonus_hit_points": [
                68
            ],
            "short_description_text": [
                3
            ],
            "reload": [
                68
            ],
            "secondary_ammo": [
                68
            ],
            "primary_ammo": [
                68
            ],
            "damage_mod_flame": [
                68
            ],
            "damage_mod_magic": [
                68
            ],
            "damage_mod_physical": [
                68
            ],
            "damage_mod_missile": [
                68
            ],
            "damage_mod_all": [
                68
            ],
            "num_engines": [
                68
            ],
            "num_mounts": [
                68
            ],
            "can_skirmish": [
                1
            ],
            "onscreen_name": [
                3
            ],
            "armour": [
                21
            ],
            "unit_class": [
                20
            ],
            "mount": [
                23
            ],
            "primary_melee_weapon": [
                42
            ],
            "primary_missile_weapon": [
                46
            ],
            "shield": [
                22
            ],
            "attributes": [
                41
            ],
            "abilities": [
                32
            ],
            "special_ability_groups": [
                33
            ],
            "battle_entity": [
                28
            ],
            "engine": [
                24
            ],
            "battle_personalities": [
                26
            ],
            "variant": [
                29
            ],
            "articulated_vehicle_entity": [
                28
            ],
            "__typename": [
                3
            ]
        },
        "unit_class": {
            "key": [
                6
            ],
            "__typename": [
                3
            ]
        },
        "armour": {
            "key": [
                6
            ],
            "armour_value": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "unit_shield_type": {
            "key": [
                6
            ],
            "parry_chance": [
                68
            ],
            "shield_defence_value": [
                68
            ],
            "shield_armour_value": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "mount": {
            "key": [
                6
            ],
            "battle_entity": [
                28
            ],
            "variant": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "engine": {
            "key": [
                6
            ],
            "engine_type": [
                3
            ],
            "missile_weapon": [
                46
            ],
            "battle_entity": [
                28
            ],
            "__typename": [
                3
            ]
        },
        "battle_mount": {
            "base_unit": [
                3
            ],
            "mounted_unit": [
                3
            ],
            "icon_name": [
                3
            ],
            "mount_name": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "battle_personality": {
            "key": [
                6
            ],
            "battle_entity": [
                28
            ],
            "battle_entity_stats": [
                27
            ],
            "__typename": [
                3
            ]
        },
        "battle_entity_stats": {
            "primary_melee_weapon": [
                42
            ],
            "primary_missile_weapon": [
                46
            ],
            "__typename": [
                3
            ]
        },
        "battle_entity": {
            "key": [
                6
            ],
            "type": [
                3
            ],
            "walk_speed": [
                8
            ],
            "run_speed": [
                8
            ],
            "acceleration": [
                8
            ],
            "deceleration": [
                8
            ],
            "charge_speed": [
                8
            ],
            "charge_distance_commence_run": [
                8
            ],
            "charge_distance_adopt_charge_pose": [
                8
            ],
            "charge_distance_pick_target": [
                8
            ],
            "radius": [
                8
            ],
            "mass": [
                8
            ],
            "height": [
                8
            ],
            "turn_speed": [
                8
            ],
            "hit_points": [
                68
            ],
            "fly_speed": [
                8
            ],
            "flying_charge_speed": [
                8
            ],
            "size": [
                3
            ],
            "combat_reaction_radius": [
                8
            ],
            "hit_reactions_ignore_chance": [
                8
            ],
            "knock_interrupts_ignore_chance": [
                8
            ],
            "__typename": [
                3
            ]
        },
        "unit_variant": {
            "unit": [
                6
            ],
            "faction": [
                3
            ],
            "name": [
                3
            ],
            "variant": [
                3
            ],
            "unit_card": [
                3
            ],
            "unit_card_url": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "ground_type_stat_effect_group": {
            "group_name": [
                3
            ],
            "onscreen_name": [
                3
            ],
            "stat_effects": [
                31
            ],
            "__typename": [
                3
            ]
        },
        "ground_type_to_stat_effect": {
            "ground_type": [
                3
            ],
            "affected_stat": [
                3
            ],
            "multiplier": [
                8
            ],
            "__typename": [
                3
            ]
        },
        "ability": {
            "key": [
                6
            ],
            "supercedes_ability": [
                1
            ],
            "requires_effect_enabling": [
                1
            ],
            "icon_name": [
                3
            ],
            "uniqueness": [
                3
            ],
            "is_unit_upgrade": [
                1
            ],
            "is_hidden_in_ui": [
                1
            ],
            "name": [
                3
            ],
            "tooltip": [
                3
            ],
            "type": [
                38
            ],
            "unit_special_ability": [
                34
            ],
            "overpower_option": [
                32
            ],
            "phases": [
                35
            ],
            "special_ability_groups": [
                33
            ],
            "additional_ui_effects": [
                39
            ],
            "__typename": [
                3
            ]
        },
        "special_ability_group": {
            "ability_group": [
                6
            ],
            "icon_path": [
                3
            ],
            "sort_order": [
                68
            ],
            "button_name": [
                3
            ],
            "abilities": [
                32
            ],
            "name": [
                3
            ],
            "is_composite_group": [
                1
            ],
            "__typename": [
                3
            ]
        },
        "special_ability": {
            "key": [
                6
            ],
            "active_time": [
                8
            ],
            "recharge_time": [
                8
            ],
            "num_uses": [
                68
            ],
            "effect_range": [
                68
            ],
            "affect_self": [
                1
            ],
            "num_effected_friendly_units": [
                68
            ],
            "num_effected_enemy_units": [
                68
            ],
            "update_targets_every_frame": [
                1
            ],
            "initial_recharge": [
                8
            ],
            "target_friends": [
                1
            ],
            "target_enemies": [
                1
            ],
            "target_ground": [
                1
            ],
            "target_intercept_range": [
                68
            ],
            "assume_specific_behaviour": [
                3
            ],
            "clear_current_order": [
                1
            ],
            "wind_up_time": [
                8
            ],
            "passive": [
                1
            ],
            "unique_id": [
                68
            ],
            "wind_up_stance": [
                3
            ],
            "mana_cost": [
                68
            ],
            "min_range": [
                68
            ],
            "targetting_aoe": [
                3
            ],
            "passive_aoe": [
                3
            ],
            "active_aoe": [
                3
            ],
            "activation_effect": [
                3
            ],
            "vortex": [
                48
            ],
            "miscast_chance": [
                8
            ],
            "ai_usage": [
                3
            ],
            "special_ability_display": [
                3
            ],
            "additional_melee_cp": [
                8
            ],
            "additional_missile_cp": [
                8
            ],
            "bombardment": [
                47
            ],
            "spawned_unit": [
                19
            ],
            "miscast_explosion": [
                43
            ],
            "parent_ability": [
                34
            ],
            "activated_projectile": [
                44
            ],
            "phases": [
                35
            ],
            "invalid_targets": [
                3
            ],
            "invalid_usages": [
                3
            ],
            "auto_deactivate_flags": [
                40
            ],
            "__typename": [
                3
            ]
        },
        "phase": {
            "id": [
                6
            ],
            "onscreen_name": [
                3
            ],
            "duration": [
                8
            ],
            "effect_type": [
                3
            ],
            "requested_stance": [
                3
            ],
            "unbreakable": [
                1
            ],
            "cant_move": [
                1
            ],
            "freeze_fatigue": [
                1
            ],
            "fatigue_change_ratio": [
                8
            ],
            "inspiration_aura_change_mod": [
                8
            ],
            "ability_recharge_change": [
                8
            ],
            "hp_change_frequency": [
                8
            ],
            "heal_amount": [
                8
            ],
            "damage_chance": [
                8
            ],
            "damage_amount": [
                68
            ],
            "max_damaged_entities": [
                68
            ],
            "resurrect": [
                1
            ],
            "mana_regen_mod": [
                8
            ],
            "mana_max_depletion_mod": [
                8
            ],
            "imbue_magical": [
                1
            ],
            "imbue_ignition": [
                8
            ],
            "imbue_contact": [
                35
            ],
            "phase_display": [
                3
            ],
            "stat_effects": [
                36
            ],
            "attribute_effects": [
                37
            ],
            "__typename": [
                3
            ]
        },
        "stat_effect": {
            "phase": [
                6
            ],
            "stat": [
                3
            ],
            "value": [
                8
            ],
            "how": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "attribute_effect": {
            "phase": [
                6
            ],
            "attribute": [
                3
            ],
            "attribute_type": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "ability_type": {
            "key": [
                3
            ],
            "icon": [
                3
            ],
            "onscreen_name": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "additional_ui_effect": {
            "key": [
                6
            ],
            "localised_text": [
                3
            ],
            "sort_order": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "invalid_usage_flag": {
            "flag_key": [
                6
            ],
            "flag_description": [
                3
            ],
            "alt_description": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "attribute": {
            "key": [
                6
            ],
            "bullet_text": [
                3
            ],
            "imbued_effect_text": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "melee_weapon": {
            "key": [
                6
            ],
            "bonus_v_large": [
                68
            ],
            "bonus_v_infantry": [
                68
            ],
            "damage": [
                68
            ],
            "ap_damage": [
                68
            ],
            "first_strike": [
                68
            ],
            "weapon_length": [
                8
            ],
            "splash_attack_target_size": [
                3
            ],
            "splash_attack_max_attacks": [
                68
            ],
            "splash_attack_power_multiplier": [
                8
            ],
            "ignition_amount": [
                68
            ],
            "is_magical": [
                1
            ],
            "contact_phase": [
                35
            ],
            "collision_attack_max_targets": [
                68
            ],
            "collision_attack_max_targets_cooldown": [
                68
            ],
            "melee_attack_interval": [
                8
            ],
            "building_damage": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "explosion": {
            "key": [
                6
            ],
            "detonation_radius": [
                8
            ],
            "detonation_damage": [
                68
            ],
            "contact_phase_effect": [
                35
            ],
            "ignition_amount": [
                68
            ],
            "is_magical": [
                1
            ],
            "detonation_damage_ap": [
                68
            ],
            "detonation_force": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "projectile": {
            "key": [
                6
            ],
            "category": [
                3
            ],
            "explosion": [
                43
            ],
            "projectile_number": [
                68
            ],
            "effective_range": [
                68
            ],
            "max_elevation": [
                68
            ],
            "marksmanship_bonus": [
                8
            ],
            "spread": [
                8
            ],
            "damage": [
                68
            ],
            "ap_damage": [
                68
            ],
            "collision_radius": [
                8
            ],
            "base_reload_time": [
                8
            ],
            "calibration_distance": [
                8
            ],
            "calibration_area": [
                8
            ],
            "bonus_v_infantry": [
                68
            ],
            "bonus_v_large": [
                68
            ],
            "overhead_stat_effect": [
                35
            ],
            "can_damage_buildings": [
                1
            ],
            "contact_stat_effect": [
                35
            ],
            "burst_size": [
                68
            ],
            "burst_shot_delay": [
                8
            ],
            "mass": [
                68
            ],
            "ignition_amount": [
                68
            ],
            "is_magical": [
                1
            ],
            "projectile_penetration": [
                45
            ],
            "shots_per_volley": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "projectile_penetration": {
            "key": [
                3
            ],
            "entity_size_cap": [
                3
            ],
            "max_penetration": [
                68
            ],
            "description": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "missile_weapon": {
            "key": [
                6
            ],
            "default_projectile": [
                44
            ],
            "use_secondary_ammo_pool": [
                1
            ],
            "__typename": [
                3
            ]
        },
        "projectile_bombardments": {
            "arrival_window": [
                8
            ],
            "bombardment_key": [
                6
            ],
            "num_projectiles": [
                68
            ],
            "radius_spread": [
                8
            ],
            "start_time": [
                8
            ],
            "launch_source": [
                3
            ],
            "launch_height": [
                68
            ],
            "launch_height_underground": [
                68
            ],
            "projectile_type": [
                44
            ],
            "__typename": [
                3
            ]
        },
        "vortex": {
            "change_max_angle": [
                68
            ],
            "contact_effect": [
                35
            ],
            "damage": [
                68
            ],
            "damage_ap": [
                68
            ],
            "duration": [
                8
            ],
            "expansion_speed": [
                8
            ],
            "goal_radius": [
                8
            ],
            "infinite_height": [
                1
            ],
            "move_change_freq": [
                8
            ],
            "movement_speed": [
                8
            ],
            "start_radius": [
                8
            ],
            "vortex_key": [
                6
            ],
            "ignition_amount": [
                68
            ],
            "is_magical": [
                1
            ],
            "detonation_force": [
                68
            ],
            "launch_source": [
                3
            ],
            "building_collision": [
                3
            ],
            "height_off_ground": [
                8
            ],
            "delay": [
                8
            ],
            "num_vortexs": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "faction": {
            "key": [
                6
            ],
            "subculture": [
                50
            ],
            "screen_name": [
                3
            ],
            "screen_adjective": [
                3
            ],
            "is_rebel": [
                1
            ],
            "mp_available": [
                1
            ],
            "flags_path": [
                3
            ],
            "flags_url": [
                3
            ],
            "name_group": [
                3
            ],
            "primary_colour_hex": [
                3
            ],
            "secondary_colour_hex": [
                3
            ],
            "units": [
                9,
                {
                    "groupHeroesAndLords": [
                        1
                    ]
                }
            ],
            "__typename": [
                3
            ]
        },
        "subculture": {
            "subculture": [
                3
            ],
            "name": [
                3
            ],
            "culture": [
                51
            ],
            "__typename": [
                3
            ]
        },
        "culture": {
            "key": [
                3
            ],
            "name": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "battle_set_piece_armies_character": {
            "num_men": [
                68
            ],
            "unit_type": [
                3
            ],
            "ancillaries": [
                53
            ],
            "__typename": [
                3
            ]
        },
        "ancillary": {
            "key": [
                6
            ],
            "onscreen_name": [
                3
            ],
            "precedence": [
                68
            ],
            "category": [
                3
            ],
            "type": [
                3
            ],
            "ancillary_effects": [
                54
            ],
            "__typename": [
                3
            ]
        },
        "ancillary_effect": {
            "value": [
                8
            ],
            "effect_scope": [
                3
            ],
            "effect": [
                61
            ],
            "__typename": [
                3
            ]
        },
        "character_trait_level": {
            "key": [
                6
            ],
            "onscreen_name": [
                3
            ],
            "character_trait": [
                57
            ],
            "level": [
                68
            ],
            "colour_text": [
                3
            ],
            "explanation_text": [
                3
            ],
            "trait_level_effects": [
                56
            ],
            "__typename": [
                3
            ]
        },
        "trait_level_effect": {
            "effect": [
                61
            ],
            "value": [
                8
            ],
            "effect_scope": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "character_trait": {
            "key": [
                6
            ],
            "hidden": [
                1
            ],
            "precedence": [
                68
            ],
            "category": [
                58
            ],
            "comment": [
                3
            ],
            "antitrait": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "trait_category": {
            "category": [
                6
            ],
            "icon_path": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "campaign_difficulty_handicap_effect": {
            "key": [
                6
            ],
            "campaign_difficulty_handicap": [
                68
            ],
            "human": [
                1
            ],
            "effect": [
                61
            ],
            "effect_scope": [
                3
            ],
            "effect_value": [
                3
            ],
            "optional_campaign_key": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "agent_action": {
            "ability": [
                32
            ],
            "unique_id": [
                3
            ],
            "icon_path": [
                3
            ],
            "subculture": [
                50
            ],
            "order": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "effect": {
            "effect": [
                6
            ],
            "icon": [
                3
            ],
            "description": [
                3
            ],
            "category": [
                3
            ],
            "is_positive_value_good": [
                1
            ],
            "phases": [
                63
            ],
            "attributes": [
                63
            ],
            "abilities": [
                63
            ],
            "__typename": [
                3
            ]
        },
        "effect_bonus_value": {
            "on_agent_action": [
                60
            ],
            "on_phase": [
                35
            ],
            "on_ability": [
                32
            ],
            "on_attribute_effect": [
                37
            ],
            "__typename": [
                3
            ]
        },
        "effect_bonus": {
            "bonus_value_id": [
                3
            ],
            "value": [
                62
            ],
            "__typename": [
                3
            ]
        },
        "ui_tagged_image": {
            "key": [
                6
            ],
            "image_path": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "ui_unit_group": {
            "icon": [
                3
            ],
            "key": [
                6
            ],
            "parent_group": [
                66
            ],
            "name": [
                3
            ],
            "tooltip": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "ui_unit_group_parent": {
            "key": [
                6
            ],
            "onscreen_name": [
                3
            ],
            "icon": [
                3
            ],
            "order": [
                68
            ],
            "mp_cap": [
                68
            ],
            "__typename": [
                3
            ]
        },
        "ui_text_replacement": {
            "key": [
                6
            ],
            "localised_text": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "Int": {},
        "Boolean": {}
    }
}