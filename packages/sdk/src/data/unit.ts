import type { GraphQLClient, Unit } from '../types';
import { adaptUnit, unitSelection } from './unitAdapter';

/**
 * Récupère une unité spécifique par sa clé
 * @param client Client GraphQL typé depuis le package gql
 * @param versionId ID de la version du jeu
 * @param unitKey Clé de l'unité
 * @returns L'unité ou null si non trouvée
 */
export async function fetchUnit(
  client: GraphQLClient,
  versionId: string,
  unitKey: string
): Promise<Unit | null> {
  if (!versionId || !unitKey) {
    throw new Error('ID de version et clé d\'unité requis');
  }

  try {
    const result = await client.query({
      tww: {
        __args: {
          tww_version: versionId,
        },
        unit: {
          __args: {
            id: unitKey,
          },
          ...unitSelection,
        },
      },
    });

    if (!result?.tww?.unit) {
      return null;
    }

    return adaptUnit(result.tww.unit, versionId);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'unité:', error);
    throw error;
  }
}
