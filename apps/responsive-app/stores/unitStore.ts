import { defineStore } from 'pinia';
import {
  defaultEffectState,
  defaultUnitBonus,
  displayedEffects,
  effectiveUnits,
  type UnitEffectState,
  type UnitBonus,
  type UnitWithEntityNumberAndBonus,
} from '~/types/unit';
import { getEffect } from '@tww3-brawl/sdk';
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
        this[unit_side] = {
          ...selection,
          bonus: selection.bonus ?? defaultUnitBonus(),
          effects: selection.effects ?? defaultEffectState(),
        };
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
    /** Copie de l'état des effets d'un côté (défaut si absent, ex. ancien état persisté) */
    effectState(unit_side: 'left' | 'right'): UnitEffectState {
      const state = this[unit_side]?.effects;
      return { overrides: { ...state?.overrides }, added: [...(state?.added ?? [])] };
    },
    resetEffects(unit_side: 'left' | 'right') {
      if (this[unit_side]) {
        this[unit_side].effects = defaultEffectState();
      }
    },
    /** Bascule l'activation d'un effet affiché sur la carte */
    toggleEffect(unit_side: 'left' | 'right', id: string) {
      const side = this[unit_side];
      if (!side) {
        return;
      }
      const other = this[unit_side === 'left' ? 'right' : 'left'];
      const current = displayedEffects(side, other).find(e => e.id === id);
      if (!current) {
        return;
      }
      const state = this.effectState(unit_side);
      state.overrides[id] = !current.active;
      side.effects = state;
    },
    /** Ajoute un effet du catalogue sur la carte (sans effet s'il est déjà affiché) */
    addEffect(unit_side: 'left' | 'right', id: string) {
      const side = this[unit_side];
      if (!side || !getEffect(id)) {
        return;
      }
      const other = this[unit_side === 'left' ? 'right' : 'left'];
      if (displayedEffects(side, other).some(e => e.id === id)) {
        return;
      }
      const state = this.effectState(unit_side);
      state.added.push(id);
      side.effects = state;
    },
    /** Retire un effet ajouté manuellement (et son override) */
    removeEffect(unit_side: 'left' | 'right', id: string) {
      const side = this[unit_side];
      if (!side) {
        return;
      }
      const state = this.effectState(unit_side);
      state.added = state.added.filter(a => a !== id);
      delete state.overrides[id];
      side.effects = state;
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
      const { left, right } = effectiveUnits(this.left, this.right);
      if (!left || !right) {
        return null;
      }
      return calculateWinner(left, right);
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
});
