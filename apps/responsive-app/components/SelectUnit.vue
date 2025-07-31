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
                 <div v-if="versions && step === 'version'" class="version-icons-row">
                   <div v-for="version in versions" :key="version.id" class="version-icon-container"
                     :class="{ selected: selectedVersion && selectedVersion.id === version.id }"
                     @click="selectVersionAndNext(version)">
                     <div class="version-icon">{{ version.name?.charAt(0) || 'V' }}</div>
                     <div class="version-label">{{ version.name }}</div>
                   </div>
                 </div>
               </div>
 
             </q-carousel-slide>

            <q-carousel-slide name="faction" key="faction">
              <div class="q-mb-md">
                <q-select v-model="selectedFaction" :options="factionOptions" :loading="factionsLoading"
                  :disable="!selectedVersion || factionsLoading" label="Faction" dense outlined option-label="screen_name" option-value="key" />
                  <div v-if="factions && step === 'faction'" class="faction-icons-row">
                  <div v-for="faction in factions" :key="faction.key" class="faction-icon-container"
                    :class="{ selected: selectedFaction && selectedFaction.key === faction.key }"
                    @click="selectFactionAndNext(faction)">
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
                          :class="{ selected: selectedUnit && selectedUnit.unit === unit.unit }"
                          @click="selectUnitAndFinish(unit)">
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
          <q-btn v-else label="Précédent" flat dense @click="goToPreviousStep" />

          <q-btn v-if="step !== 'unit'"
            :disable="(step === 'version' && !selectedVersion) || (step === 'faction' && !selectedFaction)"
            label="Suivant" color="primary" flat dense @click="goToNextStep" />
          <q-btn v-else :disable="!selectedUnit || !selectedVersion || !selectedFaction" label="Finir" color="primary" flat dense
            @click="() => { dialogVisible = false; if (selectedUnitSelection) emit('update:modelValue', selectedUnitSelection) }" />
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
const selectedUnitSelection = ref<UnitSelection | null>(null);

// Computed pour accéder aux propriétés de manière sûre
const selectedVersion = computed({
  get: () => selectedUnitSelection.value?.version || null,
  set: (value: Version | null) => {
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

// Récupération des versions
const { data: versions, isLoading: versionsLoading } = useVersions();
const versionOptions = computed(() => {
  if (!versions.value) return [];
  return versions.value;
});

// Récupération des factions
const versionId = computed(() => {
  console.log('selectedUnitSelection', selectedUnitSelection.value)
  return selectedUnitSelection.value?.version?.id ?? ''
});

const { data: factions, isLoading: factionsLoading, refetch: refetchFactions } = useFactions(versionId);

const factionOptions = computed(() => {
  if (!factions.value) return [];
  return factions.value;
});

// Récupération des unités
const factionKey = computed(() => selectedUnitSelection.value?.faction?.key ?? '');
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

// Navigation automatique et logique centralisée
// watch(selectedUnitSelection, (val) => {
//   if (!val) return;
  
//   // Si une version est sélectionnée, passer à l'étape faction
//   if (val.version && !val.faction && step.value === 'version') {
//     console.log('version', val.version);
//     step.value = 'faction';
//   }
  
//   // Si une faction est sélectionnée, passer à l'étape unité
//   if (val.faction && !val.unit && step.value === 'faction') {
//     console.log('faction', val.faction);
//     step.value = 'unit';
//   }
  
//   // Si tout est sélectionné, fermer le dialog et émettre
//   if (val.unit && val.version && val.faction && step.value === 'unit') {
//     console.log('unit', val.unit);
//     // dialogVisible.value = false;
//     emit('update:modelValue', val);
//   }
// }, { deep: true });

// Refetch en fonction de l'étape
watch(step, async (newStep) => {
  console.log('newStep', newStep);
  if (newStep === 'version') {
    // Les versions sont déjà chargées par useVersions(), pas besoin de refetch
    console.log('versions', versions.value);
    // Reset faction et unit quand on revient à version
    if (selectedUnitSelection.value) {
      selectedUnitSelection.value.faction = undefined as any;
      selectedUnitSelection.value.unit = undefined as any;
    }
  } else if (newStep === 'faction') {
    await refetchFactions();
    console.log('factions', factions.value);
    // Reset unit quand on passe à faction
    if (selectedUnitSelection.value) {
      selectedUnitSelection.value.unit = undefined as any;
    }
  } else if (newStep === 'unit') {
    await refetchUnits();
  }
});

// Initialiser les refs quand modelValue est fourni
watch(() => props.modelValue, (newValue) => {
  console.log('newValue', newValue);
  if (newValue) {
    // Initialiser la sélection complète
    selectedUnitSelection.value = newValue;
    
    step.value = 'unit';
  } else {
    // Réinitialiser si modelValue est null/undefined
    selectedUnitSelection.value = null;
    step.value = 'version';
  }
}, { immediate: true });

// Fonctions de navigation explicites
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
    console.log('should go before unit');
    selectedUnit.value = undefined as any;
    step.value = 'faction';
  } else if (step.value === 'faction') {
    selectedFaction.value = undefined as any;
    step.value = 'version';
  }
};

// Fonction pour sélectionner une version et passer à l'étape suivante
const selectVersionAndNext = (version: Version) => {
  selectedVersion.value = version;
  step.value = 'faction';
};

// Fonction pour sélectionner une faction et passer à l'étape suivante
const selectFactionAndNext = (faction: Faction) => {
  selectedFaction.value = faction;
  step.value = 'unit';
};

// Fonction pour sélectionner une unité et terminer
const selectUnitAndFinish = (unit: Unit) => {
  selectedUnit.value = unit;
  if (selectedUnitSelection.value) {
    dialogVisible.value = false;
    emit('update:modelValue', selectedUnitSelection.value);
  }
};
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

.version-icons-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.version-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;
  padding: 0.5rem;
  transition: box-shadow 0.2s, background 0.2s;
}

.version-icon-container.selected {
  background: #e3f2fd;
  box-shadow: 0 0 0 2px #1976d2;
}

.version-icon {
  width: 48px;
  height: 48px;
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
  font-size: 0.85rem;
  text-align: center;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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