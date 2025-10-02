// https://nuxt.com/docs/api/configuration/nuxt-config
import type { NuxtConfig } from 'nuxt/schema';

const config: NuxtConfig = {
  devtools: { enabled: true },

  // Configuration for static site generation
  ssr: false,
  
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    buildAssetsDir: '_nuxt/',
    head: {
      title: 'TWW3 Brawl',
      meta: [
        { name: 'description', content: 'A calculator for a Total War: Warhammer 3 Brawl (simple melee combat)' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  },

  build: {
    // Transpilation nécessaire pour le SDK local car il est publié en ESM/TypeScript
    // et doit être converti en format compatible avec le bundle Nuxt
    transpile: ['@tww3-brawl/sdk'],
  },

  routeRules: {
    '/test': { prerender: false },
    '/example': { prerender: false }
  },

  compatibilityDate: '2024-12-30',

  runtimeConfig: {
    public: {
      graphqlUrl: process.env.GRAPHQL_API_URL || 'https://broker.twwstats.com/graphql',
    },
  },
  
  modules: [
    'nuxt-quasar-ui',
    '@pinia/nuxt', // required
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/icon',
  ],

  css: ['~/assets/styles/main.css'],

  quasar: {
    extras: {
      fontIcons: ['material-icons'],
    },
    config: {
      brand: {
        primary: '#1976D2',
        secondary: '#26A69A',
        accent: '#9C27B0',
        dark: '#1d1d1d',
        positive: '#E63946', // 🔴 Rouge vif et agressif'#21BA45',
        negative: '#1D3557', // 🔵 Bleu profond et puissant'#C10015',
      },
      dark: false,
    },
    plugins: [],
  },
};

export default defineNuxtConfig(config) as ReturnType<typeof defineNuxtConfig>;
