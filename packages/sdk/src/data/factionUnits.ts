import type { GraphQLClient, Unit } from '../types';
import { adaptUnit, unitSelection } from './unitAdapter';

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
          units: unitSelection,
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
      const adaptedUnit = adaptUnit(unit, versionId);
      if (adaptedUnit) {
        units.push(adaptedUnit);
      }
    }

    return units;
  } catch (error) {
    console.error('Erreur lors de la récupération des unités:', error);
    throw error;
  }
}
