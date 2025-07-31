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
    
    <!-- Affichage des sélections pour debug -->
    <div class="q-mt-lg" v-if="leftUnit || rightUnit">
      <h3>Sélections actuelles :</h3>
      <div class="row q-gutter-md">
        <div class="col-6" v-if="leftUnit">
          <q-card>
            <q-card-section>
              <div class="text-h6">Left</div>
              <div>{{ leftUnit.unit.land_unit?.onscreen_name }}</div>
              <div class="text-caption">{{ leftUnit.version.label }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6" v-if="rightUnit">
          <q-card>
            <q-card-section>
              <div class="text-h6">Right</div>
              <div>{{ rightUnit.unit.land_unit?.onscreen_name }}</div>
              <div class="text-caption">{{ rightUnit.version.label }}</div>
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
import UnitCard from '~/components/UnitCard.vue'

// Type pour la sélection d'unité avec version
interface UnitSelection {
  unit: Unit;
  version: { label: string; value: string };
}

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
</script>

<style scoped>
h1 {
  text-align: center;
}
</style>