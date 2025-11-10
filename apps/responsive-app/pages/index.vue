<template>
  <h1>TWW3 Brawl</h1>
  <div class="q-pa-md container">
    <div class=" justify-center items-center unit-cards-container" v-for="unit_side in ['left', 'right']">
      <UnitCard :orientation="unit_side as 'left' | 'right'" class="unit-card" :class="{ 'bg-positive': unit_side === 'left', 'bg-negative': unit_side === 'right' }" :modelValue="unitStore[unit_side as keyof typeof unitStore.$state]"
        @update:modelValue="(value) => handleSelectionUpdate(unit_side as 'left' | 'right', value)" />
    </div>

    <!-- Reset Button -->
    <div class="text-center">
      <q-btn label="Reset" color="warning" icon="refresh" @click="resetUnits" />
    </div>

    <!-- Entity Sliders -->
    <div class="entity-sliders-container" v-if="unitStore?.left?.selection?.unit || unitStore?.right?.selection?.unit">
      <template v-for="unit_side in ['left', 'right']">
        <div class="entity-slider">
          <EntitySliders v-if="unitStore?.[unit_side as keyof typeof unitStore.$state]?.selection?.unit && getMaxEntities(unitStore[unit_side as keyof typeof unitStore.$state]!.selection.unit!) > 1"
            :entity-number="unitStore[unit_side as keyof typeof unitStore.$state]!.entityNumber"
            :max-entities="getMaxEntities(unitStore[unit_side as keyof typeof unitStore.$state]!.selection.unit!)"
            @update:entity-number="(value) => unitStore.setUnitEntityCount(unit_side as keyof typeof unitStore.$state, value)" />
        </div>
      </template>
    </div>

    <!-- Short Summary -->
    <ShortSummary />

    <!-- Detail View -->
    <DetailView ref="detailViewRef" :leftUnit="unitStore.left" :rightUnit="unitStore.right" @update="onUpdate"/>

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
  
  const unitBonus = unitStore[unit_side]?.bonus ?? null;
  unitStore[unit_side] = value.unitWithEntityNumberAndBonus;
    if (!value.mount_changed) {
      detailViewRef.value?.reset(unit_side)
    } else {
      unitStore.setUnitBonus(unit_side, unitBonus)
    }
}

const onUpdate = (unit_side: 'left' | 'right', path: UnitBonusPathes, value: number) => {
  const unitBonus = unitStore[unit_side]?.bonus ?? null;
  if (unitBonus) {
    unitBonus[path] = value;
  }
  unitStore.setUnitBonus(unit_side, unitBonus)
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