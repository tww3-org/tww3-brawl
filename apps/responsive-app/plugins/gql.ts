import { createClient, type Client } from '@tww3-brawl/gql';

export default defineNuxtPlugin(() => {
  const client = createClient({
    url: process.env.GRAPHQL_API_URL || 'https://broker.twwstats.com/graphql',
  });

  return {
    provide: {
      client,
    },
  };
});

// To use it in a component, you can do:
// const { $client } = useNuxtApp();
// it is correctly typed
