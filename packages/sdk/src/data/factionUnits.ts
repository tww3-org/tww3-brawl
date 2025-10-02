import { main_unit } from '@tww3-brawl/gql';
import type { GraphQLClient, Unit } from '../types';
import { unitHealth } from '../utils';

/**
 * Récupère la liste des unités disponibles pour une faction et une version spécifiques
 * @param client Client GraphQL typé depuis le package gql
 * @param versionId ID de la version du jeu
 * @param factionKey Clé de la faction
 * @returns Liste des unités
 */
export async function fetchFactionUnits(
  client: GraphQLClient,
  versionId: string,
  factionKey: string
): Promise<Unit[]> {
  if (!versionId || !factionKey) {
    throw new Error('ID de version et clé de faction requis');
  }

  try {
    const result = await client.query({
      tww: {
        __args: {
          tww_version: versionId,
        },
        faction: {
          __args: {
            id: factionKey,
          },
          key: true,
          screen_name: true,
          subculture: {
            name: true,
          },
          units: {
            unit: true,
            caste: true,
            num_men: true,
            recruitment_cost: true,
            upkeep_cost: true,
            land_unit: {
              onscreen_name: true,
              bonus_hit_points: true,
              num_engines: true,
              num_mounts: true,
              battle_entity: {
                hit_points: true,
                size: true,
                type: true,
              },
              articulated_vehicle_entity: {
                hit_points: true,
              },
              engine: {
                battle_entity: {
                  hit_points: true,
                  type: true,
                },
              },
              mount: {
                battle_entity: {
                  hit_points: true,
                },
              },
              armour: {
                armour_value: true,
              },
              primary_melee_weapon: {
                damage: true,
                ap_damage: true,
                bonus_v_large: true,
                bonus_v_infantry: true,
                melee_attack_interval: true,
                is_magical: true,
                ignition_amount: true,
              },
              melee_attack: true,
              melee_defence: true,
              damage_mod_physical: true,
              damage_mod_flame: true,
              damage_mod_all: true,
              variant: {
                unit_card_url: true,
              },
            },
            battle_mounts: {
              base_unit: true,
              mounted_unit: true,
              icon_name: true,
              mount_name: true
            },
            custom_battle_permissions: {
              general_portrait: true,
            },
            ui_unit_group: {
              parent_group: {
                onscreen_name: true,
              },
            },
          },
        },
      },
    });

    if (!result?.tww?.faction) {
      return [];
    }

    const faction = result.tww.faction;
    if (!faction?.units || faction.units.length === 0) {
      return [];
    }

    const units: Unit[] = [];

    for (const unit of faction.units) {
      if (
        unit &&
        typeof unit.unit === 'string' &&
        typeof unit.caste === 'string' &&
        typeof unit.num_men === 'number' &&
        unit.land_unit
      ) {
        const adaptedUnit: Unit = {
          version: versionId,
          unit: unit.unit,
          caste: unit.caste,
          num_men: unit.num_men,
          recruitment_cost: Number(unit.recruitment_cost || 0),
          upkeep_cost: Number(unit.upkeep_cost || 0),
          land_unit: {
            num_engines: unit.land_unit?.num_engines || 0,
            num_mounts: unit.land_unit?.num_mounts || 0,
            onscreen_name: unit.land_unit?.onscreen_name || '',
            bonus_hit_points: Number(unit.land_unit?.bonus_hit_points || 0),
            battle_entity: {
              hit_points: Number(unit.land_unit?.battle_entity?.hit_points || 0),
              size: unit.land_unit?.battle_entity?.size || 'small',
              type: unit.land_unit?.battle_entity?.type || '',
            },
          },
          battle_mounts: (unit.battle_mounts || [])
            .filter((mount): mount is NonNullable<typeof mount> => mount !== null)
            .map(mount => ({
              base_unit: mount.base_unit || '',
              mounted_unit: mount.mounted_unit || '',
              icon_name: mount.icon_name || '',
              mount_name: mount.mount_name || ''
            })),
          health: {
            unit: unitHealth(unit as Partial<main_unit>),
            entity: Math.round(unit.land_unit?.battle_entity?.hit_points || 0),
          },
          armor: Number(unit.land_unit?.armour?.armour_value || 0),
          attack: Number(unit.land_unit?.melee_attack || 0),
          defense: Number(unit.land_unit?.melee_defence || 0),
          attack_interval: Number(
            unit.land_unit?.primary_melee_weapon?.melee_attack_interval || 0
          ),
          damage: {
            normal: Number(unit.land_unit?.primary_melee_weapon?.damage || 0),
            piercing: Number(
              unit.land_unit?.primary_melee_weapon?.ap_damage || 0
            ),
            is_magical: Boolean(
              unit.land_unit?.primary_melee_weapon?.is_magical
            ),
            is_fire:
              Number(
                unit.land_unit?.primary_melee_weapon?.ignition_amount || 0
              ) > 0,
            bonus_v_large: Number(
              unit.land_unit?.primary_melee_weapon?.bonus_v_large || 0
            ),
            bonus_v_infantry: Number(
              unit.land_unit?.primary_melee_weapon?.bonus_v_infantry || 0
            ),
          },
          resistance: {
            physical: Number(unit.land_unit?.damage_mod_physical || 0),
            fire: Number(unit.land_unit?.damage_mod_flame || 0),
            ward_save: Number(unit.land_unit?.damage_mod_all || 0),
          },
          is_large: unit.land_unit?.battle_entity?.size !== 'small',
          general_portrait:
            unit.custom_battle_permissions?.[0]?.general_portrait || '',
          group: unit.ui_unit_group?.parent_group?.onscreen_name || '',
          unit_card_url: unit.land_unit?.variant?.unit_card_url || '',
        };

        units.push(adaptedUnit);
      }
    }

    return units;
  } catch (error) {
    console.error('Erreur lors de la récupération des unités:', error);
    throw error;
  }
}
