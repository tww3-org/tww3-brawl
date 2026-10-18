<template>
    <img v-if="!failed" :src="src" :alt="name" :width="size" :height="size" class="effect-image" loading="lazy"
        :style="{ width: `${size}px`, height: `${size}px` }" @error="failed = true">
    <span v-else class="effect-image effect-fallback" :style="{ width: `${size}px`, height: `${size}px` }"
        aria-hidden="true">{{ name.charAt(0).toUpperCase() }}</span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
    src: string
    name: string
    size?: number
}>(), {
    size: 28
})

// Repli neutre (initiale) quand l'image ne charge pas
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>

<style scoped>
.effect-image {
    border-radius: 6px;
    object-fit: cover;
    display: inline-block;
}

.effect-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #607d8b;
    color: #fff;
    font-weight: bold;
    font-size: 0.8em;
}
</style>
