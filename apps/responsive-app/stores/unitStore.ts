import { defineStore } from 'pinia';
import {
  defaultUnitBonus,
  unitWithBonus,
  type UnitBonus,
  type UnitWithEntityNumberAndBonus,
} from '~/types/unit';
import { calculateWinner } from '@tww3-brawl/sdk/src/logic/twoSideCalculations';

export const useUnitStore = defineStore('unit', {
  state: () => {
    return {
      left: null as UnitWithEntityNumberAndBonus | null,
      right: null as UnitWithEntityNumberAndBonus | null,
    };
  },
  actions: {
    setUnit(
      unit_side: 'left' | 'right',
      selection: UnitWithEntityNumberAndBonus | null
    ) {
      if (selection) {
        this[unit_side] = selection;
        this[unit_side].bonus = defaultUnitBonus();
      } else {
        this[unit_side] = null;
      }
    },
    setUnitBonus(unit_side: 'left' | 'right', bonus: UnitBonus | null) {
      if (!this[unit_side]) {
        return;
      }
      if (bonus) {
        this[unit_side].bonus = bonus;
      } else {
        this[unit_side].bonus = defaultUnitBonus();
      }
    },
    setUnitEntityCount(unit_side: 'left' | 'right', entityCount: number) {
      if (!this[unit_side]) {
        return;
      }
      this[unit_side].entityNumber = entityCount;
    },
    clearUnits() {
      this.left = null;
      this.right = null;
    },
  },
  getters: {
    /**
     * Calculates the winner and combat statistics between the two selected units
     * @returns Object with winner, hits needed, and remaining health, or null if units are not selected
     */
    combatResult(): ReturnType<typeof calculateWinner> | null {
      if (!this.left?.selection.unit || !this.right?.selection.unit) {
        return null;
      }
      return calculateWinner(
        unitWithBonus(this.left),
        unitWithBonus(this.right)
      );
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
});
