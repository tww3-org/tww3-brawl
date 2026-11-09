import { describe, expect, it } from 'vitest';
import type { Unit } from '../types';
import { regenerationBurst, regenerationPerHit } from './oneSideCalculations';
import type { ActiveDot } from './spellPhases';
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
      {
        start: 0, end: Infinity, leftNetTaken: expect.any(Number), rightNetTaken: expect.any(Number),
        leftDotTaken: 0, rightDotTaken: 0, leftDots: [], rightDots: [],
      },
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

describe('calculatePhasedWinner avec DoT de sorts (spec 004)', () => {
  const bjuna: ActiveDot = {
    spellId: 'bjuna',
    version: 'normal',
    phaseId: 'bjuna_p',
    dot: { damage_per_tick: 10, chance: 1, max_entities: 25, frequency: 1, duration: 18 },
  };
  // Cible : 100 entités de 100 PV ; D = 180 ≥ H = 100 : instance = H / 2 = 50, porté 25 × 50, par coup : 1250 × 4 / 18 / 10000
  const dotPerHit = (1250 * 4) / 18 / 10000;
  const attacker = makeUnit({ damage: withDamage(30) });
  const target = makeUnit({ damage: withDamage(30) });
  // Régénération (0,2 par coup) supérieure à la mêlée (0,18 par coup) : impasse sans DoT
  const regenerating = makeUnit({ damage: withDamage(30), regeneration: { per_second: 0.05, burst: 0 } });

  it('D10 : sans DoT, listes absentes ou vides donnent le même résultat', () => {
    const plain = calculatePhasedWinner([{ hits: Infinity, left: side(attacker), right: side(target) }]);
    const empty = calculatePhasedWinner([
      { hits: Infinity, left: side(attacker), right: side(target), dotsOnLeft: [], dotsOnRight: [] },
    ]);
    expect(empty).toEqual(plain);
  });

  it('le DoT s\'ajoute à la mêlée sur la cible et détaille la perte', () => {
    const base = calculateWinner(side(attacker), side(target)).phases![0];
    const result = calculatePhasedWinner([
      { hits: Infinity, left: side(attacker), right: side(target), dotsOnRight: [bjuna] },
    ]);
    const phase = result.phases![0];
    expect(phase.rightDotTaken).toBeCloseTo(dotPerHit, 10);
    expect(phase.leftDotTaken).toBe(0);
    expect(phase.rightNetTaken).toBeCloseTo(base.rightNetTaken + dotPerHit, 10);
    expect(phase.leftNetTaken).toBeCloseTo(base.leftNetTaken, 10);
    expect(phase.rightDots).toHaveLength(1);
    expect(phase.rightDots[0].damage.lostOverkill).toBeCloseTo(25 * 130, 10);
    expect(result.winner).toBe('left');
  });

  it('D9 : sur une cible qui régénère, net = mêlée + DoT − régénération', () => {
    const regen = regenerationPerHit(attacker, makeUnit({ regeneration: { per_second: 0.01, burst: 0 } }));
    const slow = makeUnit({ damage: withDamage(30), regeneration: { per_second: 0.01, burst: 0 } });
    const melee = calculateWinner(side(attacker), side(slow)).phases![0].rightNetTaken + regen; // mêlée brute
    const result = calculatePhasedWinner([
      { hits: Infinity, left: side(attacker), right: side(slow), dotsOnRight: [bjuna] },
    ]);
    expect(result.phases![0].rightNetTaken).toBeCloseTo(melee + dotPerHit - regen, 10);
  });

  it('D8 : deux lancers couvrent deux fois plus de coups avec le même DoT par coup', () => {
    // DoT faible (2 par tick) pour que la cible survive à la première fenêtre
    const weakDot: ActiveDot = { ...bjuna, dot: { ...bjuna.dot, damage_per_tick: 2 } };
    const run = (hits: number) => calculatePhasedWinner([
      { hits, left: side(attacker), right: side(target), dotsOnRight: [weakDot] },
      { hits: Infinity, left: side(attacker), right: side(target) },
    ]);
    const one = run(4.5);
    const two = run(9);
    expect(one.phases![0].rightDotTaken).toBeCloseTo(two.phases![0].rightDotTaken, 12);
    expect(two.hitsNeeded).toBeLessThan(one.hitsNeeded);
  });

  it('US3 : cible en stalemate, le DoT réduit la vie sur quelques coups puis le stalemate reprend', () => {
    const result = calculatePhasedWinner([
      { hits: 2, left: side(regenerating), right: side(regenerating), dotsOnRight: [bjuna] },
      { hits: Infinity, left: side(regenerating), right: side(regenerating) },
    ]);
    // Pendant le DoT : mêlée 0,18 + DoT 0,0278 − régénération 0,2 > 0 ; ensuite : 0
    expect(result.phases![0].rightNetTaken).toBeCloseTo(0.18 + dotPerHit - 0.2, 10);
    expect(result.phases![1].rightNetTaken).toBe(0);
    expect(result.stalemate).toBe(true);
  });

  it('US3 : un DoT assez fort tue la cible en stalemate pendant sa fenêtre', () => {
    const strongDot: ActiveDot = { ...bjuna, dot: { ...bjuna.dot, damage_per_tick: 1000, max_entities: 100 } };
    // D >= H : instance = 50 sur chacune des 100 entités (le plafond de PV rend damage_per_tick seul insuffisant)
    const result = calculatePhasedWinner([
      { hits: 50, left: side(regenerating), right: side(regenerating), dotsOnRight: [strongDot] },
      { hits: Infinity, left: side(regenerating), right: side(regenerating) },
    ]);
    expect(result.stalemate).toBe(false);
    expect(result.winner).toBe('left');
    expect(result.hitsNeeded).toBeLessThan(50);
  });

  it('une résistance magique de la cible réduit le DoT, pas l\'armure', () => {
    const resistant = makeUnit({ damage: withDamage(30), resistance: { physical: 0, magic: 50, fire: 0, ward_save: 0 } });
    const armored = makeUnit({ damage: withDamage(30), armor: 300 });
    const dot = (t: Unit) => calculatePhasedWinner([
      { hits: Infinity, left: side(attacker), right: side(t), dotsOnRight: [bjuna] },
    ]).phases![0].rightDotTaken;
    expect(dot(resistant)).toBeCloseTo(dotPerHit / 2, 10);
    expect(dot(armored)).toBeCloseTo(dotPerHit, 10);
  });
});
