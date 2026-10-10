<template>
    <div class="unit-portrait" :class="{ selected: selected, interactive: interactive }"
        :style="{ '--unit-portrait-size': size }">
        <img v-if="getUnitPortrait(versionId, unit)" :src="getUnitPortrait(versionId, unit)"
        :alt="getUnitDisplayName(unit)" class="unit-portrait__image" />
        <img v-if="getUnitSemicircle(versionId, unit)" :src="getUnitSemicircle(versionId, unit)"
        :alt="getUnitDisplayName(unit)" class="unit-portrait__semicircle" />
        <img v-if="getUnitIcon(versionId, unit)" :src="getUnitIcon(versionId, unit)"
        :alt="getUnitDisplayName(unit)" class="unit-portrait__icon" />
        <img :src="getUnitBorder(versionId)" class="unit-portrait__frame" />
        <img :src="getUnitHover(versionId)" class="unit-hover"/>
    </div>
</template>

<script setup lang="ts">
import type { Unit } from '@tww3-brawl/sdk/src/types';
import { getUnitPortrait, getUnitIcon, getUnitSemicircle, getUnitBorder, getUnitHover } from '@tww3-brawl/sdk/src/utils/getUnitPortrait';
import { getUnitDisplayName } from '@tww3-brawl/sdk/src/utils/getUnitDisplayName';

withDefaults(defineProps<{
    selected?: boolean | null
    versionId: string
    unit: Unit
    interactive?: boolean
    /** CSS height of the portrait; the 60 / 130 ratio is kept and every layer scales with it. */
    size?: string
}>(), {
    selected: false,
    interactive: true,
    size: '130px'
});

</script>

<style scoped lang="scss">

.unit-hover {
    display: none;
}

.selected {
    @include emphazed-card;

    .unit-hover {
        display: block;
    }
}

.unit-portrait {
    position: relative;
    height: var(--unit-portrait-size);
    aspect-ratio: 60 / 130;

    // Every layer is sized in % of the container (assets are designed for a 60x130 frame)
    &__image,
    &__frame,
    .unit-hover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    &__semicircle,
    &__icon {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        height: auto;
    }

    &__semicircle {
        width: calc(55 / 60 * 100%);
    }

    &__icon {
        width: calc(22 / 60 * 100%);
    }

    &.interactive:hover {
        @include emphazed-card;
        
        .unit-hover {
            display: block;
        }
    }
}
</style>