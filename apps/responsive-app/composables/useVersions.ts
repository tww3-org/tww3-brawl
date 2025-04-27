import { useQuery } from '@tanstack/vue-query';
import { fetchVersions, type Version } from '@tww3-brawl/sdk';
import type { GraphQLClient } from '@tww3-brawl/sdk';
import { useGraphQLClient } from './useGraphQLClient';

/**
 * Composable pour récupérer toutes les versions disponibles du jeu
 * @param client Client GraphQL (optionnel, utilise le client Nuxt par défaut)
 * @returns Objet Query avec les données des versions
 */
export function useVersions(client?: GraphQLClient) {
  // Utilise le client fourni ou celui de Nuxt par défaut
  const graphqlClient = client || useGraphQLClient();

  return useQuery<Version[]>({
    queryKey: ['tww', 'versions'],
    queryFn: () => fetchVersions(graphqlClient),
    // Cache pour 1 heure car les données de version changent rarement
    staleTime: 60 * 60 * 1000,
  });
}
