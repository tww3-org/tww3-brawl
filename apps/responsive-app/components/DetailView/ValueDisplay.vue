<template>
    <div v-if="isMobile" class="mobile-value" :class="{ 'outward-left': orientation === 'left' }">
        <span v-if="canEdit" class="editable" role="button" tabindex="0" @click="dialogOpen = true"
            @keydown.enter.prevent="dialogOpen = true" @keydown.space.prevent="dialogOpen = true">{{ displayed }}</span>
        <template v-else>{{ displayed }}</template>
        <q-badge v-if="bonus !== 0" class="bonus-badge" :color="bonus > 0 ? 'green' : 'red'">{{ signed(bonus) }}</q-badge>
        <q-badge v-if="effectiveDelta" class="effect-badge" color="deep-purple" title="Modificateur des effets">
            <q-icon name="auto_awesome" size="0.9em" class="effect-badge-icon" />{{ signed(effectiveDelta) }}
        </q-badge>
        <ModifierDialog v-if="canEdit" v-model="dialogOpen" :title="dialogTitle" :base-value="value as number"
            :bonus="bonus" @update="onUpdate" />
    </div>
    <div v-else class="container" :class="{ 'reverse': orientation === 'right' }">
        <div class="left base" :class="{ 'right': orientation === 'right' }">
            <NumericInput ref="numericInputRef" v-if="typeof value === 'number' && isUpdatable" :modifier="bonus" :baseValue="value" :effective="effective" @update:model-value="onUpdate" :direction="orientation">
                <template v-if="$slots.effects" #effects><slot name="effects" /></template>
            </NumericInput>
            <div v-else class="plain-value" :class="{ 'reverse': orientation === 'right' }">
                <span v-if="$slots.effects" class="plain-effects"><slot name="effects" /></span>
                <span>{{ displayed }}</span>
            </div>
            <q-badge v-if="effectiveDelta" class="effect-badge" :class="`effect-badge-${orientation}`" color="deep-purple" title="Modificateur des effets">
                <q-icon name="auto_awesome" size="0.9em" class="effect-badge-icon" />{{ signed(effectiveDelta) }}
            </q-badge>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import NumericInput from './NumericInput.vue';
import ModifierDialog from './ModifierDialog.vue';
import { roundForDisplay } from './formatNumber';

const emit = defineEmits<{
    update: [value: number]
}>()

function onUpdate(value: number) {
    bonus.value = value
    emit('update', bonus.value)
}

const props = withDefaults(defineProps<{
    value: number | boolean
    isUpdatable: boolean
    bonus?: number
    /** Valeur après toutes les couches (effets compris), affichée comme valeur principale ; l'écart avec `value + bonus` est montré par une pastille */
    effective?: number
    unitName?: string
    statLabel?: string
    orientation: 'left' | 'right'
}>(), {
    bonus: 0
})

const bonus = ref<number>(props.bonus)
watch(() => props.bonus, (value) => { bonus.value = value })

// Mode mobile : valeur en texte + modale d'édition (flag mounted pour éviter un mismatch d'hydratation)
const $q = useQuasar()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const isMobile = computed(() => mounted.value && $q.screen.lt.md)
const dialogOpen = ref(false)
const canEdit = computed(() => typeof props.value === 'number' && props.isUpdatable)
// Valeur finale affichée : effective si définie, sinon valeur de base + bonus manuel
const displayed = computed(() => {
    if (typeof props.value !== 'number') return props.value
    return roundForDisplay(props.effective !== undefined && Number.isFinite(props.effective) ? props.effective : props.value + bonus.value)
})
// Écart entre la valeur effective et la valeur éditée (0 : rien à afficher)
const effectiveDelta = computed(() => {
    if (typeof props.value !== 'number' || props.effective === undefined || !Number.isFinite(props.effective)) return 0
    return roundForDisplay(roundForDisplay(props.effective) - roundForDisplay(props.value + bonus.value))
})
// Formate un écart avec son signe explicite (+15, -4)
function signed(n: number): string {
    const r = roundForDisplay(n)
    return r > 0 ? `+${r}` : `${r}`
}
const dialogTitle = computed(() => [props.unitName, props.statLabel].filter(Boolean).join(' — '))
const numericInputRef = ref<InstanceType<typeof NumericInput> | null>(null)
function reset() {
    bonus.value = 0
    numericInputRef.value?.reset()
}

defineExpose({
    reset
})
</script>

<style scoped lang="scss">
.container {
    display: flex;
    flex-direction: row-reverse;
    flex: 0 1 auto;
    min-width: 0;
    gap: 0.5rem;
}

.container.reverse {
    flex-direction: row;
}

.left {
    text-align: right;
}

.right {
    text-align: left;
}

.bonus {
    width: 3ch;
}

.mobile-value {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
}

.mobile-value.outward-left {
    flex-direction: row-reverse;
}

.editable {
    cursor: pointer;
    text-decoration: underline dotted;
    text-underline-offset: 3px;
}

.base {
    position: relative;
    flex: 0 1 30ch;
    min-width: 0;
}

/* Le champ reste lisible (ex. 108.5) même quand la colonne est étroite */
.base :deep(.q-field__inner) {
    min-width: 6ch;
}

.plain-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
}

/* Colonne de droite : valeur collée au centre, icônes à sa droite */
.plain-value.reverse {
    flex-direction: row-reverse;
    justify-content: flex-end;
}

.plain-effects {
    display: flex;
    flex: none;

    :deep(.effect-list) {
        flex-wrap: nowrap;
        flex: none;
    }
}

/* Pastille du modificateur des effets : superposée au coin inférieur du champ, côté colonne centrale */
.base .effect-badge {
    position: absolute;
    bottom: -0.5em;
    white-space: nowrap;
    z-index: 2;
}

.base .effect-badge-left {
    right: 0;
}

.base .effect-badge-right {
    left: 0;
}

.effect-badge-icon {
    margin-right: 0.2em;
}
</style>
