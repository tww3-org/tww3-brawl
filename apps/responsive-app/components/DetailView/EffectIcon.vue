<template>
    <span class="effect-icon-wrapper">
        <button type="button" class="effect-icon" :class="{ inactive: !active }" :aria-pressed="active"
            :aria-label="effect.name" @pointerdown="onPointerDown" @pointerup="onPointerUp" @click="onClick">
            <EffectImage :src="imageUrl" :name="effect.name" :size="28" />
            <span v-if="inflicted" class="inflicted-dot" aria-hidden="true" />
            <q-tooltip class="effect-tooltip" anchor="top middle" self="bottom middle">
                <div class="text-weight-bold">{{ effect.name }}</div>
                <div v-if="effect.description" class="description">{{ effect.description }}</div>
                <ul v-if="lines.length > 0" class="modifier-lines">
                    <li v-for="line in lines" :key="line">{{ line }}</li>
                </ul>
                <div v-if="inflicted" class="text-red-3">Inflicted on the opponent</div>
                <div class="state">{{ active ? 'Active' : 'Inactive' }}</div>
            </q-tooltip>
        </button>
        <button v-if="removable" type="button" class="remove-btn" :aria-label="`Remove ${effect.name}`"
            @click.stop="emit('remove')">&times;</button>
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EffectDefinition } from '@tww3-brawl/sdk/src/types'
import { getImageUrl } from '@tww3-brawl/sdk/src/utils/getImageUrl'
import EffectImage from './EffectImage.vue'
import { describeModifiers, isInflictedOnOpponent } from './effectFormat'

const props = defineProps<{
    effect: EffectDefinition
    versionId: string
    active: boolean
    removable?: boolean
}>()

const emit = defineEmits<{
    toggle: []
    remove: []
}>()

// Appui long tactile (tooltip) : le click qui suit le relâchement ne doit pas basculer l'effet
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
}

function onClick() {
    if (swallowClick) {
        swallowClick = false
        return
    }
    emit('toggle')
}

const imageUrl = computed(() => getImageUrl(props.versionId, props.effect.icon))
const lines = computed(() => describeModifiers(props.effect.modifiers))
const inflicted = computed(() => isInflictedOnOpponent(props.effect))
</script>

<style scoped>
.effect-icon-wrapper {
    position: relative;
    display: inline-flex;
}

.effect-icon {
    position: relative;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 6px;
    background: none;
    cursor: pointer;
    line-height: 0;
}

.effect-icon:focus-visible {
    outline: 2px solid var(--q-primary, #1976d2);
    outline-offset: 1px;
}

.effect-icon.inactive img,
.effect-icon.inactive .effect-fallback {
    filter: brightness(.35) grayscale(1);
}

.inflicted-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e53935;
    border: 1px solid #fff;
}

.remove-btn {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 14px;
    height: 14px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: #424242;
    color: #fff;
    font-size: 12px;
    line-height: 14px;
    cursor: pointer;
}

.effect-tooltip {
    max-width: 280px;
    text-align: left;
    font-size: var(--font-size-sm, 0.85rem);
}

.modifier-lines {
    margin: 4px 0;
    padding-left: 16px;
}

.description,
.state {
    opacity: 0.8;
}
</style>
