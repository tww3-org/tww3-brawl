<template>
</template>

<script setup lang="ts">
import NumericInput from '~/components/DetailView/NumericInput.vue';

const value = ref(0)

function onUpdate(value: number) {
  console.log('onUpdate', value)
}
</script>