<template>
  <q-card class="unit-card">
    <q-card-section>
      <q-img :src="unitImageUrl" :ratio="16 / 9" fit="contain" class="unit-image" alt="Unit Portrait" />
      <div class="unit-label text-xl"><a v-if="twwStatUrl" :href="twwStatUrl" target="_blank">{{ unitTitle }}</a>
      </div>
    </q-card-section>


    <q-card-section :class="orientation" class="card-section">
      <div class="q-mt-md row justify-between">
        <SelectUnit :unitSelection="unitSelection" :version="version"
          @update:unitSelection="(value) => updateUnitSelection(value)" @update:version="(value) => version = value" />
        <MountPicker v-if="unitSelection?.unit?.battle_mounts?.length && unitSelection?.unit?.battle_mounts?.length > 0"
          :unit="unitSelection.unit" @update:unit="(value) => updateUnit(value)" />
      </div>

    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getUnitPortrait } from '@tww3-brawl/sdk/src/utils/getUnitPortrait'
import { type UnitSelection, type UnitWithEntityNumberAndBonus, defaultUnitBonus } from '~/types/unit'
import SelectUnit from './SelectUnit.vue'
import MountPicker from './MountPicker.vue'
import type { Unit, Version } from '@tww3-brawl/sdk/src/types'
import { getTwwStatUrl } from '@tww3-brawl/sdk/src/utils/getTwwStat'
import { useUnitStore } from '~/stores/unitStore'

const unitStore = useUnitStore()
const unitSelection = computed(() => props.modelValue?.selection || null)
const version = ref<string | null>(null)

interface Props {
  orientation?: 'left' | 'right'
  modelValue?: UnitWithEntityNumberAndBonus | null
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'left'
})

const emit = defineEmits<{
  'update:modelValue': [{unitWithEntityNumberAndBonus: UnitWithEntityNumberAndBonus | null, mount_changed: boolean}]
}>()


function updateUnit(value: Unit) {
  const maxEntityCount = value.num_men || 1;
  const defaultEntityCount = Math.min(15, maxEntityCount);
  if (props.modelValue) {
    props.modelValue.selection.unit = value;

    emit('update:modelValue', {unitWithEntityNumberAndBonus: {
      selection: props.modelValue.selection,
      entityNumber: defaultEntityCount,
      bonus: props.modelValue.bonus
    }, mount_changed: true})
  }
}

function updateUnitSelection(value: UnitSelection) {
  const maxEntityCount = value.unit?.num_men || 1;
  const defaultEntityCount = Math.min(15, maxEntityCount);

  emit('update:modelValue', { unitWithEntityNumberAndBonus: {
    selection: value,
    entityNumber: defaultEntityCount,
    bonus: defaultUnitBonus()
  }, mount_changed: false})

}
// Computed for unit title
const unitTitle = computed(() => {
  if (unitSelection.value?.unit?.land_unit?.onscreen_name) {
    return unitSelection.value.unit.land_unit.onscreen_name;
  }
  return 'Unit Title';
});

// Computed for unit image
const unitImageUrl = computed(() => {
  if (unitSelection.value?.unit && unitSelection.value?.version?.id) {

    const portrait = getUnitPortrait(unitSelection.value.version.id, unitSelection.value.unit)
    if (portrait) {
      return portrait
    }
  }
  return '/default-unit-image.jpg'
})

const twwStatUrl = computed(() => {
  let unitAndVersion: {unit: Unit, version: Version}[] = [];
  if (unitSelection.value?.unit && unitSelection.value?.version?.id) {
    unitAndVersion.push({unit: unitSelection.value.unit, version: unitSelection.value.version})
  }
  if (props.orientation === 'left' && unitStore.rightUnit?.selection?.unit && unitStore.rightUnit?.selection?.version?.id) {
    unitAndVersion.push({unit: unitStore.rightUnit.selection.unit, version: unitStore.rightUnit.selection.version})
  }
  if (props.orientation === 'right' && unitStore.leftUnit?.selection?.unit && unitStore.leftUnit?.selection?.version?.id) {
    unitAndVersion.push({unit: unitStore.leftUnit.selection.unit, version: unitStore.leftUnit.selection.version})
  }
  return getTwwStatUrl(unitAndVersion)
})
</script>

<style scoped lang="scss">
.unit-label {
  @include text-emphasized;
  height: calc(var(--font-size-base) * 4);
  display: -webkit-box;
  -webkit-line-clamp: 2;   /* limite à 2 lignes */
  line-clamp: 2;           /* propriété standard */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.unit-card {
  display: flex;
  flex-direction: column;
}

.unit-image {
  width: 100%;
  height: auto;
  flex: 1;
}

.card-section {
  margin-top: auto;
  flex: row;
}

.right {
  text-align: right;
}

.left {
  text-align: left;
}
</style>