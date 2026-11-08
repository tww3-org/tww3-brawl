import { describe, expect, it } from 'vitest';
import type { EffectDefinition, SpellCasts, SpellDefinition, SpellDot, SpellVersion } from '../types';
import { buildDuelPhases, spellWindows } from './spellPhases';

const fx = (id: string, target: EffectDefinition['target'] = 'self'): EffectDefinition => ({
  id, kind: 'ability', name: id, icon: '', placement: 'effects', target, passive: false,
  polarity: target === 'enemy' ? 'negative' : 'positive', modifiers: { attack: { add: 1 } },
  spell: { spell_id: id },
});

const version = (id: string, phases: [string, number, string[]][]): SpellVersion => ({
  id, name: id, phases: phases.map(([phaseId, duration, effects]) => ({ id: phaseId, duration, effects })),
});

const spell = (id: string, normal: SpellVersion, overcast?: SpellVersion): SpellDefinition => ({
  id, name: id, icon: '', mana_cost: 10, normal, ...(overcast && { overcast }),
});

// Durées : 24 s = 6 coups, 8 s = 2 coups, 12 s = 3 coups, 20 s = 5 coups, 16 s = 4 coups, 10 s = 2,5 coups, 14 s = 3,5 coups
const effects: Record<string, EffectDefinition> = Object.fromEntries([
  fx('a_fx'), fx('a_fx_oc'), fx('b_fx'), fx('hex_fx', 'enemy'), fx('c_fx'), fx('pav_1'), fx('pav_2'),
].map(e => [e.id, e]));

const spells: Record<string, SpellDefinition> = Object.fromEntries([
  spell('a', version('a', [['a_p', 24, ['a_fx']]]), version('a_up', [['a_up_p', 16, ['a_fx_oc']]])),
  spell('b', version('b', [['b_p', 8, ['b_fx']]])),
  spell('hex', version('hex', [['hex_p', 24, ['hex_fx']]])),
  spell('c', version('c', [['c_p', 12, ['c_fx']]])),
  spell('d', version('d', [['d_p', 20, ['c_fx']]])),
  spell('pavane', version('pavane', [['pav_p1', 10, ['pav_1']], ['pav_p2', 14, ['pav_2']]])),
].map(s => [s.id, s]));

const none: SpellCasts = {};
const cast = (id: string, normal = 1, overcast = 0): SpellCasts => ({ [id]: { normal, overcast } });
const phasesOf = (left: SpellCasts, right: SpellCasts) =>
  buildDuelPhases(spellWindows(left, right, spells), effects, spells);
const bounds = (phases: ReturnType<typeof phasesOf>) => phases.map(p => [p.start, p.end]);

describe('spellWindows', () => {
  it('ne crée aucune fenêtre pour un compteur à 0, un sort inconnu ou un overcast absent', () => {
    expect(spellWindows(cast('a', 0, 0), none, spells)).toEqual([]);
    expect(spellWindows(cast('unknown'), none, spells)).toEqual([]);
    expect(spellWindows(cast('b', 0, 2), none, spells)).toEqual([]);
  });

  it('une fenêtre par (côté, sort, version, phase)', () => {
    const windows = spellWindows(cast('a', 1, 1), cast('a'), spells);
    expect(windows.map(w => [w.side, w.spellId, w.version, w.phaseId, w.instances])).toEqual([
      ['left', 'a', 'normal', 'a_p', 6],
      ['left', 'a', 'overcast', 'a_up_p', 4],
      ['right', 'a', 'normal', 'a_p', 6],
    ]);
  });
});

