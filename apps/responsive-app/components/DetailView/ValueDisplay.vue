<template>
    <div class="container" :class="{ 'reverse': orientation === 'right' }">
        <div class="value">{{ value }}</div>
        <div v-if="bonus" class="bonus">{{ bonus }}</div>
        <ModifierDisplay />
    </div>
</template>

<script setup lang="ts">
import type { UnitBonus, UnitBonusPathes, UnitSelection, UnitWithEntityNumberAndBonus } from '~/types/unit';
import ModifierDisplay from './ModifierDisplay.vue';

const props = defineProps<{
    value: number | boolean
    bonus?: number | boolean
    orientation: 'left' | 'right'
}>()
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