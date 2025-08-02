<template>
  <q-card class="unit-card">
    <q-img
      :src="unitImageUrl"
      :ratio="16/9"
      fit="contain"
      class="unit-image"
    />
    
    <q-card-section :class="orientation" class="card-section">
      <div class="text-h6">{{ unitTitle }}</div>
      
      <div class="q-mt-md" :class="{ 'flex justify-end': orientation === 'right' }">
        <SelectUnit v-model="selectedUnit" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Unit } from '@tww3-brawl/sdk/src/types'
import { getUnitPortrait } from '@tww3-brawl/sdk/src/utils/getUnitPortrait'
import type { UnitSelection, UnitWithEntityCount } from '~/types/unit'
import SelectUnit from './SelectUnit.vue'

interface Props {
  orientation?: 'left' | 'right'
  modelValue?: UnitWithEntityCount | null
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'left'
})

const emit = defineEmits<{
  'update:modelValue': [value: UnitWithEntityCount | null]
}>()

// Two-way binding with parent
const selectedUnit = computed({
  get: () => props.modelValue?.selection || undefined,
  set: (value: UnitSelection | undefined) => {
    if (value) {
      const maxEntityCount = value.unit?.num_men || 1;
      const defaultEntityCount = Math.min(15, maxEntityCount);
      
      emit('update:modelValue', {
        selection: value,
        entityCount: defaultEntityCount
      })
    } else {
      emit('update:modelValue', null)
    }
  }
})

// Computed for unit title
const unitTitle = computed(() => {
  if (selectedUnit.value?.unit?.land_unit?.onscreen_name) {
    return selectedUnit.value.unit.land_unit.onscreen_name;
  }
  return 'Unit Title';
});

// Computed for unit image
const unitImageUrl = computed(() => {
  if (selectedUnit.value?.unit && selectedUnit.value?.version?.id) {
    const portrait = getUnitPortrait(selectedUnit.value.version.id, selectedUnit.value.unit)
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
  width: 500px;
  height: 350px;
  display: flex;
  flex-direction: column;
}

.unit-image {
  width: 100%;
  height: auto;
  flex: 1;
}

.card-section {
  margin-top: auto;
}

.right {
  text-align: right;
}

.left {
  text-align: left;
}
</style>