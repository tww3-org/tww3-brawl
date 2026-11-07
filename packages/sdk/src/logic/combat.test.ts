import { describe, expect, it } from 'vitest';
import type { Unit } from '../types';
import { regenerationBurst, regenerationPerHit } from './oneSideCalculations';
import { calculatePhasedWinner, calculateWinner, type UnitWithEntityNumber } from './twoSideCalculations';

const makeUnit = (overrides: Partial<Unit> = {}): Unit => ({
  version: 'v',
  unit: 'u',
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
  damage: { normal: 30, piercing: 10, is_magical: false, is_fire: false, bonus_v_large: 0, bonus_v_infantry: 0 },
  resistance: { physical: 0, magic: 0, fire: 0, ward_save: 0 },
  icon: '',
  ...overrides,
});

const side = (unit: Unit): UnitWithEntityNumber => ({ selection: { unit }, entityNumber: 100 });

const withDamage = (normal: number, extra: Partial<NonNullable<Unit['damage']>> = {}): Unit['damage'] => ({
  normal, piercing: 0, is_magical: false, is_fire: false, bonus_v_large: 0, bonus_v_infantry: 0, ...extra,
});

describe('calculateWinner sans régénération', () => {
  it('le plus fort gagne, avec le calcul historique', () => {
    const strong = makeUnit({ damage: withDamage(60) });
    const weak = makeUnit({ damage: withDamage(30) });
    const result = calculateWinner(side(strong), side(weak));
    expect(result.winner).toBe('left');
    expect(result.stalemate).toBe(false);
    expect(result.regenerationPerHit).toEqual({ left: 0, right: 0 });
    // Calcul historique : 1 / dégâts infligés ; vie restante = 1 − coups × dégâts subis
    const reversed = calculateWinner(side(weak), side(strong));
    expect(reversed.winner).toBe('right');
    expect(reversed.hitsNeeded).toBeCloseTo(result.hitsNeeded);
    // Le perdant inflige moitié moins de dégâts par coup : le gagnant perd la moitié de sa vie
    expect(result.remainingHealth).toBeCloseTo(0.5, 5);
  });

  it('égalité : gauche gagne avec 0 de vie restante', () => {
    const result = calculateWinner(side(makeUnit()), side(makeUnit()));
    expect(result.winner).toBe('left');
    expect(result.remainingHealth).toBeCloseTo(0);
  });
});

describe('calculateWinner avec régénération', () => {
  const plain = makeUnit({ damage: withDamage(40) });

  it('la régénération réduit les dégâts nets et allonge le combat', () => {
    const target = makeUnit({ damage: withDamage(20) });
    const base = calculateWinner(side(plain), side(target));
    const regen = { ...target, regeneration: { per_second: 0.002, burst: 0 } };
    const result = calculateWinner(side(plain), side(regen));
    expect(result.hitsNeeded).toBeGreaterThan(base.hitsNeeded);
    expect(result.regenerationPerHit.right).toBeCloseTo(0.008);
  });

  it('une attaque enflammée divise la régénération par deux', () => {
    const regen = makeUnit({ regeneration: { per_second: 0.002, burst: 0.1 } });
    const fire = makeUnit({ damage: withDamage(40, { is_fire: true }) });
    expect(regenerationPerHit(plain, regen)).toBeCloseTo(0.008);
    expect(regenerationPerHit(fire, regen)).toBeCloseTo(0.004);
    expect(regenerationBurst(plain, regen)).toBeCloseTo(0.1);
    expect(regenerationBurst(fire, regen)).toBeCloseTo(0.05);
    expect(calculateWinner(side(fire), side(regen)).regenerationPerHit.right).toBeCloseTo(0.004);
  });

  it('impasse quand la régénération dépasse les dégâts des deux côtés', () => {
    const tank = makeUnit({ regeneration: { per_second: 0.5, burst: 0 } });
    const result = calculateWinner(side(tank), side({ ...tank }));
    expect(result.stalemate).toBe(true);
    expect(result.winner).toBe('left');
    expect(result.hitsNeeded).toBe(Infinity);
    expect(result.remainingHealth).toBe(1);
  });

  it('le côté aux dégâts plus faibles gagne s\'il régénère plus qu\'il ne subit', () => {
    const weak = makeUnit({ damage: withDamage(30), regeneration: { per_second: 0.5, burst: 0 } });
    const strong = makeUnit({ damage: withDamage(60) });
    const result = calculateWinner(side(strong), side(weak));
    expect(result.winner).toBe('right');
    expect(result.stalemate).toBe(false);
  });
});

