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
        <SelectUnit :unitSelection="unitSelection" :version="version" @update:unitSelection="(value) => updateUnitSelection(value)" @update:version="(value) => version = value" />
      </div>

      <MountPicker v-if="unitSelection?.unit?.battle_mounts?.length && unitSelection?.unit?.battle_mounts?.length > 0" :modelValue="unitSelection.unit" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getUnitPortrait } from '@tww3-brawl/sdk/src/utils/getUnitPortrait'
import type { UnitSelection, UnitWithEntityNumber } from '~/types/unit'
import SelectUnit from './SelectUnit.vue'
import MountPicker from './MountPicker.vue'

const unitSelection = computed(() => props.modelValue?.selection || null)
const version = ref<string | null>(null)

interface Props {
  orientation?: 'left' | 'right'
  modelValue?: UnitWithEntityNumber | null
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'left'
})

const emit = defineEmits<{
  'update:modelValue': [value: UnitWithEntityNumber | null]
}>()

function updateUnitSelection(value: UnitSelection) {
  const maxEntityCount = value.unit?.num_men || 1;
    const defaultEntityCount = Math.min(15, maxEntityCount);
    
    emit('update:modelValue', {
      selection: value,
      entityNumber: defaultEntityCount
    })
  
}
// Computed for unit title
const unitTitle = computed(() => {
  console.log('unitSelection', unitSelection.value)
  if (unitSelection.value?.unit?.land_unit?.onscreen_name) {
    return unitSelection.value.unit.land_unit.onscreen_name;
  }
  return 'Unit Title';
});

// Computed for unit image
const unitImageUrl = computed(() => {
  if (unitSelection.value?.unit && unitSelection.value?.version?.id) {
    const portrait = getUnitPortrait(unitSelection.value.version.id, unitSelection.value.unit)
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