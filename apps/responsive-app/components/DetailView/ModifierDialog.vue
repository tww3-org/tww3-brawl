<template>
    <q-dialog v-model="open" no-route-dismiss>
        <q-card class="modifier-dialog">
            <q-card-section class="text-h6">{{ title }}</q-card-section>
            <q-card-section class="text-center">
                <div class="summary">
                    {{ baseValue }} → {{ total }}
                    <span v-if="bonus !== 0" :class="bonus > 0 ? 'text-green' : 'text-red'">({{ bonus > 0 ? '+' : '' }}{{ bonus }})</span>
                </div>
                <ModifierDisplay class="steps" @modify="onModify" @reset="onReset" />
                <q-input :model-value="total" dense outlined type="number" debounce="500" label="Valeur"
                    @update:model-value="onInput" @focus="onFocusSelectAll" />
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Fermer" color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import ModifierDisplay from './ModifierDisplay.vue';
import { applyModifierStep } from './modifierStep';

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
    title: string
    baseValue: number
    bonus: number
}>()

const emit = defineEmits<{
    update: [bonus: number]
}>()

const total = computed(() => props.baseValue + props.bonus)

function onModify(step: number) {
    emit('update', applyModifierStep(props.bonus, step, props.baseValue))
}

function onReset() {
    emit('update', 0)
}

function onInput(value: string | number | null) {
    const num = typeof value === 'string' ? Number(value) : (value ?? 0)
    emit('update', num - props.baseValue)
}

function onFocusSelectAll(e: Event) {
    const target = e.target as HTMLInputElement | null
    requestAnimationFrame(() => target?.select())
}
</script>

<style scoped lang="scss">
.modifier-dialog {
    width: 100%;
    max-width: 22rem;
}

.summary {
    font-size: 1.75rem;
    font-weight: bold;
    margin-bottom: 0.75rem;
}

.steps {
    margin-bottom: 1rem;
}
</style>