describe('calculatePhasedWinner', () => {
  const strong = makeUnit({ damage: withDamage(60) });
  const weak = makeUnit({ damage: withDamage(30) });
  const tank = makeUnit({ damage: withDamage(30), regeneration: { per_second: 0.5, burst: 0 } });

  it('C9 : calculateWinner est le cas « une seule phase infinie »', () => {
    const direct = calculateWinner(side(strong), side(weak));
    const phased = calculatePhasedWinner([{ hits: Infinity, left: side(strong), right: side(weak) }]);
    expect(phased).toEqual(direct);
    expect(direct.phases).toEqual([
      { start: 0, end: Infinity, leftNetTaken: expect.any(Number), rightNetTaken: expect.any(Number) },
    ]);
  });

  it('C10 : un sort couvrant plus de coups que le combat équivaut à un effet actif tout le combat', () => {
    const buffed = makeUnit({ damage: withDamage(45) });
    const always = calculateWinner(side(buffed), side(weak));
    const phased = calculatePhasedWinner([
      { hits: 1000, left: side(buffed), right: side(weak) },
      { hits: Infinity, left: side(weak), right: side(weak) },
    ]);
    expect(phased.winner).toBe(always.winner);
    expect(phased.hitsNeeded).toBeCloseTo(always.hitsNeeded, 10);
    expect(phased.remainingHealth).toBeCloseTo(always.remainingHealth, 10);
  });

  it('C11 : mort pendant la première phase, les phases suivantes sont ignorées', () => {
    const base = calculateWinner(side(strong), side(weak));
    const firstEnd = Math.ceil(base.hitsNeeded) + 1;
    const phased = calculatePhasedWinner([
      { hits: firstEnd, left: side(strong), right: side(weak) },
      // si ces phases étaient parcourues, le résultat changerait
      { hits: 3, left: side(weak), right: side(strong) },
      { hits: Infinity, left: side(weak), right: side(strong) },
    ]);
    expect(phased.hitsNeeded).toBeLessThan(firstEnd);
    expect(phased.hitsNeeded).toBeCloseTo(base.hitsNeeded, 10);
    expect(phased.winner).toBe('left');
    expect(phased.remainingHealth).toBeCloseTo(base.remainingHealth, 10);
  });

  it('mort dans une phase intermédiaire : les coups et la vie restante traversent les phases', () => {
    // Phase 1 : les deux côtés s'infligent des dégâts moyens ; phase 2 : le gauche tue le droit
    const p1 = calculateWinner(side(weak), side(weak));
    const half = p1.hitsNeeded / 2;
    const result = calculatePhasedWinner([
      { hits: half, left: side(weak), right: side(weak) },
      { hits: Infinity, left: side(strong), right: side(weak) },
    ]);
    expect(result.winner).toBe('left');
    // Moitié de la vie de droite perdue en phase 1 ; le reste à la vitesse de la phase 2
    const fast = calculateWinner(side(strong), side(weak)).hitsNeeded;
    expect(result.hitsNeeded).toBeCloseTo(half + fast / 2, 8);
    // Le gauche subit les dégâts nets de chaque phase pendant les coups passés dedans
    const net1 = p1.phases![0].leftNetTaken;
    const net2 = calculateWinner(side(strong), side(weak)).phases![0].leftNetTaken;
    expect(result.remainingHealth).toBeCloseTo(Math.min(1, 1 - net1 * half - net2 * (result.hitsNeeded - half)), 8);
  });

  it('C12 : dernière phase sans dégâts nets et vie non épuisée : impasse', () => {
    const result = calculatePhasedWinner([
      { hits: 0.5, left: side(strong), right: side(weak) },
      { hits: Infinity, left: side(tank), right: side({ ...tank }) },
    ]);
    expect(result.stalemate).toBe(true);
    expect(result.hitsNeeded).toBe(Infinity);
    expect(result.remainingHealth).toBe(1);
  });

  it('C12 : pas d\'impasse si l\'autre côté finit par mourir', () => {
    const result = calculatePhasedWinner([
      { hits: 0.5, left: side(strong), right: side(weak) },
      { hits: Infinity, left: side(tank), right: side(strong) },
    ]);
    expect(result.stalemate).toBe(false);
    expect(result.winner).toBe('left');
    expect(Number.isFinite(result.hitsNeeded)).toBe(true);
  });
});
