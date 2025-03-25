<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <h2 class="text-h4">Unités par Faction</h2>
      <q-select v-model="selectedVersion" :options="versionOptions" label="Version TWW" dense outlined
        class="q-mb-md" />
      <q-btn color="primary" label="Charger les données" @click="fetchUnitsByFaction" :loading="loading" />
    </div>

    <!-- Panels pour chaque faction -->
    <div v-if="!loading && factions.length">
      <div v-for="faction in factions" :key="faction.key" class="q-mb-md">
        <q-expansion-item :label="faction.screen_name || faction.key"
          :caption="`${faction.subculture?.name || ''} - ${faction.units?.length || 0} unités`"
          header-class="bg-primary text-white" expand-icon-class="text-white">
          <q-card>
            <q-card-section>
              <q-table :rows="faction.units || []" :columns="columns" row-key="unit" dense
                :pagination="{ rowsPerPage: 10 }">
                <!-- Slot personnalisé pour les cellules -->
                <template v-slot:body-cell-land_unit="props">
                  <q-td :props="props">
                    {{ props.row.land_unit?.onscreen_name }}
                  </q-td>
                </template>

                <template v-slot:body-cell-is_monstrous="props">
                  <q-td :props="props">
                    <q-badge :color="props.row.is_monstrous ? 'positive' : 'grey'"
                      :label="props.row.is_monstrous ? 'Oui' : 'Non'" />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>

    <!-- Message de chargement -->
    <div v-else-if="loading" class="text-center q-pa-md">
      <q-spinner size="3em" color="primary" />
      <div class="q-mt-sm">Chargement des données...</div>
    </div>

    <!-- Aucune donnée -->
    <div v-else class="text-center q-pa-md">
      <q-icon name="info" size="3em" color="grey" />
      <div class="q-mt-sm">Aucune donnée disponible. Veuillez sélectionner une version et cliquer sur "Charger les
        données".
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Récupérer le client GraphQL
const { $client } = useNuxtApp();

// État
const loading = ref(false);
const selectedVersion = ref('8131121218983144176'); // Valeur par défaut
const versions = ref<{ name: string, id: string }[]>([]);
const versionOptions = ref<string[]>([]);
const factions = ref<any[]>([]);

// Colonnes pour le tableau Quasar
const columns = [
  { name: 'unit', label: 'ID', field: 'unit', sortable: true },
  { name: 'land_unit', label: 'Nom', field: row => row.land_unit?.onscreen_name, sortable: true },
  { name: 'num_men', label: 'Nbr Unités', field: 'num_men', sortable: true, align: 'right' },
  { name: 'multiplayer_cost', label: 'Coût MP', field: 'multiplayer_cost', sortable: true, align: 'right' },
  { name: 'recruitment_cost', label: 'Coût Recrutement', field: 'recruitment_cost', sortable: true, align: 'right' },
  { name: 'upkeep_cost', label: 'Coût Entretien', field: 'upkeep_cost', sortable: true, align: 'right' },
  { name: 'tier', label: 'Tier', field: 'tier', sortable: true, align: 'center' },
  { name: 'is_monstrous', label: 'Monstrueux', field: 'is_monstrous', sortable: true, align: 'center' }
];

// Récupérer les versions disponibles
async function fetchVersions() {
  try {
    const result = await $client.query({
      versions: {
        id: true,
        name: true,
        game: true
      }
    });
    if (result?.versions) {
      console.log('DEBUG versiions', result.versions);
      versions.value = result.versions.map(v => ({ name: v?.name as string, id: v?.id as string }));
      versionOptions.value = result.versions.map(v => v?.name as string);
    }

    console.log(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des versions:', error);
  }
}

// Récupérer les unités par faction
async function fetchUnitsByFaction() {
  if (!selectedVersion.value) {
    return;
  }

  loading.value = true;
  factions.value = [];

  try {
    console.log('DEBUG selected version', versions.value.find(v => v.name === selectedVersion.value)?.id as string);
    const result = await $client.query({
      tww: {
        __args: {
          tww_version: versions.value.find(v => v.name === selectedVersion.value)?.id as string
        },
        factions: {
          key: true,
          screen_name: true,
          subculture: {
            name: true
          },
          units: {
            unit: true,
            land_unit: {
              onscreen_name: true
            },
            num_men: true,
            multiplayer_cost: true,
            recruitment_cost: true,
            upkeep_cost: true,
            tier: true,
            is_monstrous: true
          }
        }
      }
    });
    console.log('DEBUG result', result);
    if (result?.tww?.factions) {
      // Filtrer les factions qui ont des unités
      factions.value = result.tww.factions
        .filter(faction => faction?.units && faction.units.length > 0);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchVersions();
});
</script>

<style scoped>
.q-expansion-item {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}
</style>