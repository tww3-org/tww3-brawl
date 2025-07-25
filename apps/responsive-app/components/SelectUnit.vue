<template>
  <div class="row items-center q-gutter-x-sm">
    <q-btn :label="modelValue || 'Pick a unit'" color="primary" @click="dialogVisible = true" />
    <q-btn round flat color="grey" icon="settings" />
    <q-dialog v-model="dialogVisible">
      <q-card class="custom">
        <q-card-section >
          <q-carousel ref="carouselRef" :padding="false" v-model="step" :autoplay="false"
            transition-prev="slide-left" transition-next="slide-right" aria-hidden="true">

            <q-carousel-slide name="version" key="version">
              <div class="q-mb-md">                
                <q-select
                  v-model="selectedVersion"
                  :options="versionOptions"
                  :loading="versionsLoading"
                  label="Versions"
                  dense outlined
                />
              </div>

            </q-carousel-slide>

            <q-carousel-slide name="faction" key="faction">
              <div class="q-mb-md">
                <q-select
                  v-model="selectedFaction"
                  :options="factionOptions"
                  :loading="factionsLoading"
                  :disable="!selectedVersion || factionsLoading"
                  label="Faction"
                  dense outlined
                />
                <div v-if="factions && step === 'faction'" class="faction-icons-row">
                  <div
                    v-for="faction in factions"
                    :key="faction.key"
                    class="faction-icon-container"
                    :class="{ selected: selectedFaction && selectedFaction.value === faction.key }"
                    @click="selectedFaction = { label: faction.screen_name || faction.key, value: faction.key }"
                  >
                    <img
                      v-if="getFactionPortrait(versionId, faction)"
                      :src="getFactionPortrait(versionId, faction)"
                      :alt="faction.screen_name || faction.key"
                      class="faction-icon"
                    />
                    <div class="faction-label">{{ faction.subculture?.name || faction.key }}</div>
                  </div>
                </div>
              </div>
            </q-carousel-slide>

            <q-carousel-slide name="unit" key="unit">
              <div class="q-mb-md">
                <div v-if="units && Object.keys(groupedUnits).length > 0">
                  <div v-for="(unitsList, groupName) in groupedUnits" :key="groupName" class="unit-group-block">
                    <div class="group-label">{{ groupName }}</div>
                    <div class="unit-icons-row">
                      <div
                        v-for="unit in unitsList"
                        :key="unit.unit"
                        class="unit-icon-container"
                        :class="{ selected: selectedUnit && selectedUnit.value === unit.unit }"
                        @click="selectedUnit = { label: unit.land_unit?.onscreen_name || unit.unit, value: unit.unit }"
                      >
                        <img
                          v-if="getUnitPortrait(versionId, unit)"
                          :src="getUnitPortrait(versionId, unit)"
                          :alt="unit.land_unit?.onscreen_name || unit.unit"
                          class="unit-icon"
                        />
                        <div class="unit-label">{{ unit.land_unit?.onscreen_name || unit.unit }}</div>
                      </div>
                    </div>

                  </div>
                </div>
                <div v-else>
                  <q-spinner color="primary" />
                </div>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>
        <q-card-actions class="text-primary" align="between">
          <q-btn
            v-if="step === 'version'"
            label="Fermer"
            flat
            dense
            @click="dialogVisible = false"
          />
          <q-btn
            v-else
            label="Précédent"
            flat
            dense
            @click="carouselRef?.previous()"
          />

          <q-btn
            v-if="step !== 'unit'"
            :disable="(step === 'version' && !selectedVersion) || (step === 'faction' && !selectedFaction)"
            label="Suivant"
            color="primary"
            flat
            dense
            @click="carouselRef?.next()"
          />
          <q-btn
            v-else
            :disable="!selectedUnit"
            label="Finir"
            color="primary"
            flat
            dense
            @click="() => { dialogVisible = false; if(selectedUnit) emit('update:modelValue', selectedUnit.value) }"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { QCarousel } from 'quasar';
