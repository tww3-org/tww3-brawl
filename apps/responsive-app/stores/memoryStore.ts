import { defineStore } from 'pinia'
import type { Version } from '@tww3-brawl/sdk/src/types'

export const useMemoryStore = defineStore('memory', {
  state: () => {
    return {
      last_version: null as Version | null,
    }
  },
  actions: {
    setLastVersion(version: Version | null) {
      this.last_version = version
    },
    clearSession() {
      this.last_version = null
    }
  },
  persist: {
    storage: sessionStorage,
    key: 'tww3-brawl-memory'
  }
})
