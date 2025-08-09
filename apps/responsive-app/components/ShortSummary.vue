<template>
  <div class="short-summary">
    <div v-if="combatResult" class="combat-result">
      <!-- Winner information -->
      <div class="winner-section">
        <h2 class="winner-title" :class="winnerClass">
          {{ winnerName }} wins!
        </h2>
        <p class="hits-info">
          Takes {{ combatResult.hitsNeeded.toFixed(1) }} hits to defeat 
          <span class="loser-name" :class="loserClass">{{ loserName }}</span>, with
        </p>
      </div>

      <!-- Health display with circular progress -->
      <div class="health-display">

        <q-circular-progress
        show-value
        font-size="12px"
        :value="combatResult.remainingHealth * 100"
        size="50px"
        :thickness="0.22"
        :color="healthColor"
        track-color="grey-3"
        class="q-ma-md"
      >
      {{ (combatResult.remainingHealth * 100).toFixed(1) }}%
      </q-circular-progress>

        <q-circular-progress
          :model-value="33"
          color="blue"
          size="36px"
          :thickness="0.8"
          show-value
          font-size="16px"
          class="health-progress"
        >
          {{ (combatResult.remainingHealth * 100).toFixed(1) }}%
        </q-circular-progress>
        <p class="health-label">Remaining Health</p>
      </div>
    </div>

    <div v-else class="no-combat">
      <p>Select two units to see combat results</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUnitStore } from '~/stores/unitStore';
import { computed } from 'vue';

const unitStore = useUnitStore();

// Get combat result from store
const combatResult = computed(() => unitStore.combatResult);

// Computed properties for display
const winnerName = computed(() => {
  if (!combatResult.value) return '';
  
  const winnerUnit = combatResult.value.winner === 'left' 
    ? unitStore.leftUnit?.selection.unit 
    : unitStore.rightUnit?.selection.unit;
    
  return winnerUnit?.land_unit?.onscreen_name || 'Unknown Unit';
});

const loserName = computed(() => {
  if (!combatResult.value) return '';
  
  const loserUnit = combatResult.value.winner === 'left' 
    ? unitStore.rightUnit?.selection.unit 
    : unitStore.leftUnit?.selection.unit;
    
  return loserUnit?.land_unit?.onscreen_name || 'Unknown Unit';
});

const winnerClass = computed(() => {
  return combatResult.value?.winner === 'left' ? 'text-positive' : 'text-negative';
});

const loserClass = computed(() => {
  // Si le gagnant est 'left', alors le perdant est 'right' (couleur négative)
  // Si le gagnant est 'right', alors le perdant est 'left' (couleur positive)
  return combatResult.value?.winner === 'left' ? 'bg-negative' : 'bg-positive';
});

// Health color based on percentage with 5 tiers
const healthColor = computed(() => {
  const health = (combatResult.value?.remainingHealth  || 0 )* 100;
  
  if (health >= 80) return 'green';
  if (health >= 60) return 'light-green';
  if (health >= 40) return 'orange';
  if (health >= 20) return 'deep-orange';
  return 'red';
});
</script>

<style scoped>
.short-summary {
  padding: 20px;
  text-align: center;
}

.combat-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.winner-section {
  text-align: center;
}

.winner-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.hits-info {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.health-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.health-progress {
  margin: 0 auto;
}

.health-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.no-combat {
  text-align: center;
  color: #666;
  font-style: italic;
}



/* Loser name styling */
.loser-name {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.loser-name.q-positive {
  background-color: rgba(33, 186, 69, 0.1);
}

.loser-name.q-negative {
  background-color: rgba(193, 0, 21, 0.1);
}
</style>