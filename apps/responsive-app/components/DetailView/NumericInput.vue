<template>
    <q-input v-bind:model-value="totalValue" standout="custom-behavior" borderless :placeholder="baseValue" type="number" debounce="500" @update:model-value="updateTotalValue" />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    baseValue: number
    modifier: number
}>(), {
    baseValue: 0,
    modifier: 0
})

const totalValue = computed(() => props.baseValue + props.modifier)

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
}>()

function updateTotalValue(value: string | number | null) {
    const num = typeof value === 'string' ? Number(value) : (value ?? 0)
    const modifier = num - props.baseValue
    emit('update:modelValue', modifier)
}

</script>

<style lang="scss">
.custom-behavior {
    background-color: green;
}
</style>