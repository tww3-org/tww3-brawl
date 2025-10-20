<template>
    <q-markup-table separator="none" flat bordered v-if="leftUnit?.selection?.unit && rightUnit?.selection?.unit">
        <thead>
            <tr>
                <th scope="col" class="text-right unit-column"><b>{{ leftUnit?.selection?.unit?.land_unit?.onscreen_name
                }}</b>
                </th>
                <th scope="col" class="text-center stat-column"><b>Statistic</b></th>
                <th scope="col" class="text-left unit-column"><b>{{ rightUnit?.selection?.unit?.land_unit?.onscreen_name
                }}</b>
                </th>
            </tr>
            <tr>
                <th scope="col" class="unit-column"><q-btn label="Reset" color="warning" icon="refresh" @click="onReset('left')" />
                </th>
                <th scope="col" class="stat-column"></th>
                <th scope="col" class="unit-column"><q-btn label="Reset" color="warning" icon="refresh" @click="onReset('right')" />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="statistic in statistics" :key="statistic.path">
                <td class="unit-column" v-if="leftUnit?.selection?.unit">
                    <ValueDisplay ref="leftUnitRef"
                        :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(leftUnit.selection.unit as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as number | boolean"
                        :bonus="leftUnit.bonus[statistic.path as UnitBonusPathes]"
                        :isUpdatable="UnitBonusPathes.includes(statistic.path as UnitBonusPathes)"
                        @update="onUpdate('left', statistic.path as UnitBonusPathes, $event)" orientation="left" />

                </td>
                <td class="text-center stat-column">{{ statistic.label }}</td>
                <td class="unit-column" v-if="rightUnit?.selection?.unit">
                    <ValueDisplay ref="rightUnitRef"
                        :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(rightUnit.selection.unit as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as number | boolean"
                        :bonus="rightUnit.bonus[statistic.path as UnitBonusPathes]"
                        :isUpdatable="UnitBonusPathes.includes(statistic.path as UnitBonusPathes)"
                        @update="onUpdate('right', statistic.path as UnitBonusPathes, $event)" orientation="right" />
                </td>

            </tr>
        </tbody>
    </q-markup-table>
</template>

<script setup lang="ts">
import type { Unit } from '@tww3-brawl/sdk/src/types';
import { type Paths, getTyped } from '~/shared/jsonpath';
import type { UnitWithEntityNumberAndBonus } from '~/types/unit'
import { UnitBonusPathes, defaultUnitBonus } from '~/types/unit'
import { statistics } from '~/types/unit'
import ValueDisplay from './ValueDisplay.vue'

const props = defineProps<{
    leftUnit: UnitWithEntityNumberAndBonus | null
    rightUnit: UnitWithEntityNumberAndBonus | null
}>()

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
    for (const path of UnitBonusPathes) {
        emit('update', unit_side, path, 0)
    }
    if (unit_side === 'left') {
        if (props.leftUnit) {
            props.leftUnit.bonus = defaultUnitBonus()
        }
    } else {
        if (props.rightUnit) {
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
</style>