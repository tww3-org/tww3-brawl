// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  build: {
    // Transpilation nécessaire pour le SDK local car il est publié en ESM/TypeScript
    // et doit être converti en format compatible avec le bundle Nuxt
    transpile: ['@tww3-brawl/sdk']
  },
  compatibilityDate: '2024-12-30'
})