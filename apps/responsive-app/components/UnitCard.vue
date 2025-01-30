<template>
  <q-card class="unit-card">
    <q-img
      :src="imageUrl"
      :ratio="16/9"
      class="unit-image"
    />
    
    <q-card-section :class="orientation">
      <div class="text-h6">{{ title }}</div>
      <div class="text-subtitle2">{{ description }}</div>
      
      <div class="q-mt-md" :class="{ 'flex justify-end': orientation === 'right' }">
        <SelectUnit v-model="selectedUnit" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SelectUnit from './SelectUnit.vue'

interface Props {
  imageUrl?: string
  title?: string
  description?: string
  orientation?: 'left' | 'right'
}

withDefaults(defineProps<Props>(), {
  imageUrl: '/default-unit-image.jpg',
  title: 'Unit Title',
  description: 'Unit Description',
  orientation: 'left'
})

const selectedUnit = ref<string>()
</script>

<style scoped>
.unit-card {
  max-width: 350px;
  width: 100%;
}

.unit-image {
  width: 100%;
  height: auto;
}

.right {
  text-align: right;
}

.left {
  text-align: left;
}
</style>