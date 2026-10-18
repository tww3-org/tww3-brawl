<template>
    <q-markup-table :class="{ mobile: isMobile }" separator="none" flat bordered v-if="leftUnit?.selection?.unit && rightUnit?.selection?.unit">
        <thead>
            <tr>
                <th scope="col" class="text-right unit-column"><b>{{ leftUnitName }}</b>
                </th>
                <th scope="col" class="text-center stat-column"><b>Statistic</b></th>
                <th scope="col" class="text-left unit-column"><b>{{ rightUnitName }}</b>
                </th>
            </tr>
            <tr>
                <th scope="col" class="unit-column"><q-btn :label="isMobile ? undefined : 'Reset'" :round="isMobile" :dense="isMobile" color="warning" icon="refresh" aria-label="Reset" title="Reset" @click="onReset('left')" />
                </th>
                <th scope="col" class="stat-column"></th>
                <th scope="col" class="unit-column"><q-btn :label="isMobile ? undefined : 'Reset'" :round="isMobile" :dense="isMobile" color="warning" icon="refresh" aria-label="Reset" title="Reset" @click="onReset('right')" />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="unit-column">
                    <EffectList side="left" placement="effects" with-add @add="openPicker('left')" />
                </td>
                <td class="text-center stat-column">Effects</td>
                <td class="unit-column">
                    <EffectList side="right" placement="effects" with-add @add="openPicker('right')" />
                </td>
            </tr>
            <tr v-for="statistic in statistics" :key="statistic.path">
                <td class="unit-column" v-if="effectiveLeft">
                    <div class="stat-cell">
                        <EffectList v-if="statistic.path === 'attack'" side="left" placement="attack" />
                        <ValueDisplay ref="leftUnitRef"
                            :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(effectiveLeft as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as (number | boolean)"
                            :bonus="leftUnit.bonus[statistic.path as UnitBonusPathes]"
                            :isUpdatable="UnitBonusPathes.includes(statistic.path as UnitBonusPathes)"
                            @update="onUpdate('left', statistic.path as UnitBonusPathes, $event)" orientation="left" :unitName="leftUnitName" :statLabel="statistic.label" />
                    </div>
                </td>
                <td class="text-center stat-column">{{ statistic.label }}</td>
                <td class="unit-column" v-if="effectiveRight">
                    <div class="stat-cell">
                        <ValueDisplay ref="rightUnitRef"
                            :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(effectiveRight as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as (number | boolean)"
                            :bonus="rightUnit.bonus[statistic.path as UnitBonusPathes]"
                            :isUpdatable="UnitBonusPathes.includes(statistic.path as UnitBonusPathes)"
                            @update="onUpdate('right', statistic.path as UnitBonusPathes, $event)" orientation="right" :unitName="rightUnitName" :statLabel="statistic.label" />
                        <EffectList v-if="statistic.path === 'attack'" side="right" placement="attack" />
                    </div>
                </td>

            </tr>
        </tbody>
    </q-markup-table>
    <EffectPickerDialog v-model="pickerOpen" :version-id="pickerVersionId" @select="onPick" />
</template>

<script setup lang="ts">
import type { Unit } from '@tww3-brawl/sdk/src/types';
import { getUnitDisplayName } from '@tww3-brawl/sdk/src/utils/getUnitDisplayName';
import { type Paths, getTyped } from '~/shared/jsonpath';
import type { UnitWithEntityNumberAndBonus } from '~/types/unit'
import { UnitBonusPathes, defaultUnitBonus } from '~/types/unit'
import { statistics } from '~/types/unit'
import { useQuasar } from 'quasar'
import ValueDisplay from './ValueDisplay.vue'
import EffectList from './EffectList.vue'
import EffectPickerDialog from './EffectPickerDialog.vue'
import { useUnitStore } from '~/stores/unitStore'
import { unitWithEffects } from '~/types/unit'

const $q = useQuasar()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const isMobile = computed(() => mounted.value && $q.screen.lt.md)

const props = defineProps<{
    leftUnit: UnitWithEntityNumberAndBonus | null
    rightUnit: UnitWithEntityNumberAndBonus | null
}>()

// Header names are pinned to the selection's captured displayName (set at
// the moment of the original hero/unit pick) so they stay stable across
// later mount swaps, falling back to getUnitDisplayName for units without a
// pinned name yet (e.g. loaded via URL deep link) — see spec.md FR-008.
const leftUnitName = computed(() => props.leftUnit?.selection?.displayName
    || (props.leftUnit?.selection?.unit ? getUnitDisplayName(props.leftUnit.selection.unit) : ''))
const rightUnitName = computed(() => props.rightUnit?.selection?.displayName
    || (props.rightUnit?.selection?.unit ? getUnitDisplayName(props.rightUnit.selection.unit) : ''))

const unitStore = useUnitStore()

// Valeurs affichées : unité après effets (le bonus manuel reste édité à part dans ValueDisplay)
const effectiveLeft = computed(() => unitWithEffects(props.leftUnit, props.rightUnit))
const effectiveRight = computed(() => unitWithEffects(props.rightUnit, props.leftUnit))

// Sélecteur d'effets (bouton « + »)
const pickerOpen = ref(false)
const pickerSide = ref<'left' | 'right'>('left')
const pickerVersionId = computed(() => (pickerSide.value === 'left' ? props.leftUnit : props.rightUnit)?.selection?.version?.id ?? '')
function openPicker(side: 'left' | 'right') {
    pickerSide.value = side
    pickerOpen.value = true
}
function onPick(id: string) {
    unitStore.addEffect(pickerSide.value, id)
}

const emit = defineEmits<{
    update: [unit_side: 'left' | 'right', path: UnitBonusPathes, value: number]
}>()

function onUpdate(unit_side: 'left' | 'right', path: UnitBonusPathes, value: number) {
    emit('update', unit_side, path, value)
}

const rightUnitRef: Ref<Array<InstanceType<typeof ValueDisplay>>> = ref([])
const leftUnitRef: Ref<Array<InstanceType<typeof ValueDisplay>>> = ref([])


function onReset(unit_side: 'left' | 'right') {
    reset(unit_side)
    unitStore.resetEffects(unit_side)
    for (const path of UnitBonusPathes) {
        emit('update', unit_side, path, 0)
    }
    if (unit_side === 'left') {
        if (props.leftUnit) {
            // eslint-disable-next-line vue/no-mutating-props -- store-backed object, reset in place
            props.leftUnit.bonus = defaultUnitBonus()
        }
    } else {
        if (props.rightUnit) {
            // eslint-disable-next-line vue/no-mutating-props -- store-backed object, reset in place
            props.rightUnit.bonus = defaultUnitBonus()
        }
    }
}
function reset(unit_side: 'left' | 'right') {
    if (unit_side === 'left') {
        leftUnitRef.value.forEach((instance) => instance?.reset())
    } else {
        rightUnitRef.value.forEach((instance) => instance?.reset())
    }
}

defineExpose({
    reset
})
</script>

<style scoped lang="scss">
thead {
    @include text-emphasized;

    th {
        font-size: var(--font-size-md);
    }
}

tbody {
    td {
        font-size: var(--font-size-sm);
    }
}

/* Contrôle de la largeur des colonnes */
.unit-column {
    width: 50%;
}


.stat-column {
    padding: 0px;
    width: 100px;
}

.stat-cell {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
}

/* Colonne de droite : valeur collée au centre, icônes à sa droite */
.unit-column:last-child .stat-cell {
    justify-content: flex-start;
}

/* Mobile : le tableau doit tenir sans scroll horizontal */
.mobile {
    th,
    td {
        padding: 4px;
        white-space: normal;
        overflow-wrap: anywhere;
    }

    th {
        font-size: var(--font-size-sm);
    }

    .unit-column {
        width: 30%;
        text-align: center;
    }

    .stat-cell {
        flex-wrap: wrap;
        justify-content: center;
    }

    .unit-column:last-child .stat-cell {
        justify-content: center;
    }

    .stat-column {
        width: 40%;
        padding: 4px;
    }
}
</style>