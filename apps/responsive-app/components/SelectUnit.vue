<template>
  <div class="row items-center q-gutter-x-sm">
    <q-btn
      :label="modelValue || 'Pick a unit'"
      color="primary"
      @click="$emit('update:modelValue', modelValue ?? 'test')"
    />
    <q-btn
      round
      flat
      color="grey"
      icon="settings"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string
}>();

defineEmits<{
  'update:modelValue': [value: string]
}>();
</script>

<style scoped>
</style> 