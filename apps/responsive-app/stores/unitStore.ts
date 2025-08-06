import { defineStore } from 'pinia'
import type { UnitSelection, UnitWithEntityCount } from '~/types/unit'
import { calculateWinner } from '@tww3-brawl/sdk/src/logic/twoSideCalculations'

export const useUnitStore = defineStore('unit', {
  state: () => {
    return {
      leftUnit: null as UnitWithEntityCount | null,
      rightUnit: null as UnitWithEntityCount | null,
    }
  },
  actions: {
    setLeftUnit(selection: UnitSelection | null) {
      if (selection) {
        const maxEntityCount = selection.unit?.num_men || 1;
        const defaultEntityCount = Math.min(16, maxEntityCount);
        
        this.leftUnit = {
          selection,
          entityCount: defaultEntityCount
        };
      } else {
        this.leftUnit = null;
      }
    },
    setRightUnit(selection: UnitSelection | null) {
      if (selection) {
        const maxEntityCount = selection.unit?.num_men || 1;
        const defaultEntityCount = Math.min(15, maxEntityCount);
        
        this.rightUnit = {
          selection,
          entityCount: defaultEntityCount
        };
      } else {
        this.rightUnit = null;
      }
    },
    setLeftUnitEntityCount(entityCount: number) {
      if (this.leftUnit) {
        this.leftUnit.entityCount = entityCount;
      }
    },
    setRightUnitEntityCount(entityCount: number) {
      if (this.rightUnit) {
        this.rightUnit.entityCount = entityCount;
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
      
      return calculateWinner(this.leftUnit.selection.unit, this.rightUnit.selection.unit)
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
})