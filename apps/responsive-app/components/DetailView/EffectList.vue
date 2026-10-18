<template>
    <div class="effect-list" :class="`align-${orientation}`">
        <EffectIcon v-for="item in items" :key="item.id" :effect="item.effect" :version-id="versionId"
            :active="item.active" :removable="!item.native" @toggle="unitStore.toggleEffect(side, item.id)"
            @remove="unitStore.removeEffect(side, item.id)" />
        <q-btn v-if="withAdd" round dense flat size="sm" icon="add" :aria-label="`Add an effect`" title="Add an effect"
            @click="emit('add')" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getEffect } from '@tww3-brawl/sdk'
import type { EffectDefinition, EffectPlacement } from '@tww3-brawl/sdk/src/types'
import { useUnitStore } from '~/stores/unitStore'
import { displayedEffects } from '~/types/unit'
import EffectIcon from './EffectIcon.vue'

const props = defineProps<{
    side: 'left' | 'right'
    placement: EffectPlacement
    /** Affiche le bouton « + » (ligne Effects) */
    withAdd?: boolean
}>()

const emit = defineEmits<{
    add: []
}>()

const unitStore = useUnitStore()
const orientation = computed(() => props.side)
const other = computed(() => unitStore[props.side === 'left' ? 'right' : 'left'])
const versionId = computed(() => unitStore[props.side]?.selection?.version?.id ?? '')

const items = computed(() => displayedEffects(unitStore[props.side], other.value)
    .flatMap(e => {
        const effect = getEffect(e.id)
        return effect && effect.placement === props.placement ? [{ ...e, effect: effect as EffectDefinition }] : []
    }))
</script>

<style scoped>
.effect-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
}

/* Colonne de gauche : icônes collées vers le centre du tableau */
.align-left {
    justify-content: flex-end;
}

.align-right {
    justify-content: flex-start;
}
</style>
