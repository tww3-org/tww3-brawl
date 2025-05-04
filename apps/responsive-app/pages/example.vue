<template>
    <div class="q-pa-md">
        <h2 class="text-h4">Exemple d'utilisation des composables</h2>

        <!-- Sélection de version -->
        <div class="q-mb-md">
            <q-select v-model="selectedVersion" :options="versionOptions" :loading="versionsLoading" label="Version"
                dense outlined />
        </div>

        <!-- Sélection de faction -->
        <div class="q-mb-md">
            <q-select v-model="selectedFaction" :options="factionOptions" :loading="factionsLoading"
                :disable="!selectedVersion || factionsLoading" label="Faction" dense outlined />
        </div>

    </div>
</template>

<script setup lang="ts">


// <!-- Liste des unités -->
// <div v-if="selectedFaction">
//     <h3 class="q-mb-sm">Unités de la faction: {{ selectedFaction.label }}</h3>
//     <q-table :rows="units || []" :columns="columns" :loading="unitsLoading" row-key="unit" dense
//         :pagination="{ rowsPerPage: 25 }" />
// </div>

import { ref, computed, watch } from 'vue';
import { useVersions, useFactions } from '~/composables';
import type { Faction } from '@tww3-brawl/sdk';

// Version sélectionnée
const selectedVersion = ref<{ label: string; value: string } | null>(null);
// Faction sélectionnée
const selectedFaction = ref<{ label: string; value: string } | null>(null);

// Récupération des versions
const { data: versions, isLoading: versionsLoading } = useVersions();

// Options pour le select de versions
const versionOptions = computed(() => {
    if (!versions.value) return [];
    return versions.value.map(v => ({
        label: v.name,
        value: v.id
    }));
});

// ID de version pour la requête de factions
const versionId = computed(() => selectedVersion.value?.value ?? '');

// Récupération des factions pour la version sélectionnée
const { data: factions, isLoading: factionsLoading, refetch: refetchFactions } = useFactions(versionId);

// Options pour le select de factions
const factionOptions = computed(() => {
    if (!factions.value) return [];
    return factions.value.map((f: Faction) => ({
        label: f.screen_name || f.key,
        value: f.key
    }));
});

// Réinitialiser la faction sélectionnée quand la version change
watch(() => selectedVersion.value?.value, () => {
    if (selectedVersion.value?.value) {
        refetchFactions()
    }
});

</script>