import type { GraphQLClient, UnitSearchResult } from '../types';
import { isMainUnitCard } from '../utils/isMainUnitCard';
import { adaptUnit, unitSelection } from './unitAdapter';

/**
 * Recherche des unités par nom (recherche côté serveur) pour une version donnée.
 * Ne garde que les cartes principales (pas les variantes de monture) jouables
 * (rattachées à au moins une faction).
 * @param client Client GraphQL typé depuis le package gql
 * @param versionId ID de la version du jeu
 * @param query Texte recherché
 * @param size Nombre maximum d'entrées demandées au serveur
 * @returns Liste d'unités avec leur faction
 */
export async function searchUnits(
  client: GraphQLClient,
  versionId: string,
  query: string,
  size = 100
): Promise<UnitSearchResult[]> {
  const trimmed = query.trim();
  if (!versionId || !trimmed) {
    return [];
  }

  try {
    const result = await client.query({
      tww: {
        __args: {
          tww_version: versionId,
        },
        units: {
          __args: {
            offset: 0,
            size,
            query: trimmed,
          },
          ...unitSelection,
          factions: {
            key: true,
            screen_name: true,
            flags_url: true,
            subculture: {
              name: true,
            },
          },
        },
      },
    });

    const results: UnitSearchResult[] = [];
    const seen = new Set<string>();

    for (const raw of result?.tww?.units ?? []) {
      const faction = raw?.factions?.[0];
      if (!raw || !faction || !faction.key) continue;

      const unit = adaptUnit(raw, versionId);
      if (!unit || !isMainUnitCard(unit) || seen.has(unit.unit)) continue;

      seen.add(unit.unit);
      results.push({
        unit,
        faction: {
          key: faction.key,
          screen_name: faction.screen_name || faction.key,
          flags_url: faction.flags_url || undefined,
          subculture: faction.subculture?.name
            ? { name: faction.subculture.name }
            : undefined,
        },
      });
    }

    return results;
  } catch (error) {
    console.error('Erreur lors de la recherche des unités:', error);
    throw error;
  }
}
