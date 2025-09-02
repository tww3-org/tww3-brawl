import { useQuery } from '@tanstack/vue-query';
import { fetchUnit, type Unit } from '@tww3-brawl/sdk';
import type { GraphQLClient } from '@tww3-brawl/sdk';
import { useGraphQLClient } from './useGraphQLClient';
import type { Ref } from 'vue';

/**
 * Composable pour récupérer une unité spécifique par sa clé
 * @param versionId ID ou Ref d'ID de la version
 * @param unitKey Clé ou Ref de clé de l'unité
 * @param client Client GraphQL (optionnel, utilise le client Nuxt par défaut)
 * @returns Objet Query avec les données de l'unité
 */
export function useUnit(
  versionId: Ref<string>,
  unitKey: Ref<string>,
  client?: GraphQLClient
) {
  // Utilise le client fourni ou celui de Nuxt par défaut
  const graphqlClient = client || useGraphQLClient();

  return useQuery<Unit | null>({
    // Structure en tableau pour une invalidation propre du cache hiérarchique
    queryKey: ['tww', 'versions', versionId, 'units', unitKey],
    queryFn: () => fetchUnit(graphqlClient, versionId.value, unitKey.value),
    // Cache pour 30 minutes
    staleTime: 30 * 60 * 1000,
    // Ne pas exécuter la requête si les paramètres ne sont pas définis
    enabled: !!versionId.value && !!unitKey.value,
  });
}
