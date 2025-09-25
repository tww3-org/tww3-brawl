import { defineStore } from 'pinia'
import { defaultUnitBonus, unitWithBonus, type UnitBonus, type UnitSelection, type UnitWithEntityNumberAndBonus } from '~/types/unit'
import { calculateWinner } from '@tww3-brawl/sdk/src/logic/twoSideCalculations'

export const useUnitStore = defineStore('unit', {
  state: () => {
    return {
      leftUnit: null as UnitWithEntityNumberAndBonus | null,
      rightUnit: null as UnitWithEntityNumberAndBonus | null,
    }
  },
  actions: {
    setLeftUnit(selection: UnitWithEntityNumberAndBonus | null) {
      if (selection) {
        // const maxEntityCount = selection.unit?.num_men || 1;
        // const defaultEntityCount = Math.max(1, maxEntityCount / 10);
        
        this.leftUnit = selection;
        this.leftUnit.bonus = defaultUnitBonus();
      } else {
        this.leftUnit = null;
      }
    },
    setRightUnit(selection: UnitWithEntityNumberAndBonus | null) {
      if (selection) {
        // const maxEntityCount = selection.unit?.num_men || 1;
        // const defaultEntityCount = Math.max(1, maxEntityCount / 10);
        
        this.rightUnit = selection
        this.rightUnit.bonus = defaultUnitBonus();
      } else {
        this.rightUnit = null;
      }
    },
    setLeftUnitBonus(unitBonus: UnitBonus | null) {
      if (!this.leftUnit) {
        return;
      }
      if (unitBonus ) {  
        this.leftUnit.bonus = unitBonus;
      } else {
        this.leftUnit.bonus = defaultUnitBonus();
      }
    },
    setRightUnitBonus(unitBonus: UnitBonus | null) {
      if (!this.rightUnit) {
        return;
      }
      if (unitBonus ) {  
        this.rightUnit.bonus = unitBonus;
      } else {
        this.rightUnit.bonus = defaultUnitBonus();
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
      return calculateWinner(unitWithBonus(this.leftUnit), unitWithBonus(this.rightUnit))
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
})