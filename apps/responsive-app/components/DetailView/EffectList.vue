<template>
    <div class="effect-list" :class="[`align-${orientation}`, { 'no-wrap': max !== undefined }]">
        <EffectIcon v-for="item in visibleItems" :key="item.id" :effect="item.effect" :version-id="versionId"
            :active="item.active" :removable="!item.native"
            :cast-by="item.source === 'opponent' ? opponentName : undefined" @toggle="unitStore.toggleEffect(side, item.id)"
            @remove="unitStore.removeEffect(side, item.id)" />
        <q-btn v-if="hiddenCount > 0" class="more-btn" unelevated dense no-caps :label="`+${hiddenCount}`"
            :aria-label="`Show ${hiddenCount} more effects`" :title="`Show ${hiddenCount} more effects`">
            <q-menu no-route-dismiss>
                <div class="more-grid">
                    <EffectIcon v-for="item in items" :key="item.id" :effect="item.effect" :version-id="versionId"
                        :active="item.active" :removable="!item.native"
                        :cast-by="item.source === 'opponent' ? opponentName : undefined" @toggle="unitStore.toggleEffect(side, item.id)"
                        @remove="unitStore.removeEffect(side, item.id)" />
                </div>
            </q-menu>
        </q-btn>
        <q-btn v-if="withAdd" round dense flat size="sm" icon="add" :aria-label="`Add an effect`" title="Add an effect"
            @click="emit('add')" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getEffect } from '@tww3-brawl/sdk'
import { getUnitDisplayName } from '@tww3-brawl/sdk/src/utils/getUnitDisplayName'
import type { EffectDefinition, EffectPlacement } from '@tww3-brawl/sdk/src/types'
import { useUnitStore } from '~/stores/unitStore'
import { displayedEffects } from '~/types/unit'
import EffectIcon from './EffectIcon.vue'

const props = defineProps<{
    side: 'left' | 'right'
    placement: EffectPlacement
    /** Affiche le bouton « + » (ligne Effects) */
    withAdd?: boolean
    /** Nombre maximal d'éléments affichés sur la ligne ; au-delà, les premiers `max - 1` puis une pastille « +N » ouvrant la liste complète */
    max?: number
}>()

const emit = defineEmits<{
    add: []
}>()

const unitStore = useUnitStore()
const orientation = computed(() => props.side)
const other = computed(() => unitStore[props.side === 'left' ? 'right' : 'left'])
// Même nom que l'en-tête du tableau : nom figé à la sélection, sinon nom calculé
const opponentName = computed(() => {
    const selection = other.value?.selection
    if (!selection?.unit) {
        return undefined
    }
    return selection.displayName || getUnitDisplayName(selection.unit)
})
const versionId = computed(() => unitStore[props.side]?.selection?.version?.id ?? '')

const items = computed(() => displayedEffects(unitStore[props.side], other.value)
    .flatMap(e => {
        const effect = getEffect(e.id)
        return effect && effect.placement === props.placement ? [{ ...e, effect: effect as EffectDefinition }] : []
    }))

const hiddenCount = computed(() => {
    if (props.max === undefined || items.value.length <= props.max) return 0
    return items.value.length - (props.max - 1)
})
const visibleItems = computed(() => hiddenCount.value > 0 ? items.value.slice(0, (props.max ?? 1) - 1) : items.value)
</script>

<style scoped>
.effect-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
}

/* Ligne à largeur bornée : jamais de retour à la ligne (le surplus passe dans « +N ») */
.effect-list.no-wrap {
    flex-wrap: nowrap;
}

/* Pastille « +N » : même poids visuel qu'une icône */
.more-btn {
    flex: none;
    min-width: 28px;
    height: 28px;
    min-height: 28px;
    padding: 0 6px;
    border-radius: 14px;
    font-size: var(--font-size-sm, 0.85rem);
    background: rgba(128, 128, 128, 0.25);
}

.more-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-width: 220px;
    padding: 8px;
}

/* Colonne de gauche : icônes collées vers le centre du tableau */
.align-left {
    justify-content: flex-end;
}

.align-right {
    justify-content: flex-start;
}
</style>
