<template>
    <q-markup-table separator="none" flat bordered dense>
        <thead>
            <tr>
                <th class="text-right unit-column">{{ leftUnit?.selection?.unit?.land_unit?.onscreen_name }}</th>
                <th class="text-center stat-column">Statistic</th>
                <th class="text-left unit-column">{{ rightUnit?.selection?.unit?.land_unit?.onscreen_name }}</th>
            </tr>
        </thead>
        <tbody>

            <tr v-for="statistic in statistics" :key="statistic.path">
                <td class="unit-column" v-if="leftUnit?.selection?.unit">
                    <ValueDisplay
                        :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(leftUnit.selection.unit as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as number | boolean"
                        orientation="left" />

                </td>
                <td class="text-center stat-column">{{ statistic.label }}</td>
                <td class="unit-column" v-if="rightUnit?.selection?.unit">
                    <ValueDisplay
                        :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(rightUnit.selection.unit as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as number | boolean"
                        orientation="right" />
                </td>

            </tr>
        </tbody>
    </q-markup-table>
</template>

<script setup lang="ts">
import type { Unit } from '@tww3-brawl/sdk/src/types';
import { type Paths, getTyped } from '~/shared/jsonpath';
import type { UnitWithEntityNumberAndBonus } from '~/types/unit'
import { statistics } from '~/types/unit'
import ValueDisplay from './ValueDisplay.vue'


const v1 = computed(() => {
    if (props.rightUnit && props.rightUnit.selection && props.rightUnit.selection.unit ) {

        return getTyped<Required<Unit>, Paths<Required<Unit>>>((props.rightUnit.selection.unit as Required<Unit>), statistics[0].path)
    }
    return undefined
})
const props = defineProps<{
    leftUnit: UnitWithEntityNumberAndBonus | null
    rightUnit: UnitWithEntityNumberAndBonus | null
}>()


</script>

<style scoped>
/* Contrôle de la largeur des colonnes */
.unit-column {
    width: 50%;
    /* Colonnes des unités prennent 35% chacune */
}

.stat-column {
    width: 100px;
    /* Colonne des statistiques prend 30% */
}
</style>