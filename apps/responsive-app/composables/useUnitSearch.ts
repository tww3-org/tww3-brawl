import { useQuery } from '@tanstack/vue-query';
import { searchUnits, type UnitSearchResult } from '@tww3-brawl/sdk';
import type { GraphQLClient } from '@tww3-brawl/sdk';
import { useGraphQLClient } from './useGraphQLClient';
import { computed, type Ref } from 'vue';

/**
 * Composable pour rechercher des unités par nom dans une version
 * @param versionId Ref d'ID de la version
 * @param query Ref du texte recherché (déjà "debounced" par l'appelant)
 * @param client Client GraphQL (optionnel, utilise le client Nuxt par défaut)
 * @returns Objet Query avec les résultats de recherche
 */
export function useUnitSearch(
  versionId: Ref<string>,
  query: Ref<string>,
  client?: GraphQLClient
) {
  const graphqlClient = client || useGraphQLClient();

  return useQuery<UnitSearchResult[]>({
    queryKey: ['tww', 'versions', versionId, 'units', 'search', query],
    queryFn: () => searchUnits(graphqlClient, versionId.value, query.value.trim()),
    // Au moins 2 caractères pour limiter les requêtes
    enabled: computed(() => !!versionId.value && query.value.trim().length >= 2),
    // Cache pour 30 minutes
    staleTime: 30 * 60 * 1000,
  });
}
