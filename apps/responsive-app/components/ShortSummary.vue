<template>
  <div class="short-summary">
    <div v-if="combatResult" class="combat-result">
      <!-- Winner information -->
      <div class="winner-section">
        <p>
          <span class="winner-title text-emphasized" :class="winnerClass">{{ winnerName }}</span> wins!
        </p>
        <p class="hits-info">
          Takes {{ combatResult.hitsNeeded.toFixed(1) }} hits to defeat
          <span class="loser-name text-emphasized" :class="loserClass">{{ loserName }}</span>, with
        </p>
      </div>

      <!-- Health display with circular progress -->
      <div class="health-display">

        <q-circular-progress show-value :value="combatResult.remainingHealth * 100" size="70px"
          :thickness="0.22" :color="healthColor" track-color="grey-3" class="q-ma-md">
          {{ (combatResult.remainingHealth * 100).toFixed(1) }}%
        </q-circular-progress>
        <span class="health-label">Remaining Health</span>
      </div>

      <!-- Gold damage display: one circle shared between left (positive) and right (negative) -->
      <div v-if="goldDamage" class="gold-display">
        <q-circular-progress show-value :value="goldDamage.leftShare" size="70px"
          :thickness="0.22" color="positive" track-color="negative" class="q-ma-md">
          {{ Math.round(goldDamage.leftShare) }}%
        </q-circular-progress>
        <div class="gold-info">
          <span class="gold-label">Gold damage</span>
          <span class="gold-amounts">
            <span class="text-positive">{{ Math.round(goldDamage.left) }}</span>
            /
            <span class="text-negative">{{ Math.round(goldDamage.right) }}</span>
          </span>
        </div>
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
import { calculateGoldDamage } from '@tww3-brawl/sdk/src/logic/twoSideCalculations';
import { getUnitDisplayName } from '@tww3-brawl/sdk/src/utils/getUnitDisplayName';
import { unitWithBonus } from '~/types/unit';

const unitStore = useUnitStore();

// Get combat result from store
const combatResult = computed(() => unitStore.combatResult);

// Computed properties for display
const winnerName = computed(() => {
  if (!combatResult.value) return '';

  const winnerSelection = combatResult.value.winner === 'left'
    ? unitStore.left?.selection
    : unitStore.right?.selection;

  return winnerSelection?.displayName
    || (winnerSelection?.unit ? getUnitDisplayName(winnerSelection.unit) : 'Unknown Unit');
});

const loserName = computed(() => {
  if (!combatResult.value) return '';

  const loserSelection = combatResult.value.winner === 'left'
    ? unitStore.right?.selection
    : unitStore.left?.selection;

  return loserSelection?.displayName
    || (loserSelection?.unit ? getUnitDisplayName(loserSelection.unit) : 'Unknown Unit');
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
  const health = (combatResult.value?.remainingHealth || 0) * 100;

  if (health >= 80) return 'green';
  if (health >= 60) return 'light-green';
  if (health >= 40) return 'orange';
  if (health >= 20) return 'deep-orange';
  return 'red';
});

// Calculate gold damage inflicted by each side
const goldDamage = computed(() => {
  if (!combatResult.value || !unitStore.left || !unitStore.right) {
    return null;
  }

  const winnerIsLeft = combatResult.value.winner === 'left';
  const winnerUnit = winnerIsLeft ? unitStore.left : unitStore.right;
  const loserUnit = winnerIsLeft ? unitStore.right : unitStore.left;

  // Use remainingHealth as winRatio (how decisively the winner wins)
  const result = calculateGoldDamage(
    unitWithBonus(winnerUnit),
    unitWithBonus(loserUnit),
    combatResult.value.remainingHealth
  );

  if (!result) return null;

  // Map winner/loser amounts back to left/right sides
  const left = winnerIsLeft ? result.winner : result.loser;
  const right = winnerIsLeft ? result.loser : result.winner;
  const total = left + right;

  return {
    left,
    right,
    // Neutral 50% when there is no gold damage at all
    leftShare: total > 0 ? (left / total) * 100 : 50
  };
});
</script>

<style scoped lang="scss">
.short-summary {
  padding: 20px;
  text-align: center;
  @include blurred-background;
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
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.health-progress {
  margin: 0 auto;
}

.health-label {
  font-size: 0.9rem;
  color: #666;
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

.gold-display {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.gold-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.gold-label {
  font-size: 0.9rem;
  color: #666;
}

.gold-amounts {
  font-weight: bold;
}
</style>