import { defineStore } from 'pinia'
import type { Unit } from '@tww3-brawl/sdk/src/types'

// Type pour la sélection d'unité avec version
interface UnitSelection {
  unit: Unit;
  version: { label: string; value: string };
}

export const useUnitStore = defineStore('unit', {
  state: () => {
    return {
      leftUnit: null as UnitSelection | null,
      rightUnit: null as UnitSelection | null,
    }
  },
  actions: {
    setLeftUnit(selection: UnitSelection | null) {
      this.leftUnit = selection
    },
    setRightUnit(selection: UnitSelection | null) {
      this.rightUnit = selection
    },
    clearUnits() {
      this.leftUnit = null
      this.rightUnit = null
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
})