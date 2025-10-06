<template>
  <NumericInput v-bind:model-value="value" :baseValue="10" label="Test" :modifier="0" @update:model-value="onUpdate" />
</template>

<script setup lang="ts">
import NumericInput from '~/components/DetailView/NumericInput.vue';

const value = ref(0)

function onUpdate(value: number) {
  console.log('onUpdate', value)
}
</script>