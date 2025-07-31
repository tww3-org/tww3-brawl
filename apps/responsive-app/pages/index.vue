<template>
  <h1 class="title">TWW3 Brawl</h1>
  <div class="q-pa-md">
    <div class="q-gutter-y-md row justify-center items-center">
      <UnitCard 
        orientation="left" 
        v-model="leftUnit"
      />
      <UnitCard 
        orientation="right" 
        v-model="rightUnit"
      />
    </div>
    
    <!-- Bouton Reset -->
    <div class="q-mt-md text-center">
      <q-btn 
        label="Reset" 
        color="negative" 
        icon="refresh" 
        @click="resetUnits"
        :disable="!unitStore.leftUnit || !unitStore.rightUnit"
      />
    </div>
    
    <!-- Affichage des sélections pour debug -->
    <div class="q-mt-lg" v-if="leftUnit || rightUnit">
      <h3>Sélections actuelles :</h3>
      <div class="row q-gutter-md">
        <div class="col-6" v-if="leftUnit && leftUnit.unit && leftUnit.faction && leftUnit.version">
          <q-card>
            <q-card-section>
              <div class="text-h6">Left</div>
              <div>{{ leftUnit.unit.land_unit?.onscreen_name }}</div>
              <div>{{ leftUnit.faction.subculture?.name }}</div>
              <div class="text-caption">{{ leftUnit.version.name }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6" v-if="rightUnit && rightUnit.unit && rightUnit.faction && rightUnit.version">
          <q-card>
            <q-card-section>
              <div class="text-h6">Right</div>
              <div>{{ rightUnit.unit.land_unit?.onscreen_name }}</div>
              <div>{{ rightUnit.faction.subculture?.name }}</div>
              <div class="text-caption">{{ rightUnit.version.name }}</div>
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
import type { UnitSelection } from '~/types/unit'
import UnitCard from '~/components/UnitCard.vue'

const unitStore = useUnitStore()

// Two-way binding avec le store pour les unités
const leftUnit = computed({
  get: () => unitStore.leftUnit,
  set: (value: UnitSelection | null) => {
    unitStore.setLeftUnit(value)
    console.log('Left unit updated:', value)
  }
})

const rightUnit = computed({
  get: () => unitStore.rightUnit,
  set: (value: UnitSelection | null) => {
    unitStore.setRightUnit(value)
    console.log('Right unit updated:', value)
  }
})

// Fonction pour reset les unités
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