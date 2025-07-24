import type { GraphQLClient, Faction } from '../types';

interface RawFaction {
  key: string | null;
  screen_name: string | null;
  subculture?: {
    name: string | null;
  } | null;
}

/**
 * Récupère la liste des factions disponibles pour une version spécifique du jeu
 * @param client Client GraphQL typé depuis le package gql
 * @param versionId ID de la version du jeu
 * @returns Liste des factions
 */
export async function fetchFactions(
  client: GraphQLClient,
  versionId: string
): Promise<Faction[]> {
  if (!versionId) {
    throw new Error("L'ID de version est requis");
  }

  try {
    const result = await client.query({
      tww: {
        __args: {
          tww_version: versionId,
        },
        factions: {
          key: true,
          screen_name: true,
          flags_url: true,
          subculture: {
            name: true,
          },
        },
      },
    });

    if (!result?.tww?.factions) {
      return [];
    }

    const factions: Faction[] = [];

    for (const faction of result.tww.factions) {
      if (
        faction &&
        typeof faction.key === 'string' &&
        typeof faction.screen_name === 'string'
      ) {
        factions.push({
          key: faction.key,
          screen_name: faction.screen_name,
          flags_url: faction.flags_url || undefined,
          subculture:
            faction.subculture && typeof faction.subculture.name === 'string'
              ? { name: faction.subculture.name }
              : undefined,
        });
      }
    }

    return factions;
  } catch (error) {
    console.error('Erreur lors de la récupération des factions:', error);
    throw error;
  }
}
