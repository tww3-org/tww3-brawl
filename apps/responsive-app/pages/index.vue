<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Bienvenue sur TWW3 Brawl</h1>
    <p>Page d'accueil de l'application</p>
  </div>
</template>

<script setup lang="ts">
import { helloWorld } from '@tww3-brawl/sdk';

onMounted(() => {
  console.log(helloWorld());
});

definePageMeta({
  title: 'Accueil'
})
</script> 