import { useVersions } from '~/composables/useVersions';
import { useFactions } from '~/composables/useFactions';
import { useUnits } from '~/composables/useUnits';
import { getFactionPortrait } from '@tww3-brawl/sdk/src/utils/getFactionPortrait';
import { getUnitPortrait } from '@tww3-brawl/sdk/src/utils/getUnitPortrait';

const carouselRef = ref<QCarousel | null>(null);
const step = ref<'version' | 'faction' | 'unit'>('version');
const dialogVisible = ref(false);


defineProps<{
  modelValue?: string
  version?: string
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:version': [value: string]
}>();

// Sélection version/faction/unité
const selectedVersion = ref<{ label: string; value: string } | null>(null);
const selectedFaction = ref<{ label: string; value: string } | null>(null);
const selectedUnit = ref<{ label: string; value: string } | null>(null);

// Récupération des versions
const { data: versions, isLoading: versionsLoading } = useVersions();
const versionOptions = computed(() => {
  if (!versions.value) return [];
  return versions.value.map(v => ({ label: v.name, value: v.id }));
});

// Récupération des factions
const versionId = computed(() => {
  console.log('selectedVersion', selectedVersion.value)
  return selectedVersion.value?.value ?? ''});
  
const { data: factions, isLoading: factionsLoading, refetch: refetchFactions } = useFactions(versionId);

const factionOptions = computed(() => {
  console.log('fetch factions')
  if (!factions.value) return [];
  const values = factions.value.map(f => ({ label: f.screen_name || f.key, value: f.key }))
  console.log('factions', values)
  return values;
});

// Récupération des unités
const factionKey = computed(() => selectedFaction.value?.value ?? '');
const { data: units, isLoading: unitsLoading, refetch: refetchUnits } = useUnits(versionId, factionKey);
const unitOptions = computed(() => {
  if (!units.value) return [];
  return units.value.map(u => ({ label: u.land_unit?.onscreen_name || u.unit, value: u.unit }));
});

// Ajout d'un computed pour grouper les unités par groupe
const groupedUnits = computed(() => {
  if (!units.value) return {};
  const groups: Record<string, typeof units.value> = {};
  for (const unit of units.value) {
    const group = unit.group || 'Autres';
    if (!groups[group]) groups[group] = [];
    groups[group].push(unit);
  }
  return groups;
});

// Navigation automatique
watch(selectedVersion, async (val) => {
  if (val) {
    step.value = 'faction';
    selectedFaction.value = null;
    selectedUnit.value = null;
    await refetchFactions();
    console.log('factions', factions.value)
  }
});
watch(selectedFaction, (val) => {
  if (val) {
    step.value = 'unit';
    selectedUnit.value = null;
    refetchUnits();
  }
});

// Quand une unité est choisie, on émet la valeur
watch(selectedUnit, (val) => {
  if (val) {
    // On ferme le dialog et on émet la valeur
    dialogVisible.value = false;
    emit('update:modelValue', val.value);
  }
});
</script>

<style scoped>
.custom{
  min-width: 90dvw;
  max-width: 90dvw;
}
.faction-icons-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.faction-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;
  padding: 0.5rem;
  transition: box-shadow 0.2s, background 0.2s;
}
.faction-icon-container.selected {
  background: #e3f2fd;
  box-shadow: 0 0 0 2px #1976d2;
}
.faction-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-bottom: 0.25rem;
}
.faction-label {
  font-size: 0.85rem;
  text-align: center;
  max-width: 70px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.unit-icons-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.unit-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;
  padding: 0.5rem;
  transition: box-shadow 0.2s, background 0.2s;
}
.unit-icon-container.selected {
  background: #e3f2fd;
  box-shadow: 0 0 0 2px #1976d2;
}
.unit-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-bottom: 0.25rem;
}
.unit-label {
  font-size: 0.85rem;
  text-align: center;
  max-width: 70px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.group-label {
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}
</style>