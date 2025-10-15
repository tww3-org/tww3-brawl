<template>
  <div class="row items-center q-gutter-x-sm">
    <q-btn label="Pick a Unit" color="primary" @click="dialogVisible = true" />
    <q-dialog v-model="dialogVisible">
      <q-card class="custom">
        <q-card-section class="q-card-section-custom">
          <q-carousel ref="carouselRef" :padding="false" v-model="step" :autoplay="false" transition-prev="slide-left"
            transition-next="slide-right" aria-hidden="true" class="q-carousel-custom">

            <q-carousel-slide name="version" key="version">
              <div class="q-mb-md">
                <q-select v-model="selectedVersion" :options="versionOptions" :loading="versionsLoading"
                  label="Versions" dense outlined option-label="name" option-value="id" />

                  <div v-if="versions && step === 'version'" class="version-icons-row">
                    <SquarePortrait v-if="versions && step === 'version'" v-for="version in versions" :key="version.id" :label="version.name" 
                    :selected="(selectedVersion && selectedVersion.id === version.id) || false"
                    @click="selectVersionAndNext(version)">
                      <img :src="getVersionPortrait(version)" class="square-icon-image" :alt="version.name" />
                    </SquarePortrait>
                </div>
              </div>

            </q-carousel-slide>

            <q-carousel-slide name="faction" key="faction">
              <div class="q-mb-md">
                <q-select v-model="selectedFaction" :options="factionOptions" :loading="factionsLoading"
                  :disable="!selectedVersion || factionsLoading" label="Faction" dense outlined
                  option-label="screen_name" option-value="key" />
                <div v-if="factions && step === 'faction'" class="faction-icons-row">
                  <SquarePortrait v-for="faction in factions" :key="faction.key" 
                    :label="faction.subculture?.name || faction.key" 
                    :selected="(selectedFaction && selectedFaction.key === faction.key) || false"
                    @click="selectFactionAndNext(faction)">
                    <img v-if="getFactionPortrait(versionId, faction)"
                    :src="getFactionPortrait(versionId, faction)" :alt="faction.screen_name || faction.key" />
                  </SquarePortrait>
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
                        @click="selectUnitAndFinish(unit)">
                        <UnitPortrait :versionId="versionId" :unit="unit"
                          :selected="selectedUnit && selectedUnit.unit === unit.unit" />
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
          <q-btn v-else label="Back" flat dense @click="goToPreviousStep" />

          <q-btn v-if="step !== 'unit'"
            :disable="(step === 'version' && !selectedVersion) || (step === 'faction' && !selectedFaction)" label="Next"
            color="primary" flat dense @click="goToNextStep" />
          <q-btn v-else :disable="!selectedUnit || !selectedVersion || !selectedFaction" label="Finish" color="primary"
            flat dense
            @click="() => { dialogVisible = false; if (selectedUnitSelection) emit('update:unitSelection', selectedUnitSelection) }" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { QCarousel } from 'quasar';
import UnitPortrait from './UnitPortrait.vue';
import type { Unit } from '@tww3-brawl/sdk/src/types';
import { useVersions } from '~/composables/useVersions';
import { useFactions } from '~/composables/useFactions';
import { useFactionUnits } from '~/composables/useFactionUnits';
import { getFactionPortrait } from '@tww3-brawl/sdk/src/utils/getFactionPortrait';
import SquarePortrait from './SquarePortrait.vue';
import { getVersionPortrait } from '@tww3-brawl/sdk/src/utils/getVersionPortrait';
import type { UnitSelection } from '~/types/unit';
import type { Version } from '@tww3-brawl/sdk/src/types';
import type { Faction } from '@tww3-brawl/sdk/src/types';
import { useMemoryStore } from '~/stores/memoryStore';

const carouselRef = ref<QCarousel | null>(null);
const step = ref<'version' | 'faction' | 'unit'>('version');
const dialogVisible = ref(false);

// Initialize memory store
const memoryStore = useMemoryStore();

const props = defineProps<{
  unitSelection: UnitSelection | null
  version: string | null
}>();

const emit = defineEmits<{
  'update:unitSelection': [value: UnitSelection]
  'update:version': [value: string]
}>();


// Version/faction/unit selection
const selectedUnitSelection = ref<UnitSelection | null>(null);

