<template>
        <q-input v-bind:model-value="totalValue" standout="custom-behavior" borderless :placeholder="baseValue"
            type="number" debounce="500" @update:model-value="updateTotalValue" class="base-class cursor-pointer" />
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

<style scoped lang="scss">
.base-class{
    &:hover {
        cursor: pointer !important;
    }
}

</style>

<style lang="scss">
.custom-behavior {
    background-color: green;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease;

    transform: scale(2);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);

}
</style>