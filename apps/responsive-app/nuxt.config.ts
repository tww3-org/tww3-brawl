// https://nuxt.com/docs/api/configuration/nuxt-config
import type { NuxtConfig } from 'nuxt/schema';

const config: NuxtConfig = {
  devtools: { enabled: true },

  build: {
    // Transpilation nécessaire pour le SDK local car il est publié en ESM/TypeScript
    // et doit être converti en format compatible avec le bundle Nuxt
    transpile: ['@tww3-brawl/sdk'],
  },

  compatibilityDate: '2024-12-30',
  
  modules: [
    'nuxt-quasar-ui',
    '@pinia/nuxt', // required
    'pinia-plugin-persistedstate/nuxt',
  ],

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
