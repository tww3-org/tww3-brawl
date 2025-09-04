<template>
    <q-btn-dropdown>
        <q-list>
            <q-item v-for="mount in mount_options" :key="mount.mounted_unit" @click="selectMount(mount)" clickable v-close-popup>
                <q-avatar>
                    <img :src="getImageUrl(unit.version, mount.icon_name)">
                </q-avatar>

                {{ mount.mount_name }}
            </q-item>
        </q-list>
    </q-btn-dropdown>
    <q-avatar v-if="selectedIcon">
        <img :src="getImageUrl(unit.version, selectedIcon)">
    </q-avatar>
</template>

<script setup lang="ts">
import type { Unit } from '@tww3-brawl/sdk/src/types';
import { CROSS_ICON_SUFFIX } from '@tww3-brawl/sdk/src/utils/constants';
import { getImageUrl } from '@tww3-brawl/sdk/src/utils/getImageUrl';
import { useUnit } from '~/composables/useUnit';
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  unit: Unit
}>();

const emit = defineEmits<{
  'update:unit': [value: Unit]
}>();

const selectedIcon = computed(() => {
    return mount_options.value.find(mount => mount.mounted_unit === props.unit.unit)?.icon_name;
});

// État pour gérer la sélection de mount en cours
const selectedMountKey = ref<string | null>(null);

const mount_options = computed(() => {
    const mounts = props.unit.battle_mounts;
    if (mounts.length > 0) {
        const on_foot = {
            base_unit: mounts[0].base_unit,
            mounted_unit: mounts[0].base_unit,
            icon_name: CROSS_ICON_SUFFIX,
            mount_name: "On Foot"
        };
        return [...mounts, on_foot];
    }
    return [];
});

// Créer des Ref valides pour useUnit
const versionRef = computed(() => props.unit.version);
const unitKeyRef = computed(() => selectedMountKey.value || '');

// Récupération de l'unité montée sélectionnée
const { data: mountedUnit, isLoading: unitLoading, error: unitError, refetch: refetchMountedUnit } = useUnit(
    versionRef,
    unitKeyRef
);

// Surveiller les changements de l'unité montée et mettre à jour le modèle
watch(selectedMountKey, async (selectedMountKey) => {
    console.log("selectedMountKey", selectedMountKey);
    if (selectedMountKey !== null) {
        await refetchMountedUnit();
        console.log("mountedUnit", mountedUnit.value);
        // Emettre le modèle avec la nouvelle unité
        if (mountedUnit.value) {    
            emit('update:unit', mountedUnit.value);
        }
        console.log("model", props.unit);
        // Réinitialiser la sélection
        // selectedMountKey.value = null;
    }
}, { immediate: true });

function selectMount(mount: Unit['battle_mounts'][number]) {
    const new_unit_key = mount.mounted_unit;
    console.log("click on mount", new_unit_key);
    // Si c'est la même unité (pas de changement de mount), ne rien faire
    if (new_unit_key === props.unit.unit) {
        return;
    }
    
    // Définir la clé de l'unité à récupérer
    selectedMountKey.value = new_unit_key;
}
</script>

<style scoped></style>