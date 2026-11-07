import { describe, expect, it } from 'vitest';
import type { EffectDefinition, SpellCasts, SpellDefinition, Unit } from '../types';
import { buildDuelPhases, spellWindows } from './spellPhases';
import { EFFECTIVE_UNIT_LAYERS, runLayers } from './unitLayers';
import { calculatePhasedWinner, calculateWinner, type UnitWithEntityNumber } from './twoSideCalculations';

/**
 * Test d'intégration de la feature 003 (SC-003) : sorts des deux côtés (C4/C5), de la déclaration des sorts
 * jusqu'au résultat, sans passer par l'app. Le résultat est comparé à un calcul à la main (voir plus bas).
 */

const makeUnit = (normal: number): Unit => ({
  version: 'v',
  unit: `u${normal}`,
  caste: 'melee_infantry',
  num_men: 100,
  land_unit: {
    num_engines: 0,
    num_mounts: 0,
    onscreen_name: 'u',
    bonus_hit_points: 0,
    battle_entity: { hit_points: 100, size: 'small', type: '' },
  },
  battle_mounts: [],
  health: { unit: 10000, entity: 100 },
  armor: 0,
  attack: 50,
  defense: 30,
  damage: { normal, piercing: 10, is_magical: false, is_fire: false, bonus_v_large: 0, bonus_v_infantry: 0 },
  resistance: { physical: 0, magic: 0, fire: 0, ward_save: 0 },
  icon: '',
});

const side = (unit: Unit): UnitWithEntityNumber => ({ selection: { unit }, entityNumber: 100 });

// Deux sorts de buff de dégâts : « left_buff » +15 pendant 12 s (3 coups), « right_buff » +10 pendant 20 s (5 coups)
const effects: Record<string, EffectDefinition> = {
  left_fx: {
    id: 'left_fx', kind: 'ability', name: 'left_fx', icon: '', placement: 'effects', target: 'self', passive: false,
    polarity: 'positive', modifiers: { damage: { normal: { add: 15 } } }, spell: { spell_id: 'left_buff' },
  },
  right_fx: {
    id: 'right_fx', kind: 'ability', name: 'right_fx', icon: '', placement: 'effects', target: 'self', passive: false,
    polarity: 'positive', modifiers: { damage: { normal: { add: 10 } } }, spell: { spell_id: 'right_buff' },
  },
};
const spell = (id: string, duration: number, fx: string): SpellDefinition => ({
  id, name: id, icon: '', mana_cost: 5,
  normal: { id, name: id, phases: [{ id: `${id}_p`, duration, effects: [fx] }] },
});
const spells = { left_buff: spell('left_buff', 12, 'left_fx'), right_buff: spell('right_buff', 20, 'right_fx') };

/** Chaîne complète : lancers -> fenêtres -> phases -> unités effectives par phase -> résultat */
function duel(left: Unit, right: Unit, leftCasts: SpellCasts, rightCasts: SpellCasts) {
  const phases = buildDuelPhases(spellWindows(leftCasts, rightCasts, spells), effects, spells);
  const units = phases.map(p => ({
    hits: p.end - p.start,
    left: side(runLayers(left, EFFECTIVE_UNIT_LAYERS, { cardEffects: p.leftCardEffects, opponentCardEffects: p.rightCardEffects, catalog: effects })),
    right: side(runLayers(right, EFFECTIVE_UNIT_LAYERS, { cardEffects: p.rightCardEffects, opponentCardEffects: p.leftCardEffects, catalog: effects })),
  }));
  return { phases, result: calculatePhasedWinner(units) };
}

describe('duel par phases : sorts des deux côtés (C4, C5)', () => {
  const left = makeUnit(30);
  const right = makeUnit(30);
  const cast = (id: string): SpellCasts => ({ [id]: { normal: 1, overcast: 0 } });

  it('trois phases [0,3) [3,5) [5,∞) et résultat égal au calcul à la main', () => {
    const { phases, result } = duel(left, right, cast('left_buff'), cast('right_buff'));
    expect(phases.map(p => [p.start, p.end])).toEqual([[0, 3], [3, 5], [5, Infinity]]);

    // Calcul à la main : unités équivalentes construites directement avec les dégâts attendus par phase
    //   phase 1 [0,3) : gauche 30+15 = 45, droite 30+10 = 40 ; phase 2 [3,5) : 30 / 40 ; phase 3 : 30 / 30.
    const p1 = calculateWinner(side(makeUnit(45)), side(makeUnit(40))).phases![0];
    const p2 = calculateWinner(side(makeUnit(30)), side(makeUnit(40))).phases![0];
    const p3 = calculateWinner(side(makeUnit(30)), side(makeUnit(30))).phases![0];
    // Vie de chaque côté = 1 ; `rightNetTaken` = vie perdue par le droit par coup, etc.
    const hitsToKill = (nets: number[]): number => {
      const lengths = [3, 2, Infinity];
      let remaining = 1;
      let hits = 0;
      for (let i = 0; i < nets.length; i++) {
        if (nets[i] * lengths[i] >= remaining) return hits + remaining / nets[i];
        remaining -= nets[i] * lengths[i];
        hits += lengths[i];
      }
      return Infinity;
    };
    const leftKills = hitsToKill([p1.rightNetTaken, p2.rightNetTaken, p3.rightNetTaken]);
    const rightKills = hitsToKill([p1.leftNetTaken, p2.leftNetTaken, p3.leftNetTaken]);
    // Le combat doit traverser au moins la phase 1 pour que le test ait un sens
    expect(Math.min(leftKills, rightKills)).toBeGreaterThan(3);

    expect(result.winner).toBe(leftKills <= rightKills ? 'left' : 'right');
    expect(result.hitsNeeded).toBeCloseTo(Math.min(leftKills, rightKills), 8);
    expect(result.phases?.map(p => [p.start, p.end])).toEqual([[0, 3], [3, 5], [5, Infinity]]);
  });

  it('sans lancer, le résultat est celui de calculateWinner (FR-008)', () => {
    const { phases, result } = duel(left, right, {}, {});
    expect(phases).toHaveLength(1);
    const plain = calculateWinner(side(left), side(right));
    expect(result.winner).toBe(plain.winner);
    expect(result.hitsNeeded).toBeCloseTo(plain.hitsNeeded, 10);
    expect(result.remainingHealth).toBeCloseTo(plain.remainingHealth, 10);
  });

  it('un sort qui couvre tout le combat équivaut à l\'effet actif en permanence (C10)', () => {
    const { result } = duel(left, right, { left_buff: { normal: 9, overcast: 0 } }, {});
    const always = calculateWinner(side(makeUnit(45)), side(right));
    expect(result.winner).toBe(always.winner);
    expect(result.hitsNeeded).toBeCloseTo(always.hitsNeeded, 8);
  });
});
