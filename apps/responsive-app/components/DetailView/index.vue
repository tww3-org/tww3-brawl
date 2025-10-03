<template>
    <q-markup-table separator="none" flat bordered>
        <thead>
            <tr>
                <th scope="col" class="text-right unit-column"><b>{{ leftUnit?.selection?.unit?.land_unit?.onscreen_name }}</b>
                </th>
                <th scope="col" class="text-center stat-column"><b>Statistic</b></th>
                <th scope="col" class="text-left unit-column"><b>{{ rightUnit?.selection?.unit?.land_unit?.onscreen_name }}</b>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="statistic in statistics" :key="statistic.path">
                <td class="unit-column" v-if="leftUnit?.selection?.unit">
                    <ValueDisplay
                        :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(leftUnit.selection.unit as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as number | boolean"
                        :bonus="leftUnit.bonus[statistic.path as UnitBonusPathes]"
                        :isUpdatable="UnitBonusPathes.includes(statistic.path as UnitBonusPathes)"
                        @update="onUpdate('left', statistic.path as UnitBonusPathes, $event)" orientation="left" />

                </td>
                <td class="text-center stat-column">{{ statistic.label }}</td>
                <td class="unit-column" v-if="rightUnit?.selection?.unit">
                    <ValueDisplay
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
import { UnitBonusPathes } from '~/types/unit'
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
</script>

<style scoped>
/* Contrôle de la largeur des colonnes */
.unit-column {
    width: 50%;
}


.stat-column {
    width: 100px;
    /* Colonne des statistiques prend 30% */
}
</style>