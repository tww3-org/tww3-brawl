import { defineStore } from 'pinia'
import type { UnitSelection, UnitWithEntityNumber } from '~/types/unit'
import { calculateWinner } from '@tww3-brawl/sdk/src/logic/twoSideCalculations'

export const useUnitStore = defineStore('unit', {
  state: () => {
    return {
      leftUnit: null as UnitWithEntityNumber | null,
      rightUnit: null as UnitWithEntityNumber | null,
    }
  },
  actions: {
    setLeftUnit(selection: UnitWithEntityNumber | null) {
      if (selection) {
        // const maxEntityCount = selection.unit?.num_men || 1;
        // const defaultEntityCount = Math.max(1, maxEntityCount / 10);
        
        this.leftUnit = selection;
      } else {
        this.leftUnit = null;
      }
    },
    setRightUnit(selection: UnitWithEntityNumber | null) {
      if (selection) {
        // const maxEntityCount = selection.unit?.num_men || 1;
        // const defaultEntityCount = Math.max(1, maxEntityCount / 10);
        
        this.rightUnit = selection
      } else {
        this.rightUnit = null;
      }
    },
    setLeftUnitEntityCount(entityCount: number) {
      if (this.leftUnit) {
        this.leftUnit.entityNumber = entityCount;
      }
    },
    setRightUnitEntityCount(entityCount: number) {
      if (this.rightUnit) {
        this.rightUnit.entityNumber = entityCount;
      }
    },
    clearUnits() {
      this.leftUnit = null
      this.rightUnit = null
    }
  },
  getters: {
    /**
     * Calculates the winner and combat statistics between the two selected units
     * @returns Object with winner, hits needed, and remaining health, or null if units are not selected
     */
    combatResult(): ReturnType<typeof calculateWinner> | null {
      if (!this.leftUnit?.selection.unit || !this.rightUnit?.selection.unit) {
        return null
      }
      return calculateWinner(this.leftUnit, this.rightUnit)
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
})