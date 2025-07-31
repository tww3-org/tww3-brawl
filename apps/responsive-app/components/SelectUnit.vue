<template>
  <div class="row items-center q-gutter-x-sm">
    <q-btn label="Pick a Unit" color="primary" @click="dialogVisible = true" />
    <q-btn round flat color="grey" icon="settings" />
    <q-dialog v-model="dialogVisible">
      <q-card class="custom">
        <q-card-section class="q-card-section-custom">
          <q-carousel ref="carouselRef" :padding="false" v-model="step" :autoplay="false" transition-prev="slide-left"
            transition-next="slide-right" aria-hidden="true" class="q-carousel-custom">

            <q-carousel-slide name="version" key="version">
              <div class="q-mb-md">
                <q-select v-model="selectedVersion" :options="versionOptions" :loading="versionsLoading"
                  label="Versions" dense outlined option-label="name" option-value="id" />
              </div>

            </q-carousel-slide>

            <q-carousel-slide name="faction" key="faction">
              <div class="q-mb-md">
                <q-select v-model="selectedFaction" :options="factionOptions" :loading="factionsLoading"
                  :disable="!selectedVersion || factionsLoading" label="Faction" dense outlined option-label="screen_name" option-value="key" />
                <div v-if="factions && step === 'faction'" class="faction-icons-row">
                  <div v-for="faction in factions" :key="faction.key" class="faction-icon-container"
                    :class="{ selected: selectedFaction && selectedFaction.key === faction.key }"
                    @click="selectedFaction = faction">
                    <img v-if="getFactionPortrait(versionId, faction)" :src="getFactionPortrait(versionId, faction)"
                      :alt="faction.screen_name || faction.key" class="faction-icon" />
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
                        <div v-for="unit in unitsList" :key="unit.unit" class="unit-icon-container"
                          :class="{ selected: selectedUnit && selectedUnit.value === unit.unit }"
                          @click="selectedUnit = { label: unit.land_unit?.onscreen_name || unit.unit, value: unit.unit, unit: unit }">
                          <img v-if="getUnitPortrait(versionId, unit)" :src="getUnitPortrait(versionId, unit)"
                            :alt="unit.land_unit?.onscreen_name || unit.unit" class="unit-icon" />
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
        <q-card-actions class="text-primary q-card-actions-custom" align="between">
          <q-btn v-if="step === 'version'" label="Fermer" flat dense @click="dialogVisible = false" />
          <q-btn v-else label="Précédent" flat dense @click="carouselRef?.previous()" />

          <q-btn v-if="step !== 'unit'"
            :disable="(step === 'version' && !selectedVersion) || (step === 'faction' && !selectedFaction)"
            label="Suivant" color="primary" flat dense @click="carouselRef?.next()" />
          <q-btn v-else :disable="!selectedUnit || !selectedVersion || !selectedFaction" label="Finir" color="primary" flat dense
            @click="() => { dialogVisible = false; if (selectedUnit && selectedVersion && selectedFaction) emit('update:modelValue', { unit: selectedUnit.unit, version: selectedVersion, faction: selectedFaction }) }" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { QCarousel } from 'quasar';
import type { Unit } from '@tww3-brawl/sdk/src/types';
import { useVersions } from '~/composables/useVersions';
import { useFactions } from '~/composables/useFactions';
import { useUnits } from '~/composables/useUnits';
import { getFactionPortrait } from '@tww3-brawl/sdk/src/utils/getFactionPortrait';
import { getUnitPortrait } from '@tww3-brawl/sdk/src/utils/getUnitPortrait';
import type { UnitSelection } from '~/types/unit';
import type { Version } from '@tww3-brawl/sdk/src/types';
import type { Faction } from '@tww3-brawl/sdk/src/types';

const carouselRef = ref<QCarousel | null>(null);
const step = ref<'version' | 'faction' | 'unit'>('version');
const dialogVisible = ref(false);

const props = defineProps<{
  modelValue?: UnitSelection
  version?: string
}>();

const emit = defineEmits<{
  'update:modelValue': [value: UnitSelection]
  'update:version': [value: string]
}>();


// Sélection version/faction/unité
const selectedVersion = ref<Version | null>(null);
const selectedFaction = ref<Faction | null>(null);
const selectedUnit = ref<{ label: string; value: string; unit: Unit } | null>(null);

// Récupération des versions
const { data: versions, isLoading: versionsLoading } = useVersions();
const versionOptions = computed(() => {
  if (!versions.value) return [];
  return versions.value;
});

// Récupération des factions
const versionId = computed(() => {
  console.log('selectedVersion', selectedVersion.value)
  return selectedVersion.value?.id ?? ''
});

const { data: factions, isLoading: factionsLoading, refetch: refetchFactions } = useFactions(versionId);

