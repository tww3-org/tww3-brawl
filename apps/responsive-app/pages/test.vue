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
                :pagination="{ rowsPerPage: 50 }">
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
import type Unit from '~/server/types/Unit';

interface TableColumn {
  name: string;
  label: string;
  field: string | ((row: any) => any);
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}

// Récupérer le client GraphQL
const { $client } = useNuxtApp();

// État
const loading = ref(false);
const selectedVersion = ref(null); // Valeur par défaut
const versions = ref<{ name: string, id: string }[]>([]);
const versionOptions = ref<string[]>([]);
const factions = ref<any[]>([]);

// Colonnes pour le tableau Quasar
const columns: TableColumn[] = [
  { name: 'unit', label: 'ID', field: 'unit', sortable: true },
  { name: 'land_unit', label: 'Nom', field: (row: any) => row.land_unit?.onscreen_name, sortable: true },
  { name: 'health', label: 'PV (Unité/Entité)', field: (row: Unit) => `${row.health?.unit || 0}/${row.health?.entity || 0}`, sortable: true, align: 'right' },
  { name: 'armor', label: 'Armure', field: 'armor', sortable: true, align: 'right' },
  { name: 'attack', label: 'Attaque', field: 'attack', sortable: true, align: 'right' },
  { name: 'defense', label: 'Défense', field: 'defense', sortable: true, align: 'right' },
  { name: 'attack_interval', label: 'Intervalle Attaque', field: 'attack_interval', sortable: true, align: 'right' },
  { name: 'damage', label: 'Dégâts (N/P)', field: (row: Unit) => `${row.damage?.normal || 0}/${row.damage?.piercing || 0}`, sortable: true, align: 'right' },
  { name: 'damage_bonus', label: 'Bonus (L/I)', field: (row: Unit) => `${row.damage?.bonus_v_large || 0}/${row.damage?.bonus_v_infantry || 0}`, sortable: true, align: 'right' },
  { name: 'resistance', label: 'Résistances (P/M/F/W)', field: (row: Unit) => 
    `${row.resistance?.physical || 0}/${row.resistance?.magical || 0}/${row.resistance?.fire || 0}/${row.resistance?.ward_save || 0}`, 
    sortable: true, align: 'right' },
  { name: 'special', label: 'Spécial', field: (row: Unit) => {
    const specials = [];
    if (row.damage?.is_magical) specials.push('Magique');
    if (row.damage?.is_fire) specials.push('Feu');
    if (row.is_large) specials.push('Large');
    return specials.join(', ');
  }, sortable: true }
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
              onscreen_name: true,
              bonus_hit_points: true,
              battle_entity: {
                hit_points: true,
                size: true
              },
              armour: {
                armour_value: true
              },
              primary_melee_weapon: {
                damage: true,
                ap_damage: true,
                bonus_v_large: true,
                bonus_v_infantry: true,
                melee_attack_interval: true,
                is_magical: true,
                ignition_amount: true
              },
              melee_attack: true,
              melee_defence: true
            },
            num_men: true
          }
        }
      }
    });
    console.log('DEBUG result', result);
    if (result?.tww?.factions) {
      // Transformer les données pour correspondre à l'interface Unit
      factions.value = (result.tww.factions || [])
        .filter((faction): faction is NonNullable<typeof faction> => 
          faction !== null && faction.units !== null && faction.units.length > 0)
        .map(faction => ({
          ...faction,
          units: (faction.units || [])
            .filter((unit): unit is NonNullable<typeof unit> => 
              unit !== null && unit.land_unit !== null)
            .map(unit => ({
              ...unit,
              health: {
                unit: Math.round((unit.land_unit?.bonus_hit_points || 0) * (unit.num_men || 1)),
                entity: Math.round((unit.land_unit?.bonus_hit_points || 0))
              },
              armor: unit.land_unit?.armour?.armour_value || 0,
              attack: unit.land_unit?.melee_attack || 0,
              defense: unit.land_unit?.melee_defence || 0,
              attack_interval: unit.land_unit?.primary_melee_weapon?.melee_attack_interval || 0,
              damage: {
                normal: unit.land_unit?.primary_melee_weapon?.damage || 0,
                piercing: unit.land_unit?.primary_melee_weapon?.ap_damage || 0,
                is_magical: unit.land_unit?.primary_melee_weapon?.is_magical || false,
                is_fire: (unit.land_unit?.primary_melee_weapon?.ignition_amount || 0) > 0,
                bonus_v_large: unit.land_unit?.primary_melee_weapon?.bonus_v_large || 0,
                bonus_v_infantry: unit.land_unit?.primary_melee_weapon?.bonus_v_infantry || 0
              },
              resistance: {
                physical: 0,
                magical: 0,
                fire: 0,
                ward_save: 0
              },
              is_large: unit.land_unit?.battle_entity?.size === 'large'
            }))
        }));
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