describe('buildDuelPhases', () => {
  it('C1 : aucun lancer, une seule phase [0, ∞)', () => {
    expect(phasesOf(none, none)).toEqual([
      { start: 0, end: Infinity, active: [], leftCardEffects: [], rightCardEffects: [], dotsOnLeft: [], dotsOnRight: [] },
    ]);
  });

  it('C2 : 24 s, 1 lancer : [0,6) puis [6,∞)', () => {
    const phases = phasesOf(cast('a'), none);
    expect(bounds(phases)).toEqual([[0, 6], [6, Infinity]]);
    expect(phases[0].leftCardEffects).toEqual(['a_fx']);
    expect(phases[1].active).toEqual([]);
    expect(phases[1].leftCardEffects).toEqual([]);
  });

  it('C3 : 2 lancers additionnent les durées : [0,12) puis [12,∞)', () => {
    expect(bounds(phasesOf(cast('a', 2), none))).toEqual([[0, 12], [12, Infinity]]);
  });

  it('C4 : A = 6 coups, B = 2 coups : [0,2) A+B, [2,6) A, [6,∞) aucun', () => {
    const phases = phasesOf({ ...cast('a'), ...cast('b') }, none);
    expect(bounds(phases)).toEqual([[0, 2], [2, 6], [6, Infinity]]);
    expect(phases.map(p => p.leftCardEffects)).toEqual([['a_fx', 'b_fx'], ['a_fx'], []]);
    expect(phases.map(p => p.active.length)).toEqual([2, 1, 0]);
  });

  it('C5 : gauche 3 coups, droite 5 coups : [0,3), [3,5), [5,∞)', () => {
    const phases = phasesOf(cast('c'), cast('d'));
    expect(bounds(phases)).toEqual([[0, 3], [3, 5], [5, Infinity]]);
    expect(phases.map(p => p.leftCardEffects)).toEqual([['c_fx'], [], []]);
    expect(phases.map(p => p.rightCardEffects)).toEqual([['c_fx'], ['c_fx'], []]);
  });

  it('C6 : simple (6) et overcast (4) sont deux fenêtres distinctes sans cumul', () => {
    const phases = phasesOf(cast('a', 1, 1), none);
    expect(bounds(phases)).toEqual([[0, 4], [4, 6], [6, Infinity]]);
    expect(phases.map(p => p.leftCardEffects)).toEqual([['a_fx', 'a_fx_oc'], ['a_fx'], []]);
  });

  it('C7 : la borne fractionnaire est conservée (10 s = 2,5 coups)', () => {
    const only = { ...spells, e: spell('e', version('e', [['e_p', 10, ['a_fx']]])) };
    const phases = buildDuelPhases(spellWindows(cast('e'), none, only), effects, only);
    expect(bounds(phases)).toEqual([[0, 2.5], [2.5, Infinity]]);
  });

  it('C13 : sort à 2 phases (10 s et 14 s) : [0,2.5) 2 phases, [2.5,3.5) phase 2, [3.5,∞) aucun', () => {
    const phases = phasesOf(cast('pavane'), none);
    expect(bounds(phases)).toEqual([[0, 2.5], [2.5, 3.5], [3.5, Infinity]]);
    expect(phases.map(p => p.active.map(w => w.phaseId))).toEqual([['pav_p1', 'pav_p2'], ['pav_p2'], []]);
    expect(phases.map(p => p.leftCardEffects)).toEqual([['pav_1', 'pav_2'], ['pav_2'], []]);
  });

  it('C8 : un effet de sort ciblant l\'ennemi va aussi sur la carte du porteur (gauche puis droite)', () => {
    const phases = phasesOf(cast('hex'), none);
    expect(phases[0].leftCardEffects).toEqual(['hex_fx']);
    expect(phases[0].rightCardEffects).toEqual([]);
    const mirrored = phasesOf(none, cast('hex'));
    expect(mirrored[0].rightCardEffects).toEqual(['hex_fx']);
    expect(mirrored[0].leftCardEffects).toEqual([]);
  });

  it('C9 : le porteur reçoit les effets self et enemy de ses sorts', () => {
    const both = { ...spells, mix: spell('mix', version('mix', [['mix_p', 8, ['a_fx', 'hex_fx']]])) };
    const phases = buildDuelPhases(spellWindows(none, cast('mix'), both), effects, both);
    expect(phases[0].rightCardEffects).toEqual(['a_fx', 'hex_fx']);
    expect(phases[0].leftCardEffects).toEqual([]);
  });

  it('ignore les ids d\'effets absents du catalogue', () => {
    const broken = { x: spell('x', version('x', [['x_p', 8, ['missing']]])) };
    const phases = buildDuelPhases(spellWindows(cast('x'), none, broken), effects, broken);
    expect(bounds(phases)).toEqual([[0, 2], [2, Infinity]]);
    expect(phases[0].leftCardEffects).toEqual([]);
  });
});

