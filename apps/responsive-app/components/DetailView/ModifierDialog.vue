<template>
    <q-dialog v-model="open" no-route-dismiss @hide="onHide">
        <q-card class="modifier-dialog">
            <q-card-section class="text-h6">{{ title }}</q-card-section>
            <q-card-section class="text-center">
                <div class="summary">
                    {{ baseValue }} → {{ total }}
                    <span v-if="draft !== 0" :class="draft > 0 ? 'text-green' : 'text-red'">({{ draft > 0 ? '+' : '' }}{{ draft }})</span>
                </div>
                <ModifierDisplay class="steps" @modify="onModify" @reset="onReset" />
                <q-input :model-value="total" dense outlined type="number" label="Valeur"
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

// Brouillon local : la valeur n'est enregistrée qu'à la fermeture du dialogue
const draft = ref(props.bonus)
const total = computed(() => props.baseValue + draft.value)

watch(open, (isOpen) => {
    if (isOpen) {
        draft.value = props.bonus
    }
})

function onHide() {
    if (draft.value !== props.bonus) {
        emit('update', draft.value)
    }
}

function onModify(step: number) {
    draft.value = applyModifierStep(draft.value, step, props.baseValue)
}

function onReset() {
    draft.value = 0
}

function onInput(value: string | number | null) {
    const num = typeof value === 'string' ? Number(value) : (value ?? 0)
    draft.value = num - props.baseValue
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
