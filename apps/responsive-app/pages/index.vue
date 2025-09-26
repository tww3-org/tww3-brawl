<template>
  <h1 class="title">TWW3 Brawl</h1>
  <div class="q-pa-md container">
    <div class=" justify-center items-center unit-cards-container">
      <UnitCard 
        orientation="left" 
        class="bg-positive unit-card"
        :modelValue="unitStore.leftUnit"
        @update:modelValue="(value) => unitStore.setLeftUnit(value)"
      />
      <UnitCard 
        orientation="right" 
        class="bg-negative unit-card"
        :modelValue="unitStore.rightUnit"
        @update:modelValue="(value) => unitStore.setRightUnit(value)"
      />
    </div>
    
    <!-- Reset Button -->
    <div class="text-center" style="margin-top: 16px;">
      <q-btn 
        label="Reset" 
        color="warning" 
        icon="refresh" 
        @click="resetUnits"
      />
    </div>
    
    <!-- Entity Sliders -->
    <div class="entity-sliders-container" v-if="unitStore.leftUnit || unitStore.rightUnit">
      <div class="entity-slider" v-if="unitStore.leftUnit">
        Store: {{ unitStore.leftUnit.entityNumber }}
        <EntitySliders 
          :entity-number="unitStore.leftUnit.entityNumber" 
          :max-entities="unitStore.leftUnit.selection?.unit?.num_men || 1"
          @update:entity-number="(value) => unitStore.setLeftUnitEntityCount(value)"
        />
      </div>
      <div class="entity-slider" v-if="unitStore.rightUnit">
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
import { useUnitStore } from '~/stores/unitStore'
import type { UnitBonusPathes } from '~/types/unit'
import UnitCard from '~/components/UnitCard/index.vue'
import EntitySliders from '~/components/EntitySliders.vue'

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
  text-align: center /* centre horizontalement */
}

.container > * {
  max-width: 800px;
  margin: 0 auto;
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
  height: 450px;
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