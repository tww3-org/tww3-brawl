<template>
  <h1 class="title">TWW3 Brawl</h1>
  <div class="q-pa-md">
    <div class="q-gutter-y-md row justify-center items-center">
      <UnitCard 
        orientation="left" 
        class="bg-positive"
        :modelValue="unitStore.leftUnit"
        @update:modelValue="(value) => unitStore.setLeftUnit(value)"
      />
      <UnitCard 
        orientation="right" 
        class="bg-negative"
        :modelValue="unitStore.rightUnit"
        @update:modelValue="(value) => unitStore.setRightUnit(value)"
      />
    </div>
    
    <!-- Reset Button -->
    <div class="q-mt-md text-center">
      <q-btn 
        label="Reset" 
        color="warning" 
        icon="refresh" 
        @click="resetUnits"
      />
    </div>
    
    <!-- Entity Sliders -->
    <div class="row q-gutter-md" v-if="unitStore.leftUnit || unitStore.rightUnit">
      <div class="col-6" v-if="unitStore.leftUnit">
        Store: {{ unitStore.leftUnit.entityNumber }}
        <EntitySliders 
          :entity-number="unitStore.leftUnit.entityNumber" 
          :max-entities="unitStore.leftUnit.selection?.unit?.num_men || 1"
          @update:entity-number="(value) => unitStore.setLeftUnitEntityCount(value)"
        />
      </div>
      <div class="col-6" v-if="unitStore.rightUnit">
        Store: {{ unitStore.rightUnit.entityNumber }}
        <EntitySliders 
          :entity-number="unitStore.rightUnit.entityNumber" 
          :max-entities="unitStore.rightUnit.selection?.unit?.num_men || 1"
          @update:entity-number="(value) => unitStore.setRightUnitEntityCount(value)"
        />
      </div>
    </div>
  
    <!-- Short Summary -->
    <ShortSummary />

    <!-- Detail View -->
    <DetailView :leftUnit="unitStore.leftUnit" :rightUnit="unitStore.rightUnit" @update="onUpdate" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUnitStore } from '~/stores/unitStore'
import type { UnitBonusPathes, UnitWithEntityNumberAndBonus } from '~/types/unit'
import UnitCard from '~/components/UnitCard/index.vue'
import EntitySliders from '~/components/EntitySliders.vue'
import type { Paths } from '~/shared/jsonpath'

const unitStore = useUnitStore()

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
  console.log('onUpdate bonus', unitStore.leftUnit?.bonus, unitStore.rightUnit?.bonus)
  console.log('onUpdate unit', unitStore.leftUnit?.selection, unitStore.rightUnit?.selection)
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
</style>