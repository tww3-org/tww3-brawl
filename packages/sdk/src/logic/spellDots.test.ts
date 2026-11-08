import { describe, expect, it } from 'vitest';
import type { SpellDot, Unit } from '../types';
import { dotDamagePerHit } from './spellDots';

/** Fate of Bjuna : 10 par tick, N = 25, 1 tick/s pendant 18 s, soit 180 par entité et par lancer */
const bjuna: SpellDot = { damage_per_tick: 10, chance: 1, max_entities: 25, frequency: 1, duration: 18 };

/** Unité minimale : `entities` entités de `entityHealth` PV */
const makeUnit = (
  entities: number,
  entityHealth: number,
  { caste = 'cavalry', resistance = {}, armor = 0 }: { caste?: string; resistance?: Partial<NonNullable<Unit['resistance']>>; armor?: number } = {}
): Unit => ({
  version: 'v',
  unit: 'u',
  caste,
  num_men: entities,
  land_unit: {
    num_engines: 0,
    num_mounts: 0,
    onscreen_name: 'u',
    bonus_hit_points: 0,
    battle_entity: { hit_points: entityHealth, size: 'small', type: '' },
  },
  battle_mounts: [],
  health: { unit: entities * entityHealth, entity: entityHealth },
  armor,
  resistance: { physical: 0, magic: 0, fire: 0, ward_save: 0, ...resistance },
  icon: '',
});

const cavalry = makeUnit(30, 400);
const infantry = makeUnit(120, 80, { caste: 'melee_infantry' });
const single = makeUnit(1, 5000, { caste: 'Lord' });

describe('dotDamagePerHit (Fate of Bjuna)', () => {
  it('D1 : cavalerie (30, 400 PV), tout porte, aucune perte', () => {
    const d = dotDamagePerHit(bjuna, cavalry, 30);
    expect(d.gross).toBe(4500);
    expect(d.lostOverkill).toBe(0);
    expect(d.lostEntities).toBe(0);
    expect(d.resist).toBe(0);
  });

  it('D2 : infanterie (120, 80 PV), overkill : porté 25 × 80, perdu 25 × 100', () => {
    const d = dotDamagePerHit(bjuna, infantry, 120);
    expect(d.gross).toBe(4500);
    expect(d.lostOverkill).toBe(2500);
    expect(d.lostEntities).toBe(0);
    // 2500 / 4500 ≈ 56 % perdus
    expect(d.lostOverkill / d.gross).toBeCloseTo(0.5556, 3);
    expect(d.perHit).toBeCloseTo((2000 * 4) / 18 / 9600, 10);
  });

  it('D3 : entité unique (1, 5000 PV), 1 instance sur 25 porte : perdu 24 × 180', () => {
    const d = dotDamagePerHit(bjuna, single, 1);
    expect(d.lostEntities).toBe(4320);
    expect(d.lostOverkill).toBe(0);
    expect(d.lostEntities / d.gross).toBeCloseTo(0.96, 10);
    expect(d.perHit).toBeCloseTo((180 * 4) / 18 / 5000, 10);
  });

  it('E est le plus petit de l\'effectif de départ et du nombre d\'entités de l\'unité', () => {
    // 10 entités sur 30 au départ : 10 instances portent
    const d = dotDamagePerHit(bjuna, cavalry, 10);
    expect(d.lostEntities).toBe(15 * 180);
  });

  it('D4 : magie 40 + ward 30 = 70 % de réduction', () => {
    const base = dotDamagePerHit(bjuna, cavalry, 30);
    const d = dotDamagePerHit(bjuna, makeUnit(30, 400, { resistance: { magic: 40, ward_save: 30 } }), 30);
    expect(d.resist).toBeCloseTo(0.7, 10);
    expect(d.perHit).toBeCloseTo(base.perHit * 0.3, 10);
  });

  it('D5 : magie 60 + ward 50 plafonnés à 95 %, comme la mêlée', () => {
    const base = dotDamagePerHit(bjuna, cavalry, 30);
    const d = dotDamagePerHit(bjuna, makeUnit(30, 400, { resistance: { magic: 60, ward_save: 50 } }), 30);
    expect(d.resist).toBeCloseTo(0.95, 10);
    expect(d.perHit).toBeCloseTo(base.perHit * 0.05, 10);
  });

  it('une faiblesse magique augmente les dégâts', () => {
    const base = dotDamagePerHit(bjuna, cavalry, 30);
    const d = dotDamagePerHit(bjuna, makeUnit(30, 400, { resistance: { magic: -20 } }), 30);
    expect(d.perHit).toBeCloseTo(base.perHit * 1.2, 10);
  });

  it('D6 : l\'armure, la résistance physique et la résistance au feu ne changent rien', () => {
    const base = dotDamagePerHit(bjuna, makeUnit(30, 400, { armor: 0 }), 30);
    const armored = dotDamagePerHit(
      bjuna,
      makeUnit(30, 400, { armor: 200, resistance: { physical: 50, fire: 50 } }),
      30
    );
    expect(armored.perHit).toBe(base.perHit);
    expect(armored.resist).toBe(base.resist);
  });

  it('D7 : perHit = porté × (1 − rés) × 4 / 18 / vie de l\'unité', () => {
    const target = makeUnit(30, 400, { resistance: { magic: 40, ward_save: 30 } });
    const d = dotDamagePerHit(bjuna, target, 30);
    expect(d.perHit).toBeCloseTo((4500 * 0.3 * 4) / 18 / target.health!.unit, 10);
  });
});

