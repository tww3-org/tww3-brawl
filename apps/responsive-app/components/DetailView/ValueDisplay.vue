<template>
    <div class="container" :class="{ 'reverse': orientation === 'right' }">
        <div class="left base" :class="{ 'right': orientation === 'right' }">
            <NumericInput v-if="typeof value === 'number' && isUpdatable" :modifier="bonus" :baseValue="value" @update:model-value="onUpdate" :direction="orientation" />
            <template v-else>{{ value }}</template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NumericInput from './NumericInput.vue';

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
    orientation: 'left' | 'right'
}>(), {
    bonus: 0
})

const bonus = ref<number>(props.bonus)

function reset() {
    bonus.value = 0
}

defineExpose({
    reset
})
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: row-reverse;
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

.base {
    width: 30ch;
}
</style>