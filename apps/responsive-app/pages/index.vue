<template>
  <h1 class="title">TWW3 Brawl</h1>
  <div class="q-pa-md">
    <div class="q-gutter-y-md row justify-center items-center">
      <UnitCard 
        orientation="left" 
        class="bg-positive"
        v-model="leftUnit"
      />
      <UnitCard 
        orientation="right" 
        class="bg-negative"
        v-model="rightUnit"
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
    <EntitySliders />
  
    <!-- Short Summary -->
    <ShortSummary />

    <!-- Debug display of current selections -->
    <div class="q-mt-lg" v-if="leftUnit || rightUnit">
      <h3>Current selections:</h3>
      <div class="row q-gutter-md">
        <div class="col-6" v-if="leftUnit && leftUnit.selection && leftUnit.selection.unit && leftUnit.selection.faction && leftUnit.selection.version">
          <q-card>
            <q-card-section>
              <div class="text-h6">Left</div>
              <div>{{ leftUnit.selection.unit.land_unit?.onscreen_name }}</div>
              <div>{{ leftUnit.selection.faction.subculture?.name }}</div>
              <div class="text-caption">{{ leftUnit.selection.version.name }}</div>
              <div class="text-caption">Entities: {{ leftUnit.entityCount }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6" v-if="rightUnit && rightUnit.selection && rightUnit.selection.unit && rightUnit.selection.faction && rightUnit.selection.version">
          <q-card>
            <q-card-section>
              <div class="text-h6">Right</div>
              <div>{{ rightUnit.selection.unit.land_unit?.onscreen_name }}</div>
              <div>{{ rightUnit.selection.faction.subculture?.name }}</div>
              <div class="text-caption">{{ rightUnit.selection.version.name }}</div>
              <div class="text-caption">Entities: {{ rightUnit.entityCount }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Unit } from '@tww3-brawl/sdk/src/types'
import { useUnitStore } from '~/stores/unitStore'
import type { UnitWithEntityCount } from '~/types/unit'
import UnitCard from '~/components/UnitCard.vue'
import EntitySliders from '~/components/EntitySliders.vue'

const unitStore = useUnitStore()

// Two-way binding with store for units
const leftUnit = computed({
  get: () => unitStore.leftUnit,
  set: (value: UnitWithEntityCount | null) => {
    if (value) {
      unitStore.setLeftUnit(value.selection)
      if (value.entityCount !== unitStore.leftUnit?.entityCount) {
        unitStore.setLeftUnitEntityCount(value.entityCount)
      }
    } else {
      unitStore.setLeftUnit(null)
    }
    console.log('Left unit updated:', value)
  }
})

const rightUnit = computed({
  get: () => unitStore.rightUnit,
  set: (value: UnitWithEntityCount | null) => {
    if (value) {
      unitStore.setRightUnit(value.selection)
      if (value.entityCount !== unitStore.rightUnit?.entityCount) {
        unitStore.setRightUnitEntityCount(value.entityCount)
      }
    } else {
      unitStore.setRightUnit(null)
    }
    console.log('Right unit updated:', value)
  }
})

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