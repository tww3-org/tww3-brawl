<template>
    <q-badge v-if="delta" class="effect-badge" color="deep-purple" title="Modificateur des effets">
        <q-icon name="auto_awesome" size="0.9em" class="effect-badge-icon" />{{ signed(delta) }}
    </q-badge>
</template>

<script setup lang="ts">
import { roundForDisplay } from './formatNumber'

const props = defineProps<{
    value: number | boolean
    bonus?: number
    /** Valeur après toutes les couches (effets compris) */
    effective?: number
}>()

// Écart entre la valeur effective et la valeur éditée (0 : rien à afficher)
const delta = computed(() => {
    if (typeof props.value !== 'number' || props.effective === undefined || !Number.isFinite(props.effective)) return 0
    return roundForDisplay(roundForDisplay(props.effective) - roundForDisplay(props.value + (props.bonus ?? 0)))
})

// Formate un écart avec son signe explicite (+15, -4)
function signed(n: number): string {
    const r = roundForDisplay(n)
    return r > 0 ? `+${r}` : `${r}`
}
</script>

<style scoped>
.effect-badge {
    white-space: nowrap;
}

.effect-badge-icon {
    margin-right: 0.2em;
}
</style>
