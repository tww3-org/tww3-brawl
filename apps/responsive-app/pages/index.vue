<template>
  <h1 class="title">TWW3 Brawl</h1>
  <div class="q-pa-md">
    <div class="q-gutter-y-md row justify-center items-center">
      <UnitCard orientation="left" />
      <UnitCard orientation="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import UnitCard from '~/components/UnitCard.vue'

const unit1 = ref('unit1')
const unit2 = ref('unit2')

watch(unit1, (newValue) => {
  console.log('Unit 1 changed:', newValue)
})

watch(unit2, (newValue) => {
  console.log('Unit 2 changed:', newValue)
})
</script>

<style scoped>
h1 {
  text-align: center;
}
</style>