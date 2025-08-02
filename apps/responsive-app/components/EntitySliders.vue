<template>
  <div class="q-mt-lg">
    <div class="row q-gutter-md">
      <!-- Left unit entity slider -->
      <div class="col-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Left Unit Entities</div>
            <div v-if="leftUnit && leftUnit.selection && leftUnit.selection.unit && leftUnit.selection.unit.num_men > 1">
              <div class="text-caption q-mb-xs">
                Active entities: {{ leftUnit.entityCount }}
              </div>
              <q-slider
                v-model="leftEntityCount"
                :min="1"
                :max="leftUnit.selection.unit.num_men"
                :step="1"
                label
                label-always
                color="positive"
                @update:model-value="updateLeftEntityCount"
              />
            </div>
            <div v-else class="text-caption">
              No unit selected or unit has only 1 entity
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right unit entity slider -->
      <div class="col-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Right Unit Entities</div>
            <div v-if="rightUnit && rightUnit.selection && rightUnit.selection.unit && rightUnit.selection.unit.num_men > 1">
              <div class="text-caption q-mb-xs">
                Active entities: {{ rightUnit.entityCount }}
              </div>
              <q-slider
                v-model="rightEntityCount"
                :min="1"
                :max="rightUnit.selection.unit.num_men"
                :step="1"
                label
                label-always
                color="negative"
                @update:model-value="updateRightEntityCount"
              />
            </div>
            <div v-else class="text-caption">
              No unit selected or unit has only 1 entity
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UnitWithEntityCount } from '~/types/unit'
import { useUnitStore } from '~/stores/unitStore'

const unitStore = useUnitStore()

// Get units from store
const leftUnit = computed(() => unitStore.leftUnit)
const rightUnit = computed(() => unitStore.rightUnit)

// Two-way binding for left entity count
const leftEntityCount = computed({
  get: () => leftUnit.value?.entityCount || 1,
  set: (value: number) => {
    if (leftUnit.value) {
      unitStore.setLeftUnitEntityCount(value)
    }
  }
})

// Two-way binding for right entity count
const rightEntityCount = computed({
  get: () => rightUnit.value?.entityCount || 1,
  set: (value: number) => {
    if (rightUnit.value) {
      unitStore.setRightUnitEntityCount(value)
    }
  }
})

// Functions to update entity counts
const updateLeftEntityCount = (value: number | null) => {
  if (value !== null) {
    leftEntityCount.value = value;
  }
}

const updateRightEntityCount = (value: number | null) => {
  if (value !== null) {
    rightEntityCount.value = value;
  }
}
</script>

<style scoped>
.q-card {
  min-height: 120px;
}
</style> 