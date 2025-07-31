import { defineStore } from 'pinia'
import type { UnitSelection } from '~/types/unit'

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