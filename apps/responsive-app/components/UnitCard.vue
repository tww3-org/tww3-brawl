<template>
  <q-card class="unit-card">
    <q-img
      :src="unitImageUrl"
      :ratio="16/9"
      fit="contain"
      class="unit-image"
    />
    
    <q-card-section :class="orientation">
      <div class="text-h6">{{ unitTitle }}</div>
      
      <div class="q-mt-md" :class="{ 'flex justify-end': orientation === 'right' }">
        <SelectUnit v-model="selectedUnit" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Unit } from '@tww3-brawl/sdk/src/types'
import { getUnitPortrait } from '@tww3-brawl/sdk/src/utils/getUnitPortrait'
import SelectUnit from './SelectUnit.vue'

// Type pour la sélection d'unité avec version
interface UnitSelection {
  unit: Unit;
  version: { label: string; value: string };
}

interface Props {
  orientation?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'left'
})

const selectedUnit = ref<UnitSelection>()

// Computed pour le titre de l'unité
const unitTitle = computed(() => {
  if (selectedUnit.value?.unit?.land_unit?.onscreen_name) {
    return selectedUnit.value.unit.land_unit.onscreen_name;
  }
  return 'Unit Title';
});

// Computed pour l'image de l'unité
const unitImageUrl = computed(() => {
  if (selectedUnit.value?.unit && selectedUnit.value?.version?.value) {
    const portrait = getUnitPortrait(selectedUnit.value.version.value, selectedUnit.value.unit)
    if (portrait) {
      return portrait
    }
  }
  return '/default-unit-image.jpg'
})
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