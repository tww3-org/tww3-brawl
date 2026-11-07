<template>
    <div class="spell-list" :class="[`align-${orientation}`, { 'no-wrap': max !== undefined }]">
        <SpellIcon v-for="item in visibleItems" :key="item.spell.id" :spell="item.spell" :version-id="versionId"
            :casts="item.casts" @set="(version, n) => unitStore.setSpellCasts(side, item.spell.id, version, n)"
            @remove="unitStore.removeSpell(side, item.spell.id)" />
        <q-btn v-if="hiddenCount > 0" class="more-btn" unelevated dense no-caps :label="`+${hiddenCount}`"
            :aria-label="`Show ${hiddenCount} more spells`" :title="`Show ${hiddenCount} more spells`">
            <q-menu no-route-dismiss>
                <div class="more-grid">
                    <SpellIcon v-for="item in items" :key="item.spell.id" :spell="item.spell" :version-id="versionId"
                        :casts="item.casts" @set="(version, n) => unitStore.setSpellCasts(side, item.spell.id, version, n)"
                        @remove="unitStore.removeSpell(side, item.spell.id)" />
                </div>
            </q-menu>
        </q-btn>
        <q-btn round dense flat size="sm" icon="add" aria-label="Add a spell" title="Add a spell" @click="emit('add')" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getSpell } from '@tww3-brawl/sdk'
import { useUnitStore } from '~/stores/unitStore'
import { spellCastsOf } from '~/types/unit'
import SpellIcon from './SpellIcon.vue'

const props = defineProps<{
    side: 'left' | 'right'
    /** Nombre maximal d'éléments affichés sur la ligne ; au-delà, les premiers `max - 1` puis une pastille « +N » ouvrant la liste complète */
    max?: number
}>()

const emit = defineEmits<{
    add: []
}>()

const unitStore = useUnitStore()
const orientation = computed(() => props.side)
const versionId = computed(() => unitStore[props.side]?.selection?.version?.id ?? '')

// Sorts lancés de ce côté (les ids inconnus du catalogue sont ignorés)
const items = computed(() => Object.entries(spellCastsOf(unitStore[props.side])).flatMap(([id, casts]) => {
    const spell = getSpell(id)
    return spell ? [{ spell, casts }] : []
}))

const hiddenCount = computed(() => {
    if (props.max === undefined || items.value.length <= props.max) return 0
    return items.value.length - (props.max - 1)
})
const visibleItems = computed(() => hiddenCount.value > 0 ? items.value.slice(0, (props.max ?? 1) - 1) : items.value)
</script>

<style scoped>
.spell-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
}

/* Ligne à largeur bornée : jamais de retour à la ligne (le surplus passe dans « +N ») */
.spell-list.no-wrap {
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
    gap: 10px;
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