// Computed to safely access properties
const selectedVersion = computed({
  get: () => {
    // Si on a une version dans selectedUnitSelection, l'utiliser
    if (selectedUnitSelection.value?.version) {
      return selectedUnitSelection.value.version;
    }
    // Sinon, utiliser la version en mémoire si elle existe
    return memoryStore.last_version;
  },
  set: (value: Version | null) => {
    // Mettre à jour la mémoire
    memoryStore.setLastVersion(value);

    if (selectedUnitSelection.value) {
      selectedUnitSelection.value.version = value!;
    } else if (value) {
      selectedUnitSelection.value = { unit: undefined, version: value, faction: undefined };
    }
  }
});

const selectedFaction = computed({
  get: () => selectedUnitSelection.value?.faction || null,
  set: (value: Faction | null) => {
    if (selectedUnitSelection.value) {
      selectedUnitSelection.value.faction = value!;
    } else if (value) {
      selectedUnitSelection.value = { unit: undefined, version: undefined, faction: value };
    }
  }
});

const selectedUnit = computed({
  get: () => selectedUnitSelection.value?.unit || null,
  set: (value: Unit | null) => {
    if (selectedUnitSelection.value) {
      selectedUnitSelection.value.unit = value!;
    } else if (value) {
      selectedUnitSelection.value = { unit: value, version: undefined, faction: undefined };
    }
  }
});

// Fetch versions
const { data: versions, isLoading: versionsLoading } = useVersions();
const versionOptions = computed(() => {
  if (!versions.value) return [];
  console.log(versions.value);
  return versions.value;
});

// Fetch factions
const versionId = computed(() => {
  return selectedUnitSelection.value?.version?.id ?? ''
});

const { data: factions, isLoading: factionsLoading, refetch: refetchFactions } = useFactions(versionId);

const factionOptions = computed(() => {
  if (!factions.value) return [];
  return factions.value;
});

// Fetch units
const factionKey = computed(() => selectedUnitSelection.value?.faction?.key ?? '');
const { data: units, isLoading: unitsLoading, refetch: refetchUnits } = useFactionUnits(versionId, factionKey);
const unitOptions = computed(() => {
  if (!units.value) return [];
  return units.value.map(u => ({ label: u.land_unit?.onscreen_name || u.unit, value: u.unit }));
});

// Add computed to group units by group
const groupedUnits = computed(() => {
  if (!units.value) return {};
  const groups: Record<string, typeof units.value> = {};
  for (const unit of units.value) {
    const group = unit.group || 'Autres';
    if (!groups[group]) groups[group] = [];
    groups[group].push(unit);
  }
  // Here, iterate over each group to keep only the first unit per land_unit.onscreen_name that has the least land_unit.battle_entity.hit_points for each group. This is to avoid duplicates that have the same name with different HP.
  const filteredGroups: Record<string, typeof units.value> = {};
  for (const [groupName, unitsList] of Object.entries(groups)) {
    // Group by onscreen_name
    const byName: Record<string, typeof units.value> = {};
    for (const unit of unitsList) {
      const name = unit.land_unit?.onscreen_name || unit.unit;
      if (!byName[name]) byName[name] = [];
      byName[name].push(unit);
    }
    // For each name, keep the one with the least HP
    const filtered: typeof units.value = [];
    for (const name in byName) {
      const minHpUnit = byName[name].sort((a, b) => {
        const hpA = a.recruitment_cost || 0;
        const hpB = b.recruitment_cost || 0;
        return hpA - hpB;
      })[0];
      filtered.push(minHpUnit);
    }
    // Sort units first by recruitment cost then alphabetically
    filtered.sort((a, b) => {
      const costA = a.recruitment_cost || 0;
      const costB = b.recruitment_cost || 0;

      // First sort by price (ascending)
      if (costA !== costB) {
        return costA - costB;
      }

      // If same price, sort alphabetically
      const nameA = a.land_unit?.onscreen_name || a.unit;
      const nameB = b.land_unit?.onscreen_name || b.unit;
      return nameA.localeCompare(nameB);
    });
    filteredGroups[groupName] = filtered;
  }

  // Define group order
  const groupOrder = [
    'Lords',
    'Heroes',
    'Infantry',
    'Missile Infantry',
    'Cavalry & Chariots',
    'Missile Cavalry & Chariots',
    'Artillery & War Machines'
  ];

  // Create a new object with groups in the specified order
  const orderedGroups: Record<string, typeof units.value> = {};

  // First add groups in the specified order
  for (const groupName of groupOrder) {
    if (filteredGroups[groupName]) {
      orderedGroups[groupName] = filteredGroups[groupName];
    }
  }

  // Then add all other unspecified groups
  for (const [groupName, unitsList] of Object.entries(filteredGroups)) {
    if (!groupOrder.includes(groupName)) {
      orderedGroups[groupName] = unitsList;
    }
  }

  return orderedGroups;
});

