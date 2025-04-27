# TWW3 Brawl SDK

SDK for accessing Total War Warhammer data.

## Installation

```bash
npm install @tww3-brawl/sdk
```

## Usage

The SDK provides framework-agnostic core functions to fetch data from the TWW API.

### Core functions (framework-agnostic)

```typescript
import { fetchVersions, fetchFactions, fetchUnits } from '@tww3-brawl/sdk';
import { createClient } from '@tww3-brawl/gql';

// Create a GraphQL client
const client = createClient({
  url: 'https://your-graphql-endpoint.com'
});

// Fetch versions
const versions = await fetchVersions(client);

// Fetch factions for a specific version
const factions = await fetchFactions(client, 'version-id');

// Fetch units for a specific faction and version
const units = await fetchUnits(client, 'version-id', 'faction-key');
```

### Using with Nuxt and Vue

For Nuxt and Vue applications, we recommend creating composables in your application that use the core SDK functions with TanStack Query.

Example: Create the following composables in your application:

```typescript
// composables/useGraphQLClient.ts
import { useNuxtApp } from '#app';
import type { GraphQLClient } from '@tww3-brawl/sdk';

export function useGraphQLClient(): GraphQLClient {
  const { $client } = useNuxtApp();
  return $client;
}

// composables/useVersions.ts
import { useQuery } from '@tanstack/vue-query';
import { fetchVersions, type Version } from '@tww3-brawl/sdk';
import { useGraphQLClient } from './useGraphQLClient';

export function useVersions() {
  const client = useGraphQLClient();
  
  return useQuery<Version[]>({
    queryKey: ['tww', 'versions'],
    queryFn: () => fetchVersions(client),
    staleTime: 60 * 60 * 1000,
  });
}
```

## API Reference

### Core Functions

#### `fetchVersions(client: GraphQLClient): Promise<Version[]>`

Fetches all game versions.

#### `fetchFactions(client: GraphQLClient, versionId: string): Promise<Faction[]>`

Fetches all factions for a specific game version.

#### `fetchUnits(client: GraphQLClient, versionId: string, factionKey: string): Promise<Unit[]>`

Fetches all units for a specific faction and game version. 