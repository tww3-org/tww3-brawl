<template>
    <q-input v-bind:model-value="totalValue" dense standout="custom-behavior" :placeholder="baseValue" type="number"
        debounce="500" @update:model-value="updateTotalValue" @focus="onFocusSelectAll">
        <template #append>
            <q-badge floating v-if="modifier !== 0" :color="modifier > 0 ? 'green' : 'red'">{{ modifier }}</q-badge>
        </template>
        <template v-if="direction === 'right'" #after>
            <ModifierDisplay @modify="onModify" @reset="onReset" />
        </template>
        <template v-if="direction === 'left'" #before>
            <ModifierDisplay @modify="onModify" @reset="onReset" />
        </template>
    </q-input>
</template>

<script setup lang="ts">
import ModifierDisplay from './ModifierDisplay.vue';
const props = withDefaults(defineProps<{
    baseValue: number
    modifier: number
    direction: 'left' | 'right'
}>(), {
    baseValue: 0,
    modifier: 0,
    direction: 'left'
})

const totalValue = computed(() => props.baseValue + props.modifier)
const bonus = ref(props.modifier)
const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
}>()

function updateTotalValue(value: string | number | null) {
    const num = typeof value === 'string' ? Number(value) : (value ?? 0)
    bonus.value = num - props.baseValue
    emit('update:modelValue', bonus.value)
}

function onModify(value: number) {
    if (value > 0) {
        bonus.value += Math.round(Math.max(value, value * props.baseValue / 100))
    } else {
        bonus.value += Math.round(Math.min(value, value * props.baseValue / 100))
    }
    emit('update:modelValue', bonus.value)
}

function onReset() {
    bonus.value = 0
    emit('update:modelValue', bonus.value)
}

function onFocusSelectAll(e: Event) {
    const target = e.target as HTMLInputElement | null
    // next frame ensures DOM is ready and focus applied before selecting
    requestAnimationFrame(() => target?.select())
}
</script>

<style scoped lang="scss">
.q-field {
    font-size: var(--font-size-sm);
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