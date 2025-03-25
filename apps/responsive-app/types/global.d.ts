// Importer les types du client GraphQL
import type { Client as GqlClient } from '@tww3-brawl/gql';

// Augmenter l'interface NuxtApp pour inclure le client GraphQL
declare module '#app' {
  interface NuxtApp {
    $client: GqlClient;
  }
}

// Augmenter l'interface Plugin Context
declare module 'nuxt/app' {
  interface NuxtApp {
    $client: GqlClient;
  }
}

export {}; 