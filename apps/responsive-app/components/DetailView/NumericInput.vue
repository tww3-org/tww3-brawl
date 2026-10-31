<template>
    <q-input v-bind:model-value="shownValue" dense standout="custom-behavior" :placeholder="baseValue" type="number"
        debounce="500" @update:model-value="updateTotalValue" @focus="onFocus" @blur="focused = false">
        <template #append>
            <q-badge floating v-if="modifier !== 0" :color="modifier > 0 ? 'green' : 'red'">{{ modifier }}</q-badge>
        </template>
        <template v-if="direction === 'right'" #after>
            <span v-if="$slots.effects" class="effects-slot"><slot name="effects" /></span>
            <ModifierDisplay @modify="onModify" @reset="onReset" />
        </template>
        <template v-if="direction === 'left'" #before>
            <ModifierDisplay @modify="onModify" @reset="onReset" />
            <span v-if="$slots.effects" class="effects-slot"><slot name="effects" /></span>
        </template>
    </q-input>
</template>

<script setup lang="ts">
import ModifierDisplay from './ModifierDisplay.vue';
import { applyModifierStep } from './modifierStep';
import { roundForDisplay } from './formatNumber';
const props = withDefaults(defineProps<{
    baseValue?: number
    modifier?: number
    /** Valeur finale (effets compris) : affichée quand l'input n'a pas le focus */
    effective?: number
    direction?: 'left' | 'right'
}>(), {
    baseValue: 0,
    modifier: 0,
    direction: 'left'
})

const totalValue = computed(() => roundForDisplay(props.baseValue + props.modifier))
const focused = ref(false)
// Hors focus : valeur finale ; au focus : valeur éditable (avant effets) pour saisir le bonus manuel
const shownValue = computed(() =>
    !focused.value && props.effective !== undefined && Number.isFinite(props.effective)
        ? roundForDisplay(props.effective)
        : totalValue.value)
const bonus = ref(props.modifier)
watch(() => props.modifier, (v) => { bonus.value = v })
const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
}>()

function updateTotalValue(value: string | number | null) {
    const num = typeof value === 'string' ? Number(value) : (value ?? 0)
    bonus.value = num - props.baseValue
    
    emit('update:modelValue', bonus.value)
    
    // remove focus from the active input after updating the model
    requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur())
}

function onModify(value: number) {
    bonus.value = applyModifierStep(bonus.value, value, props.baseValue)
    emit('update:modelValue', bonus.value)
}

function onReset() {
    reset()
    emit('update:modelValue', bonus.value)
}

function onFocus(e: Event) {
    focused.value = true
    const target = e.target as HTMLInputElement | null
    // next frame ensures DOM is ready and focus applied before selecting
    requestAnimationFrame(() => target?.select())
}

function reset() {
    bonus.value = 0
}

defineExpose({
    reset
})
</script>

<style scoped lang="scss">
.q-field {
    font-size: var(--font-size-sm);
}

/* Icônes d'effets entre les boutons +/- et le champ, sur une seule ligne */
.effects-slot {
    display: flex;
    flex: none;
    align-items: center;
    margin: 0 4px;

    :deep(.effect-list) {
        flex-wrap: nowrap;
        flex: none;
    }
}
</style>

<style lang="scss">
.q-input {
input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
    }
    input[type=number] {
        -moz-appearance: textfield;
        appearance: none;
      }
    input {
        &:hover {
            cursor: pointer;
        }

        &:focus {
            cursor: text;
        }
    }
}
.custom-behavior {
    transform: scale(2);
    z-index: 1;
}
</style>