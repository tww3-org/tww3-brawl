import { useNuxtApp } from '#app';
import type { GraphQLClient } from '@tww3-brawl/sdk';

/**
 * Récupère le client GraphQL depuis l'application Nuxt
 * @returns Le client GraphQL typé
 */
export function useGraphQLClient(): GraphQLClient {
  const { $client } = useNuxtApp();
  return $client;
}
