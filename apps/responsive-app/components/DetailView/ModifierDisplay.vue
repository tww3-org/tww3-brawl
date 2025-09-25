<template>
    <div>
        <q-btn round flat dense color="red" aria-label="Decrease value" title="Decrease value" @click="emit('modify', -5)">
            <Icon name="line-md:chevron-small-double-left" />
        </q-btn>
        <q-btn round flat dense color="red" aria-label="Decrease value" title="Decrease value" @click="emit('modify', -1)">
            <Icon name="line-md:chevron-small-left" />
        </q-btn>
        <q-btn round flat dense aria-label="Reset value" title="Reset value" @click="emit('reset')">
            <Icon name="ion:ios-minus-empty" />
        </q-btn>
        <q-btn round flat dense color="green" aria-label="Increase value" title="Increase value" @click="emit('modify', 1)">
            <Icon name="line-md:chevron-small-right" />
        </q-btn>
        <q-btn round flat dense color="green" aria-label="Increase value" title="Increase value" @click="emit('modify', 5)">
            <Icon name="line-md:chevron-small-double-right" />
        </q-btn>
    </div>
</template>
 
<script setup lang="ts">
const emit = defineEmits<{
    modify: [value: number],
    reset: []
}>()
</script>