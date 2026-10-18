<template>
    <q-dialog v-model="open">
        <q-card class="picker-card">
            <q-card-section class="q-pb-none">
                <div class="text-h6">Add an effect</div>
                <q-input v-model="search" dense outlined clearable autofocus placeholder="Search by name or id"
                    class="q-mt-sm" />
                <div class="row q-col-gutter-sm q-mt-xs">
                    <q-select v-model="kind" :options="kindOptions" label="Kind" dense outlined emit-value map-options
                        class="col-6 col-sm-3" />
                    <q-select v-model="placement" :options="placementOptions" label="Placement" dense outlined
                        emit-value map-options class="col-6 col-sm-3" />
                    <q-select v-model="polarity" :options="polarityOptions" label="Polarity" dense outlined
                        emit-value map-options class="col-6 col-sm-3" />
                    <q-select v-model="passive" :options="passiveOptions" label="Trigger" dense outlined emit-value
                        map-options class="col-6 col-sm-3" />
                </div>
                <div class="text-caption q-mt-xs">{{ filtered.length }} effects</div>
            </q-card-section>
            <q-card-section class="q-pt-none list-section">
                <q-virtual-scroll v-if="filtered.length > 0" class="effect-scroll" :items="filtered" separator
                    v-slot="{ item }">
                    <q-item :key="item.id" clickable @click="select(item.id)">
                        <q-item-section avatar>
                            <EffectImage :src="getImageUrl(versionId, item.icon)" :name="item.name" :size="32" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ item.name }}</q-item-label>
                            <q-item-label caption>{{ item.kind }} &middot; {{ item.polarity }}</q-item-label>
                            <q-item-label v-for="line in describeModifiers(item.modifiers)" :key="line" caption
                                lines="1">{{ line }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-virtual-scroll>
                <div v-else class="q-pa-md text-center text-grey">No matching effect</div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Close" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { listEffects } from '@tww3-brawl/sdk'
import type { EffectDefinition } from '@tww3-brawl/sdk/src/types'
import { getImageUrl } from '@tww3-brawl/sdk/src/utils/getImageUrl'
import EffectImage from './EffectImage.vue'
import { describeModifiers } from './effectFormat'

defineProps<{
    versionId: string
}>()

const emit = defineEmits<{
    select: [id: string]
}>()

const open = defineModel<boolean>({ default: false })

const search = ref<string | null>('')
const kind = ref<string | null>(null)
const placement = ref<string | null>(null)
const polarity = ref<string | null>(null)
const passive = ref<boolean | null>(null)

const kindOptions = [
    { label: 'All', value: null },
    { label: 'Weapon', value: 'weapon' },
    { label: 'Contact', value: 'contact' },
    { label: 'Ability', value: 'ability' },
    { label: 'Attribute', value: 'attribute' },
]
const placementOptions = [
    { label: 'All', value: null },
    { label: 'Attack', value: 'attack' },
    { label: 'Effects', value: 'effects' },
]
const polarityOptions = [
    { label: 'All', value: null },
    { label: 'Buff', value: 'positive' },
    { label: 'Debuff', value: 'negative' },
]
const passiveOptions = [
    { label: 'All', value: null },
    { label: 'Passive', value: true },
    { label: 'Active', value: false },
]

const catalog = listEffects().sort((a, b) => a.name.localeCompare(b.name))

const filtered = computed<EffectDefinition[]>(() => {
    const query = (search.value ?? '').trim().toLowerCase()
    return catalog.filter(e =>
        (!query || e.name.toLowerCase().includes(query) || e.id.toLowerCase().includes(query))
        && (kind.value === null || e.kind === kind.value)
        && (placement.value === null || e.placement === placement.value)
        && (polarity.value === null || e.polarity === polarity.value)
        && (passive.value === null || e.passive === passive.value))
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

.effect-scroll {
    max-height: 45vh;
}
</style>
