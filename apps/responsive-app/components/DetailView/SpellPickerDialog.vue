<template>
    <q-dialog v-model="open">
        <q-card class="picker-card">
            <q-card-section class="q-pb-none">
                <div class="text-h6">Add a spell</div>
                <q-input v-model="search" dense outlined clearable autofocus placeholder="Search by name or description"
                    class="q-mt-sm" />
                <div class="text-caption q-mt-xs">{{ filtered.length }} spells</div>
            </q-card-section>
            <q-card-section class="q-pt-none list-section">
                <q-virtual-scroll v-if="filtered.length > 0" class="spell-scroll" :items="filtered" separator
                    v-slot="{ item }">
                    <q-item :key="item.id" clickable @click="select(item.id)">
                        <q-item-section avatar>
                            <EffectImage :src="getImageUrl(versionId, item.icon)" :name="item.name" :size="32" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ item.name }}</q-item-label>
                            <q-item-label caption>
                                {{ durationText(item.normal) }}
                                <q-badge v-if="item.overcast" class="q-ml-xs" color="deep-purple-5" label="overcast available" />
                            </q-item-label>
                            <q-item-label v-if="item.description" caption lines="2">{{ item.description }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-virtual-scroll>
                <div v-else class="q-pa-md text-center text-grey">No matching spell</div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Close" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { listSelectableSpells } from '@tww3-brawl/sdk'
import type { SpellDefinition, SpellVersion } from '@tww3-brawl/sdk/src/types'
import { getImageUrl } from '@tww3-brawl/sdk/src/utils/getImageUrl'
import EffectImage from './EffectImage.vue'

defineProps<{
    versionId: string
}>()

const emit = defineEmits<{
    select: [id: string]
}>()

const open = defineModel<boolean>({ default: false })

const search = ref<string | null>('')

// Versions simples uniquement (jamais d'overcast seul), sans les sorts sans effet (voir listSelectableSpells)
const catalog = listSelectableSpells().sort((a, b) => a.name.localeCompare(b.name))

const durationText = (version: SpellVersion) => version.phases.map(p => `${p.duration}s`).join(' + ')

const filtered = computed<SpellDefinition[]>(() => {
    const query = (search.value ?? '').trim().toLowerCase()
    return catalog.filter(s =>
        !query || [s.name, s.description ?? ''].some(text => text.toLowerCase().includes(query)))
})

function select(id: string) {
    emit('select', id)
    open.value = false
}
</script>

<style scoped>
.picker-card {
    width: 600px;
    max-width: 95vw;
}

.spell-scroll {
    max-height: 45vh;
}
</style>
