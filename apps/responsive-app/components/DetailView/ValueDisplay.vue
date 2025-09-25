<template>
    <div class="container" :class="{ 'reverse': orientation === 'right' }">
        <div class="value">{{ value }}</div>
        <div v-if="bonus" class="bonus">{{ bonus }}</div>
        <ModifierDisplay v-if="isUpdatable" @modify="onModify" @reset="onReset" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ModifierDisplay from './ModifierDisplay.vue';

const emit = defineEmits<{
    update: [value: number]
}>()


function onModify(value: number) {
    bonus.value += value
    console.log('onModify', bonus.value)
    emit('update', bonus.value)
}

function onReset() {
    bonus.value = 0
    console.log('onReset', bonus.value)
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
</style>