<template>
  <h1 class="title">TWW3 Brawl</h1>
  <div class="q-pa-md">
    <div class="q-gutter-y-md row justify-center items-center">
      {{ unitStore.leftUnit }}
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUnitStore } from '~/stores/unitStore'
import type { UnitWithEntityNumber } from '~/types/unit'
import UnitCard from '~/components/UnitCard.vue'
import EntitySliders from '~/components/EntitySliders.vue'

const unitStore = useUnitStore()

console.log('unitStore.leftUnit', unitStore.leftUnit)
// Two-way binding with store for units
// const leftUnit = computed({
//   get: () => unitStore.leftUnit,
//   set: (value: UnitWithEntityNumber | null) => {
//     if (value) {
//       unitStore.setLeftUnit(value.selection)
//       if (value.entityNumber !== unitStore.leftUnit?.entityNumber) {
//         unitStore.setLeftUnitEntityCount(value.entityNumber)
//       }
//     } else {
//       unitStore.setLeftUnit(null)
//     }
//     console.log('Left unit updated:', value)
//   }
// })

// const rightUnit = computed({
//   get: () => unitStore.rightUnit,
//   set: (value: UnitWithEntityNumber | null) => {
//     if (value) {
//       unitStore.setRightUnit(value.selection)
//       if (value.entityNumber !== unitStore.rightUnit?.entityNumber) {
//         unitStore.setRightUnitEntityCount(value.entityNumber)
//       }
//     } else {
//       unitStore.setRightUnit(null)
//     }
//     console.log('Right unit updated:', value)
//   }
// })

// Function to reset units
const resetUnits = () => {
  unitStore.clearUnits()
  console.log('Units reset')
}
</script>

<style scoped>
h1 {
  text-align: center;
}
</style>