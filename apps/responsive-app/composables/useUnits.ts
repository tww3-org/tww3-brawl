import { useQuery } from '@tanstack/vue-query';
import { fetchUnits, type Unit } from '@tww3-brawl/sdk';
import type { GraphQLClient } from '@tww3-brawl/sdk';
import { useGraphQLClient } from './useGraphQLClient';
import type { Ref } from 'vue';

/**
 * Composable pour récupérer les unités d'une faction et version spécifiques
 * @param versionId ID ou Ref d'ID de la version
 * @param factionKey Clé ou Ref de clé de la faction
 * @param client Client GraphQL (optionnel, utilise le client Nuxt par défaut)
 * @returns Objet Query avec les données des unités
 */
export function useUnits(
  versionId: Ref<string>,
  factionKey: Ref<string>,
  client?: GraphQLClient
) {
  // Utilise le client fourni ou celui de Nuxt par défaut
  const graphqlClient = client || useGraphQLClient();

  return useQuery<Unit[]>({
    // Structure en tableau pour une invalidation propre du cache hiérarchique
    queryKey: ['tww', 'versions', versionId, 'factions', factionKey, 'units'],
    queryFn: () => fetchUnits(graphqlClient, versionId.value, factionKey.value),
    // Cache pour 30 minutes
    staleTime: 30 * 60 * 1000,
  });
}
