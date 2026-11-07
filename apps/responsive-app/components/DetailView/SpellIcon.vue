<template>
    <span class="spell-icon-wrapper">
        <button type="button" class="spell-icon" :class="{ inactive: total === 0 }" :aria-label="`${spell.name} (${total})`"
            @pointerdown="onPointerDown" @pointerup="onPointerUp" @click="onClick" @contextmenu.prevent="emit('set', 'normal', casts.normal - 1)">
            <EffectImage :src="imageUrl" :name="spell.name" :size="28" />
            <span class="cast-badge" aria-hidden="true">{{ total }}</span>
            <q-tooltip class="spell-tooltip" anchor="top middle" self="bottom middle">
                <div class="text-weight-bold">{{ spell.name }}</div>
                <div v-if="spell.description" class="description">{{ spell.description }}</div>
                <div>Duration: {{ durationText(spell.normal) }}<template v-if="spell.overcast"> &middot; overcast {{ durationText(spell.overcast) }}</template></div>
                <div v-if="hitTexts.length === 1">Covers {{ hitTexts[0] }}</div>
                <template v-else>
                    <div>Covers:</div>
                    <div v-for="text in hitTexts" :key="text" class="phase-hits">{{ text }}</div>
                </template>
                <div class="state">Click: +1 &middot; right-click / long press: &minus;1</div>
            </q-tooltip>
        </button>
        <button v-if="spell.overcast" type="button" class="overcast-chip" :class="{ filled: casts.overcast >= 1 }"
            :aria-pressed="casts.overcast >= 1" :aria-label="`Overcast ${spell.name}`" title="Overcast"
            @click.stop="emit('set', 'overcast', casts.overcast >= 1 ? 0 : 1)" />
        <button type="button" class="menu-btn" :aria-label="`${spell.name} details`" title="Details" @click.stop>
            &#8942;
            <q-menu no-route-dismiss>
                <div class="spell-menu">
                    <div class="text-weight-bold q-mb-xs">{{ spell.name }}</div>
                    <div class="counter-row">
                        <span class="counter-label">Casts</span>
                        <q-btn dense flat round size="sm" icon="remove" aria-label="Fewer casts" :disable="casts.normal <= 0"
                            @click="emit('set', 'normal', casts.normal - 1)" />
                        <span class="counter-value">{{ casts.normal }}</span>
                        <q-btn dense flat round size="sm" icon="add" aria-label="More casts" :disable="casts.normal >= MAX_SPELL_CASTS"
                            @click="emit('set', 'normal', casts.normal + 1)" />
                    </div>
                    <div v-if="spell.overcast" class="counter-row">
                        <span class="counter-label">Overcast</span>
                        <q-btn dense flat round size="sm" icon="remove" aria-label="Fewer overcasts" :disable="casts.overcast <= 0"
                            @click="emit('set', 'overcast', casts.overcast - 1)" />
                        <span class="counter-value">{{ casts.overcast }}</span>
                        <q-btn dense flat round size="sm" icon="add" aria-label="More overcasts" :disable="casts.overcast >= MAX_SPELL_CASTS"
                            @click="emit('set', 'overcast', casts.overcast + 1)" />
                    </div>
                    <q-btn dense flat no-caps color="negative" icon="delete" label="Remove" class="q-mt-xs" v-close-popup
                        @click="emit('remove')" />
                </div>
            </q-menu>
        </button>
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpellDefinition, SpellVersion } from '@tww3-brawl/sdk/src/types'
import { getImageUrl } from '@tww3-brawl/sdk/src/utils/getImageUrl'
import { MAX_SPELL_CASTS, spellPhaseHitTexts, spellPhaseHits } from '~/types/unit'
import EffectImage from './EffectImage.vue'

const props = defineProps<{
    spell: SpellDefinition
    versionId: string
    casts: { normal: number; overcast: number }
}>()

const emit = defineEmits<{
    /** Nouveau compteur d'une version (le store borne la valeur) */
    set: [version: 'normal' | 'overcast', n: number]
    remove: []
}>()

const total = computed(() => props.casts.normal + props.casts.overcast)
const imageUrl = computed(() => getImageUrl(props.versionId, props.spell.icon))

/** Durées des phases d'une version (ex. « 10s + 14s ») */
const durationText = (version: SpellVersion) => version.phases.map(p => `${p.duration}s`).join(' + ')

// Coups couverts par phase (les phases sont des sorts indépendants ; lancers × durée / 4 s)
const hitTexts = computed(() => spellPhaseHitTexts(spellPhaseHits(props.spell.id, props.casts)))

// Appui long tactile : -1 (le click qui suit le relâchement ne doit pas faire +1)
const LONG_PRESS_MS = 450
let pressStart = 0
let swallowClick = false

function onPointerDown(e: PointerEvent) {
    swallowClick = false
    pressStart = e.pointerType === 'touch' ? Date.now() : 0
}

function onPointerUp(e: PointerEvent) {
    swallowClick = e.pointerType === 'touch' && pressStart > 0 && Date.now() - pressStart >= LONG_PRESS_MS
    pressStart = 0
    if (swallowClick) {
        emit('set', 'normal', props.casts.normal - 1)
    }
}

function onClick() {
    if (swallowClick) {
        swallowClick = false
        return
    }
    emit('set', 'normal', props.casts.normal + 1)
}
</script>

<style scoped>
.spell-icon-wrapper {
    position: relative;
    display: inline-flex;
}

.spell-icon {
    position: relative;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 6px;
    background: none;
    cursor: pointer;
    line-height: 0;
}

.spell-icon:focus-visible {
    outline: 2px solid var(--q-primary, #1976d2);
    outline-offset: 1px;
}

/* Aucun lancer : icône grisée */
.spell-icon.inactive img,
.spell-icon.inactive .effect-fallback {
    filter: brightness(.35) grayscale(1);
}

.cast-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    border-radius: 7px;
    background: var(--q-primary, #1976d2);
    color: #fff;
    font-size: 10px;
    line-height: 14px;
    text-align: center;
}

/* Puce overcast : bas à droite, pleine si au moins un overcast */
.overcast-chip {
    position: absolute;
    bottom: -3px;
    right: -3px;
    width: 12px;
    height: 12px;
    padding: 0;
    border: 2px solid #7e57c2;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
}

.overcast-chip.filled {
    background: #7e57c2;
}

/* Accès au menu (compteurs détaillés, retrait) : tap sur mobile */
.menu-btn {
    position: absolute;
    bottom: -4px;
    left: -4px;
    width: 14px;
    height: 14px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: #424242;
    color: #fff;
    font-size: 11px;
    line-height: 14px;
    cursor: pointer;
}

.spell-menu {
    padding: 8px;
    min-width: 190px;
}

.counter-row {
    display: flex;
    align-items: center;
    gap: 4px;
}

.counter-label {
    flex: 1;
}

.counter-value {
    min-width: 16px;
    text-align: center;
}

.spell-tooltip {
    max-width: 280px;
    text-align: left;
    font-size: var(--font-size-sm, 0.85rem);
}

.description,
.state {
    opacity: 0.8;
}
</style>
