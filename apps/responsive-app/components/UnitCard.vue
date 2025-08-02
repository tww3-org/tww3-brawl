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
      
      <!-- Slider pour le nombre d'entités -->
      <div v-if="showEntitySlider" class="q-mt-md">
        <div class="text-caption q-mb-xs">
          Nombre d'entités actives: {{ entityCount }}
        </div>
        <q-slider
          v-model="entityCount"
          :min="1"
          :max="maxEntityCount"
          :step="1"
          label
          label-always
          color="primary"
          @update:model-value="updateEntityCount"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Unit } from '@tww3-brawl/sdk/src/types'
import { getUnitPortrait } from '@tww3-brawl/sdk/src/utils/getUnitPortrait'
import type { UnitSelection, UnitWithEntityCount } from '~/types/unit'
import { getMaxEntityCount } from '~/types/unit'
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

// Two-way binding avec le parent
const selectedUnit = computed({
  get: () => props.modelValue?.selection || undefined,
  set: (value: UnitSelection | undefined) => {
    if (value) {
      const maxEntityCount = getMaxEntityCount(value);
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

// Computed pour le titre de l'unité
const unitTitle = computed(() => {
  if (selectedUnit.value?.unit?.land_unit?.onscreen_name) {
    return selectedUnit.value.unit.land_unit.onscreen_name;
  }
  return 'Unit Title';
});

// Computed pour l'image de l'unité
const unitImageUrl = computed(() => {
  if (selectedUnit.value?.unit && selectedUnit.value?.version?.id) {
    const portrait = getUnitPortrait(selectedUnit.value.version.id, selectedUnit.value.unit)
    if (portrait) {
      return portrait
    }
  }
  return '/default-unit-image.jpg'
})

// Computed pour le nombre maximum d'entités
const maxEntityCount = computed(() => {
  if (!selectedUnit.value) return 1;
  return getMaxEntityCount(selectedUnit.value);
})

// Computed pour déterminer si on doit afficher le slider
const showEntitySlider = computed(() => {
  return selectedUnit.value && maxEntityCount.value > 1;
})

// Computed pour le nombre d'entités actuel
const entityCount = computed({
  get: () => props.modelValue?.entityCount || 1,
  set: (value: number) => {
    if (props.modelValue) {
      emit('update:modelValue', {
        ...props.modelValue,
        entityCount: value
      })
    }
  }
})

// Fonction pour mettre à jour le nombre d'entités
const updateEntityCount = (value: number | null) => {
  if (value !== null) {
    entityCount.value = value;
  }
}
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