describe('buildDuelPhases : DoT (spec 004)', () => {
  const dot = (damage_per_tick: number): SpellDot => ({ damage_per_tick, chance: 1, max_entities: 25, frequency: 1, duration: 8 });
  const dotSpells: Record<string, SpellDefinition> = {
    bjuna: spell('bjuna', { id: 'bjuna', name: 'bjuna', phases: [{ id: 'bjuna_p', duration: 18, effects: [], dot: { ...dot(10), duration: 18 } }] }),
    // Heart of Winter : 4 phases de 8 s (2 coups chacune) à 2/4/6/8 par tick
    winter: spell('winter', {
      id: 'winter',
      name: 'winter',
      phases: [2, 4, 6, 8].map((d, i) => ({ id: `winter_${i + 1}`, duration: 8, effects: [], dot: dot(d) })),
    }),
    // DoT et modificateur de stats dans la même phase
    both: spell('both', { id: 'both', name: 'both', phases: [{ id: 'both_p', duration: 8, effects: ['a_fx'], dot: dot(5) }] }),
  };
  const dotPhases = (left: SpellCasts, right: SpellCasts) =>
    buildDuelPhases(spellWindows(left, right, dotSpells), effects, dotSpells);

  it('sans DoT, dotsOnLeft et dotsOnRight sont vides', () => {
    const phases = phasesOf(cast('a'), cast('b'));
    expect(phases.every(p => p.dotsOnLeft.length === 0 && p.dotsOnRight.length === 0)).toBe(true);
  });

  it('le DoT d\'un sort porté par la droite va sur la droite', () => {
    const phases = dotPhases(cast('bjuna'), none);
    expect(bounds(phases)).toEqual([[0, 4.5], [4.5, Infinity]]);
    expect(phases[0].dotsOnLeft.map(d => [d.spellId, d.version, d.phaseId, d.dot.damage_per_tick])).toEqual([['bjuna', 'normal', 'bjuna_p', 10]]);
    expect(phases[0].dotsOnRight).toEqual([]);
    expect(phases[1].dotsOnLeft).toEqual([]);
  });

  it('le DoT d\'un sort porté par la droite va sur la droite', () => {
    const phases = dotPhases(none, cast('bjuna'));
    expect(phases[0].dotsOnRight).toHaveLength(1);
    expect(phases[0].dotsOnLeft).toEqual([]);
  });

  it('le porteur reçoit le DoT et tous les effets de son sort', () => {
    const phases = dotPhases(none, cast('both'));
    expect(phases[0].rightCardEffects).toEqual(['a_fx']);
    expect(phases[0].dotsOnRight).toHaveLength(1);
    expect(phases[0].leftCardEffects).toEqual([]);
    expect(phases[0].dotsOnLeft).toEqual([]);
  });

  it('D8 : 2 lancers = une fenêtre de 9 coups, même DoT', () => {
    const phases = dotPhases(cast('bjuna', 2), none);
    expect(bounds(phases)).toEqual([[0, 9], [9, Infinity]]);
    expect(phases[0].dotsOnLeft[0].dot.damage_per_tick).toBe(10);
  });

  it('D12 : Heart of Winter, 4 fenêtres indépendantes de 2 coups, DoT sommables sur [0,2)', () => {
    const phases = dotPhases(cast('winter'), none);
    expect(bounds(phases)).toEqual([[0, 2], [2, Infinity]]);
    expect(phases[0].dotsOnLeft.map(d => d.dot.damage_per_tick)).toEqual([2, 4, 6, 8]);
    expect(phases[1].dotsOnLeft).toEqual([]);
  });

  it('un sort avec DoT et modificateur : les deux s\'appliquent dans les mêmes phases', () => {
    const phases = dotPhases(cast('both'), none);
    expect(phases[0].leftCardEffects).toEqual(['a_fx']);
    expect(phases[0].dotsOnLeft).toHaveLength(1);
  });
});
