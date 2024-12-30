<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <SelectUnit v-model="unit1" />
      <SelectUnit v-model="unit2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
</style> 