const factionOptions = computed(() => {
  if (!factions.value) return [];
  return factions.value;
});

// Récupération des unités
const factionKey = computed(() => selectedFaction.value?.key ?? '');
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
  // Ici, itère sur chacun des groupes pour ne garder la première unité par land_unit.onscreen_name qui a le moins de land_unit.battle_entity.hit_points pour chaque groupe. Il s'agit d'éviter les doublons qui porte le même nom avec des hp différents.
  const filteredGroups: Record<string, typeof units.value> = {};
  for (const [groupName, unitsList] of Object.entries(groups)) {
    // On regroupe par onscreen_name
    const byName: Record<string, typeof units.value> = {};
    for (const unit of unitsList) {
      const name = unit.land_unit?.onscreen_name || unit.unit;
      if (!byName[name]) byName[name] = [];
      byName[name].push(unit);
    }
    // Pour chaque nom, on garde celui avec le moins de HP
    const filtered: typeof units.value = [];
    for (const name in byName) {
      const unitsWithName = byName[name];
      let minHpUnit = unitsWithName[0];
      for (const u of unitsWithName) {
        const hp = u.land_unit?.battle_entity?.hit_points ?? 0;
        const minHp = minHpUnit.land_unit?.battle_entity?.hit_points ?? 0;
        if (hp < minHp) {
          minHpUnit = u;
        }
      }
      filtered.push(minHpUnit);
    }
    // Trier les unités d'abord par prix de recrutement puis par ordre alphabétique
    filtered.sort((a, b) => {
      const costA = a.recruitment_cost || 0;
      const costB = b.recruitment_cost || 0;

      // D'abord trier par prix (croissant)
      if (costA !== costB) {
        return costA - costB;
      }

      // Si même prix, trier par ordre alphabétique
      const nameA = a.land_unit?.onscreen_name || a.unit;
      const nameB = b.land_unit?.onscreen_name || b.unit;
      return nameA.localeCompare(nameB);
    });
    filteredGroups[groupName] = filtered;
  }

  // Définir l'ordre des groupes
  const groupOrder = [
    'Lords',
    'Heroes',
    'Infantry',
    'Missile Infantry',
    'Cavalry & Chariots',
    'Missile Cavalry & Chariots',
    'Artillery & War Machines'
  ];

  // Créer un nouvel objet avec les groupes dans l'ordre spécifié
  const orderedGroups: Record<string, typeof units.value> = {};

  // D'abord ajouter les groupes dans l'ordre spécifié
  for (const groupName of groupOrder) {
    if (filteredGroups[groupName]) {
      orderedGroups[groupName] = filteredGroups[groupName];
    }
  }

  // Ensuite ajouter tous les autres groupes non spécifiés
  for (const [groupName, unitsList] of Object.entries(filteredGroups)) {
    if (!groupOrder.includes(groupName)) {
      orderedGroups[groupName] = unitsList;
    }
  }

  return orderedGroups;
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
  if (val && selectedVersion.value && selectedFaction.value) {
    // On ferme le dialog et on émet la valeur
    dialogVisible.value = false;
    emit('update:modelValue', { unit: val.unit, version: selectedVersion.value, faction: selectedFaction.value });
  }
});

// Initialiser les refs quand modelValue est fourni
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Initialiser la version
    selectedVersion.value = newValue.version;
    
    // Initialiser la faction
    selectedFaction.value = newValue.faction;
    
    // Initialiser l'unité
    selectedUnit.value = {
      label: newValue.unit.land_unit?.onscreen_name || newValue.unit.unit,
      value: newValue.unit.unit,
      unit: newValue.unit
    };
    
  } else {
    // Réinitialiser si modelValue est null/undefined
    selectedVersion.value = null;
    selectedFaction.value = null;
    selectedUnit.value = null;
    step.value = 'unit';
  }
}, { immediate: true });
</script>

<style scoped>
.custom {
  min-width: 90dvw;
  max-width: 90dvw;
  min-height: 90dvh;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
}

.q-carousel-custom {
  height: 100%;
  min-height: 100%;
}

.q-card-section-custom {
  overflow-y: auto;
  overflow-x: hidden;
}

.q-card-actions-custom {
  margin-top: auto;
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
  position: relative;
}

.unit-icon-container.selected {
  background: #e3f2fd;
  box-shadow: 0 0 0 2px #1976d2;
}

.unit-icon {
  width: auto;
  height: auto;
  object-fit: contain;
  margin-bottom: 0.25rem;
  position: relative;
}

.unit-label {
  display: none;
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  background: rgba(30, 30, 30, 0.95);
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  white-space: nowrap;
  z-index: 10;
  margin-top: 0.5rem;
  pointer-events: none;
}

.unit-icon-container:hover .unit-label {
  display: block;
}

.group-label {
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}
</style>