// Watch dialog visibility to start at the right step
watch(dialogVisible, async (isVisible) => {
  if (isVisible) {
    // Si pas d'unité sélectionnée (ou une unité invalide) et qu'on a une version en mémoire, commencer à l'étape faction
    if ((!selectedUnitSelection.value || !selectedUnitSelection.value.unit) && memoryStore.last_version) {
      selectedVersion.value = memoryStore.last_version;
      step.value = 'faction';
      await refetchFactions();
    }
  }
});

// Refetch based on step
watch(step, async (newStep) => {
  if (newStep === 'version') {
    // Versions are already loaded by useVersions(), no need to refetch
    // Reset faction and unit when returning to version
    if (selectedUnitSelection.value) {
      selectedUnitSelection.value.faction = undefined as any;
      selectedUnitSelection.value.unit = undefined as any;
    }
  } else if (newStep === 'faction') {
    await refetchFactions();
    // Reset unit when going to faction
    if (selectedUnitSelection.value) {
      selectedUnitSelection.value.unit = undefined as any;
    }
  } else if (newStep === 'unit') {
    await refetchUnits();
  }
});

// Explicit navigation functions
const goToNextStep = () => {
  if (step.value === 'version' && selectedVersion.value) {
    selectedFaction.value = undefined as any;
    selectedUnit.value = undefined as any;
    step.value = 'faction';
  } else if (step.value === 'faction' && selectedFaction.value) {
    selectedUnit.value = undefined as any;
    step.value = 'unit';
  }
};

const goToPreviousStep = () => {
  if (step.value === 'unit') {
    selectedUnit.value = undefined as any;
    step.value = 'faction';
  } else if (step.value === 'faction') {
    selectedFaction.value = undefined as any;
    step.value = 'version';
  }
};

// Function to select a version and go to next step
const selectVersionAndNext = (version: Version) => {
  selectedVersion.value = version;
  step.value = 'faction';
};

// Function to select a faction and go to next step
const selectFactionAndNext = (faction: Faction) => {
  selectedFaction.value = faction;
  step.value = 'unit';
};

// Function to select a unit and finish
const selectUnitAndFinish = (unit: Unit) => {
  selectedUnit.value = unit;
  if (selectedUnitSelection.value) {
    dialogVisible.value = false;
    emit('update:unitSelection', selectedUnitSelection.value);
  }
};
</script>

<style scoped lang="scss">
// Variables and mixins are now imported automatically from variables.scss
@mixin square-icon-size {
  width: var(--square-icon-size);
  height: var(--square-icon-size);
}

.square-icon-image {
  width: calc(var(--square-icon-size) - 10px);
}

// Dialog and carousel styles
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

// Version styles
.version-icons-row {
  @include icon-row-layout;
  gap: 0.1rem;
}

.version-icon-container {
  @include icon-container-base;
  @include icon-container-states;
  @include square-icon-size;
}

.version-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.version-label {
  @include icon-label;
}

// Faction styles
.faction-icons-row {
  @include icon-row-layout;
}

.faction-icon-container {
  @include icon-container-base;
  @include icon-container-states;
  @include square-icon-size;
}

.faction-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  object-fit: contain;
  margin-bottom: 0.25rem;
}

.faction-label {
  @include icon-label;
}

// Unit styles
.unit-icons-row {
  @include icon-row-layout;
}

.unit-icon-container {
  @include icon-container-base;
  padding: 0;
  gap: 0;
  position: relative;
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
  bottom: 100%;
  transform: translateX(-50%);
  background: rgba(30, 30, 30, 0.95);
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  white-space: nowrap;
  z-index: 10;
  margin-bottom: 0.5rem;
  pointer-events: none;
}

.unit-icon-container:hover  {
  

  .unit-label {
    display: block;
  }
}

// Group label
.group-label {
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}
</style>