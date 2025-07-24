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
              </div>

            </q-carousel-slide>

            <q-carousel-slide name="unit" key="unit">
              <div class="q-mb-md">
                <q-select
                  v-model="selectedUnit"
                  :options="unitOptions"
                  :loading="unitsLoading"
                  :disable="!selectedFaction || unitsLoading"
                  label="Unité"
                  dense outlined
                />
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
  width: 800px;
  max-width: 90dvw;
}
</style>