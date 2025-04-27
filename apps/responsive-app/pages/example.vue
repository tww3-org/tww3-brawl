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

        <!-- Liste des unités -->
        <div v-if="selectedFaction">
            <h3 class="q-mb-sm">Unités de la faction: {{ selectedFaction.label }}</h3>
            <q-table :rows="units || []" :columns="columns" :loading="unitsLoading" row-key="unit" dense
                :pagination="{ rowsPerPage: 25 }" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useVersions, useFactions, useUnits } from '~/composables';

// Version sélectionnée
const selectedVersion = ref(null);
// Faction sélectionnée
const selectedFaction = ref(null);

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
const versionId = computed(() => selectedVersion.value?.value || '');

// Récupération des factions pour la version sélectionnée
const { data: factions, isLoading: factionsLoading } = useFactions(versionId);

// Options pour le select de factions
const factionOptions = computed(() => {
    if (!factions.value) return [];
    return factions.value.map(f => ({
        label: f.screen_name || f.key,
        value: f.key
    }));
});

// Clé de faction pour la requête d'unités
const factionKey = computed(() => selectedFaction.value?.value || '');

// Récupération des unités pour la faction et version sélectionnées
const { data: units, isLoading: unitsLoading } = useUnits(versionId, factionKey);

// Colonnes pour le tableau des unités
const columns = [
    { name: 'unit', label: 'ID', field: 'unit', sortable: true },
    { name: 'name', label: 'Nom', field: row => row.land_unit?.onscreen_name, sortable: true },
    { name: 'health', label: 'PV', field: row => row.health?.unit, sortable: true, align: 'right' },
    { name: 'armor', label: 'Armure', field: 'armor', sortable: true, align: 'right' },
    { name: 'attack', label: 'Attaque', field: 'attack', sortable: true, align: 'right' },
    { name: 'defense', label: 'Défense', field: 'defense', sortable: true, align: 'right' },
];

// Réinitialiser la faction sélectionnée quand la version change
watch(versionId, () => {
    selectedFaction.value = null;
});
</script>