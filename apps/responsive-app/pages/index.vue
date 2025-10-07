<template>
  <h1>TWW3 Brawl</h1>
  <div class="q-pa-md container">
    <div class=" justify-center items-center unit-cards-container">
      <UnitCard orientation="left" class="bg-positive unit-card" :modelValue="unitStore.leftUnit"
        @update:modelValue="(value) => handleSelectionUpdate('left', value)" />
      <UnitCard orientation="right" class="bg-negative unit-card" :modelValue="unitStore.rightUnit"
        @update:modelValue="(value) => handleSelectionUpdate('right', value)" />
    </div>

    <!-- Reset Button -->
    <div class="text-center">
      <q-btn label="Reset" color="warning" icon="refresh" @click="resetUnits" />
    </div>

    <!-- Entity Sliders -->
    <div class="entity-sliders-container" v-if="unitStore?.leftUnit?.selection?.unit || unitStore?.rightUnit?.selection?.unit">
      <div class="entity-slider">
        <EntitySliders v-if="unitStore?.leftUnit?.selection?.unit && getMaxEntities(unitStore.leftUnit.selection.unit) > 1"
          :entity-number="unitStore.leftUnit.entityNumber"
          :max-entities="unitStore.leftUnit.selection?.unit?.num_men || 1"
          @update:entity-number="(value) => unitStore.setLeftUnitEntityCount(value)" />
      </div>
      <div class="entity-slider">
        <EntitySliders v-if="unitStore?.rightUnit?.selection?.unit && getMaxEntities(unitStore.rightUnit.selection.unit) > 1"
          :entity-number="unitStore.rightUnit.entityNumber"
          :max-entities="getMaxEntities(unitStore.rightUnit.selection.unit)"
          @update:entity-number="(value) => unitStore.setRightUnitEntityCount(value)" />
      </div>
    </div>

    <!-- Short Summary -->
    <ShortSummary />

    <!-- Detail View -->
    <DetailView ref="detailViewRef" :leftUnit="unitStore.leftUnit" :rightUnit="unitStore.rightUnit" @update="onUpdate"/>

    <div style="min-height: 25vh;">

    </div>
  </div>
</template>

<script setup lang="ts">
import { useUnitStore } from '~/stores/unitStore'
import type { UnitBonusPathes, UnitWithEntityNumberAndBonus } from '~/types/unit'
import UnitCard from '~/components/UnitCard/index.vue'
import EntitySliders from '~/components/EntitySliders.vue'
import { getMaxEntities } from '@tww3-brawl/sdk/src/utils/getMaxEntities'
import DetailView from '~/components/DetailView/index.vue'

const unitStore = useUnitStore()
const detailViewRef: Ref<typeof DetailView | null> = ref(null)

const handleSelectionUpdate = (unit_side: 'left' | 'right', value: {unitWithEntityNumberAndBonus: UnitWithEntityNumberAndBonus | null, mount_changed: boolean}) => {
  if (unit_side === 'left') {
    const unitBonus = unitStore.leftUnit?.bonus ?? null;
    unitStore.setLeftUnit(value.unitWithEntityNumberAndBonus)
    if (!value.mount_changed) {
      detailViewRef.value?.reset('left')
    } else {
      unitStore.setLeftUnitBonus(unitBonus)
    }
    console.log('DEBUG leftUnit', unitStore.leftUnit)
  } else {
    const unitBonus = unitStore.rightUnit?.bonus ?? null;
    unitStore.setRightUnit(value.unitWithEntityNumberAndBonus)
    if (!value.mount_changed) {
      detailViewRef.value?.reset('right')
    } else {
      unitStore.setRightUnitBonus(unitBonus)
    }
  }
}

const onUpdate = (unit_side: 'left' | 'right', path: UnitBonusPathes, value: number) => {
  if (unit_side === 'left') {
    const unitBonus = unitStore.leftUnit?.bonus ?? null;
    if (unitBonus) {
      unitBonus[path] = value;
    }
    unitStore.setLeftUnitBonus(unitBonus)
  } else {
    const unitBonus = unitStore.rightUnit?.bonus ?? null;
    if (unitBonus) {
      unitBonus[path] = value;
    }
    unitStore.setRightUnitBonus(unitBonus)
  }
}
// Function to reset units
const resetUnits = () => {
  unitStore.clearUnits()
}
</script>

<style scoped>
h1 {
  text-align: center;
}

.container {
  text-align: center
    /* centre horizontalement */
}

.container > * {
  max-width: 1000px;
  margin: 16px auto 0;
}

.entity-sliders-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;
}

.entity-slider {
  width: 50%;
  display: inline-block;
}

.unit-cards-container {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.unit-card {
  width: 50%;
}

@media (max-width: 768px) {
  .unit-cards-container {
    flex-direction: column;
  }

  .unit-card {
    width: 100%;
  }
}
</style>