describe('dotDamagePerHit (plafond de PV par entité)', () => {
  it('seigneur à une entité : battle_entity.hit_points minuscule mais health.unit élevé, aucun overkill', () => {
    const lord: Unit = {
      ...makeUnit(1, 5000, { caste: 'Lord' }),
      land_unit: { ...single.land_unit!, battle_entity: { hit_points: 100, size: 'small', type: '' } },
      health: { unit: 6836, entity: 100 },
    };
    const spirit: SpellDot = { damage_per_tick: 67, chance: 1, max_entities: 1, frequency: 1, duration: 13 };
    const d = dotDamagePerHit(spirit, lord, 1);
    expect(d.lostOverkill).toBe(0);
    expect(d.perLaunch).toBe(871);
    expect(d.targetHealth).toBe(6836);
  });

  it('le plafond par entité vaut health.unit / entités', () => {
    const d = dotDamagePerHit(bjuna, { ...infantry, health: { unit: 120 * 100, entity: 1 } }, 120);
    // 180 par entité plafonnés à 100
    expect(d.lostOverkill).toBe(25 * 80);
    expect(d.perLaunch).toBe(2500);
  });

  it('perLaunch tient compte de la résistance', () => {
    const d = dotDamagePerHit(bjuna, makeUnit(30, 400, { resistance: { magic: 40, ward_save: 30 } }), 30);
    expect(d.perLaunch).toBeCloseTo(4500 * 0.3, 10);
  });
});

describe('dotDamagePerHit (cas limites)', () => {
  it('chance < 1 : moyenne des dégâts', () => {
    const d = dotDamagePerHit({ ...bjuna, chance: 0.5 }, cavalry, 30);
    expect(d.gross).toBe(2250);
  });

  it('fréquence de 2 s : deux fois moins de ticks', () => {
    const d = dotDamagePerHit({ ...bjuna, frequency: 2 }, cavalry, 30);
    expect(d.gross).toBe(2250);
  });

  it('fréquence <= 0 : un tick par seconde', () => {
    expect(dotDamagePerHit({ ...bjuna, frequency: 0 }, cavalry, 30).gross).toBe(4500);
  });

  it('N absent (0) : toutes les entités sont touchées, sans perte par manque d\'entités', () => {
    const d = dotDamagePerHit({ ...bjuna, max_entities: 0 }, cavalry, 30);
    expect(d.gross).toBe(30 * 180);
    expect(d.lostEntities).toBe(0);
  });

  it('cible sans vie d\'unité : aucun dégât par coup', () => {
    const d = dotDamagePerHit(bjuna, { ...cavalry, health: { unit: 0, entity: 0 } }, 30);
    expect(d.perHit).toBe(0);
  });
});
