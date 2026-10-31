<template>
    <q-markup-table :class="{ mobile: isMobile }" separator="none" flat bordered v-if="leftUnit?.selection?.unit && rightUnit?.selection?.unit">
        <thead>
            <tr>
                <th scope="col" class="text-right unit-column"><b>{{ leftUnitName }}</b>
                </th>
                <th v-if="!isMobile" scope="col" class="annex-column"></th>
                <th scope="col" class="text-center stat-column"><b>Statistic</b></th>
                <th v-if="!isMobile" scope="col" class="annex-column"></th>
                <th scope="col" class="text-left unit-column"><b>{{ rightUnitName }}</b>
                </th>
            </tr>
            <tr>
                <th scope="col" class="unit-column"><q-btn :label="isMobile ? undefined : 'Reset'" :round="isMobile" :dense="isMobile" color="warning" icon="refresh" aria-label="Reset" title="Reset" @click="onReset('left')" />
                </th>
                <th v-if="!isMobile" scope="col" class="annex-column"></th>
                <th scope="col" class="stat-column"></th>
                <th v-if="!isMobile" scope="col" class="annex-column"></th>
                <th scope="col" class="unit-column"><q-btn :label="isMobile ? undefined : 'Reset'" :round="isMobile" :dense="isMobile" color="warning" icon="refresh" aria-label="Reset" title="Reset" @click="onReset('right')" />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="unit-column">
                    <EffectList side="left" placement="effects" :max="isMobile ? undefined : 5" with-add @add="openPicker('left')" />
                </td>
                <td v-if="!isMobile" class="annex-column"></td>
                <td class="text-center stat-column">Effects</td>
                <td v-if="!isMobile" class="annex-column"></td>
                <td class="unit-column">
                    <EffectList side="right" placement="effects" :max="isMobile ? undefined : 5" with-add @add="openPicker('right')" />
                </td>
            </tr>
            <tr v-for="statistic in statistics" :key="statistic.path">
                <td class="unit-column" v-if="baseLeft">
                    <div class="stat-cell">
                        <EffectList v-if="isMobile && statistic.path === 'attack'" class="stat-cell-effects" side="left" placement="attack" />
                        <ValueDisplay ref="leftUnitRef"
                            :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(baseLeft as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as (number | boolean)"
                            :bonus="leftUnit.bonus[statistic.path as UnitBonusPathes]"
                            :effective="effectiveValue(effectiveLeft, statistic.path)"
                            :isUpdatable="UnitBonusPathes.includes(statistic.path as UnitBonusPathes)"
                            @update="onUpdate('left', statistic.path as UnitBonusPathes, $event)" orientation="left" :unitName="leftUnitName" :statLabel="statistic.label" />
                    </div>
                </td>
                <td v-if="!isMobile" class="annex-column annex-left">
                    <div v-if="baseLeft" class="annex-cell">
                        <EffectList v-if="statistic.path === 'attack'" side="left" placement="attack" :max="2" />
                        <EffectDeltaBadge :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(baseLeft as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as (number | boolean)"
                            :bonus="leftUnit.bonus[statistic.path as UnitBonusPathes]" :effective="effectiveValue(effectiveLeft, statistic.path)" />
                    </div>
                </td>
                <td class="text-center stat-column">{{ statistic.label }}</td>
                <td v-if="!isMobile" class="annex-column annex-right">
                    <div v-if="baseRight" class="annex-cell">
                        <EffectList v-if="statistic.path === 'attack'" side="right" placement="attack" :max="2" />
                        <EffectDeltaBadge :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(baseRight as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as (number | boolean)"
                            :bonus="rightUnit.bonus[statistic.path as UnitBonusPathes]" :effective="effectiveValue(effectiveRight, statistic.path)" />
                    </div>
                </td>
                <td class="unit-column" v-if="baseRight">
                    <div class="stat-cell">
                        <EffectList v-if="isMobile && statistic.path === 'attack'" class="stat-cell-effects" side="right" placement="attack" />
                        <ValueDisplay ref="rightUnitRef"
                            :value="getTyped<Required<Unit>, Paths<Required<Unit>>>(baseRight as Required<Unit>, (statistic.path) as Paths<Required<Unit>>) as (number | boolean)"
                            :bonus="rightUnit.bonus[statistic.path as UnitBonusPathes]"
                            :effective="effectiveValue(effectiveRight, statistic.path)"
                            :isUpdatable="UnitBonusPathes.includes(statistic.path as UnitBonusPathes)"
                            @update="onUpdate('right', statistic.path as UnitBonusPathes, $event)" orientation="right" :unitName="rightUnitName" :statLabel="statistic.label" />
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
import EffectDeltaBadge from './EffectDeltaBadge.vue'
import EffectPickerDialog from './EffectPickerDialog.vue'
import { useUnitStore } from '~/stores/unitStore'
import { baseUnit, fullyEffectiveUnit } from '~/types/unit'
import { clampNonNegative } from '@tww3-brawl/sdk/src/logic/clampStat'

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

// Le bonus manuel passe avant les effets : le champ édite donc la valeur de base (+ bonus),
// et la valeur après toutes les couches est affichée en lecture seule à côté
const baseLeft = computed(() => baseUnit(props.leftUnit))
const baseRight = computed(() => baseUnit(props.rightUnit))
const effectiveLeft = computed(() => fullyEffectiveUnit(props.leftUnit, props.rightUnit))
const effectiveRight = computed(() => fullyEffectiveUnit(props.rightUnit, props.leftUnit))

/** Valeur effective d'une stat, bornée à 0 sauf les résistances (même règle que les calculs de combat) */
function effectiveValue(unit: Unit | undefined, path: Paths<Required<Unit>>): number | undefined {
    if (!unit) return undefined
    const value = getTyped<Required<Unit>, Paths<Required<Unit>>>(unit as Required<Unit>, path)
    if (typeof value !== 'number') return undefined
    return path.startsWith('resistance.') ? value : clampNonNegative(value)
}

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
/* Desktop : colonnes fixes (pas de scroll horizontal quels que soient les effets),
   les deux colonnes d'unités se partagent l'espace restant à parts égales */
:not(.mobile):deep(table) {
    table-layout: fixed;
}

td.stat-column,
th.stat-column {
    padding: 0 4px;
    width: 140px;
    white-space: normal;
}

.stat-cell {
    display: flex;
    flex-wrap: nowrap;
    min-width: 0;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
}

.stat-cell > * {
    min-width: 0;
}

/* Colonnes annexes (côté centre) : icônes d'effets d'attaque et pastille du delta des effets */
td.annex-column,
th.annex-column {
    width: 72px;
    padding: 0 2px;
}

.annex-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.annex-left .annex-cell {
    align-items: flex-start;
}

.annex-right .annex-cell {
    align-items: flex-end;
}

/* Contenu collé à la valeur qu'il modifie (colonne de gauche : à gauche, colonne de droite : à droite) */
.annex-left .annex-cell :deep(.effect-list) {
    justify-content: flex-start;
}

.annex-right .annex-cell :deep(.effect-list) {
    justify-content: flex-end;
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

    /* Icônes d'effets d'attaque : toujours sur leur propre ligne, au-dessus de la valeur */
    .stat-cell-effects {
        flex-basis: 100%;
        justify-content: center;
    }

    .stat-column {
        width: 40%;
        padding: 4px;
    }
}
</style>