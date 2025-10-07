<template>
    <div class="unit-portrait" :class="{ selected: selected }">
        <img v-if="getUnitPortrait(versionId, unit)" :src="getUnitPortrait(versionId, unit)"
        :alt="unit.land_unit?.onscreen_name || unit.unit" />
        <img v-if="getUnitSemicircle(versionId, unit)" :src="getUnitSemicircle(versionId, unit)"
        :alt="unit.land_unit?.onscreen_name || unit.unit"/>
        <img v-if="getUnitIcon(versionId, unit)" :src="getUnitIcon(versionId, unit)"
        :alt="unit.land_unit?.onscreen_name || unit.unit" />
        <img :src="getUnitBorder(versionId)" />
        <img :src="getUnitHover(versionId)" class="unit-hover"/>
    </div>
</template>

<script setup lang="ts">
import type { Unit } from '@tww3-brawl/sdk/src/types';
import { getUnitPortrait, getUnitIcon, getUnitSemicircle, getUnitBorder, getUnitHover } from '@tww3-brawl/sdk/src/utils/getUnitPortrait';

const props = withDefaults(defineProps<{
    selected: boolean | null
    versionId: string
    unit: Unit
}>(), {
    selected: false
});

</script>

<style scoped lang="scss">

.unit-hover {
    display: none;
}

@mixin emphazed {
    transform: scale(1.1);
    z-index: 1;
    .unit-hover {
        display: block;
    }
}

.selected {
    @include emphazed;
}

.unit-portrait {
    position: relative;
    height:130px;

    img:nth-child(2) {
        position: absolute;
        bottom: 0;
        left: 50%;  
        transform: translateX(-50%);

    }

    img:nth-child(3) {
        position: absolute;
        bottom: 0;
        left: 50%;  
        transform: translateX(-50%);

    }

    img:nth-child(4) {
        position: absolute;
        bottom: 0;
        right: 0;  
    }

    img:nth-child(5) {
        position: absolute;
        bottom: 0;
        right: 0;       
    }

    &:hover {
        @include emphazed;
    }
}
</style>