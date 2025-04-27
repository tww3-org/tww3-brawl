import type { GraphQLClient, Version } from '../types';

/**
 * Récupère la liste des versions disponibles du jeu
 * @param client Client GraphQL typé depuis le package gql
 * @returns Liste des versions
 */
export async function fetchVersions(client: GraphQLClient): Promise<Version[]> {
  try {
    const result = await client.query({
      versions: {
        id: true,
        name: true,
        game: true,
      },
    });

    if (!result?.versions) {
      return [];
    }

    return result.versions
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .map((v) => ({
        id: v.id as string,
        name: v.name as string,
        game: v.game as string,
      }));
  } catch (error) {
    console.error('Erreur lors de la récupération des versions:', error);
    throw error;
  }
}
