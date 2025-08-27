<template>
  <div class="col-6">
    <q-card>
      <q-card-section>

          <div class="text-caption q-mb-xs">
            Active entities: {{ entityNumber }}
          </div>
          <q-slider
            :model-value="entityNumber"
            @update:model-value="updateEntityNumber"
            :min="1"
            :max="maxEntities"
            :step="1"
            label
            label-always
          />


      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUnitStore } from '~/stores/unitStore'

interface Props {
  entityNumber: number
  maxEntities: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:entityNumber': [value: number]
}>()

const updateEntityNumber = (value: number | null) => {
  if (value !== null) {
    emit('update:entityNumber', value)
  }
}
</script>

<style scoped>
.q-card {
  min-height: 120px;
}
</style> 