import { useQuery } from '@tanstack/vue-query';
import { fetchFactions, type Faction } from '@tww3-brawl/sdk';
import type { GraphQLClient } from '@tww3-brawl/sdk';
import { useGraphQLClient } from './useGraphQLClient';
import type { Ref } from 'vue';

/**
 * Composable pour récupérer les factions d'une version spécifique du jeu
 * @param versionId ID ou Ref d'ID de la version
 * @param client Client GraphQL (optionnel, utilise le client Nuxt par défaut)
 * @returns Objet Query avec les données des factions
 */
export function useFactions(
  versionId: string | Ref<string>,
  client?: GraphQLClient
) {
  // Utilise le client fourni ou celui de Nuxt par défaut
  const graphqlClient = client || useGraphQLClient();
  // Extrait la valeur si c'est une ref
  const getVersionId = () =>
    typeof versionId === 'string' ? versionId : versionId.value;

  return useQuery<Faction[]>({
    // Structure en tableau pour une invalidation propre du cache hiérarchique
    queryKey: ['tww', 'versions', getVersionId(), 'factions'],
    // Ne pas exécuter la requête si aucun versionId n'est fourni
    enabled: !!getVersionId(),
    queryFn: () => fetchFactions(graphqlClient, getVersionId()),
    // Cache pour 1 heure car les données de faction changent rarement
    staleTime: 60 * 60 * 1000,
  });
}
