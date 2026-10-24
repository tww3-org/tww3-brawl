import { describe, expect, it } from 'vitest';
import type { BrawlModifiers, EffectDefinition, Unit } from '../types';
import { applyEffects } from './applyEffects';
import { clampNonNegative } from './clampStat';
import { calculateAttackRatio, calculateDamageOnHit } from './oneSideCalculations';
import {
  EFFECTIVE_UNIT_LAYERS,
  derivedValuesLayer,
  manualLayer,
  negativeEffectsLayer,
  positiveEffectsLayer,
  runLayers,
  type Catalog,
  type LayerContext,
} from './unitLayers';

const fx = (
  id: string,
  kind: EffectDefinition['kind'],
  modifiers: BrawlModifiers,
  target: EffectDefinition['target'] = 'self'
): EffectDefinition => ({
  id, kind, name: id, icon: '', placement: 'effects', target, passive: true, polarity: 'positive', modifiers,
});

/** Catalogue factice : chaque entrée ne porte qu'un petit modificateur lisible */
const catalog: Catalog = Object.fromEntries([
  // Retrait de l'attaque magique / enflammée (type Dampen / Lamassu), reçu au contact
  fx('dampen', 'contact', { damage: { is_magical: false } }),
  fx('quench', 'contact', { damage: { is_fire: false } }),
  // Octroi de l'attaque magique / enflammée
  fx('grant_magic', 'attribute', { damage: { is_magical: true } }),
  fx('grant_fire', 'attribute', { damage: { is_fire: true } }),
  // Malus de contact
  fx('curse', 'contact', {
    attack: { add: -10 },
    armor: { add: -10 },
    damage: { normal: { add: -5 }, piercing: { add: -2 } },
  }),
  fx('res_malus', 'contact', { resistance: { physical: { mult: 0.5 } } }),
  fx('nullify', 'contact', { attack: { mult: 0 } }),
  fx('halve', 'contact', { attack: { mult: 0.5 } }),
  fx('big_malus', 'attribute', { resistance: { physical: { add: -50 } } }),
  // Bonus propres
  fx('boon', 'attribute', { attack: { add: 5 }, damage: { normal: { add: 4 } } }),
  fx('res_boon', 'attribute', { resistance: { physical: { add: 30 } } }),
  fx('rage', 'attribute', { attack: { mult: 1.5 } }),
  fx('rage2', 'attribute', { attack: { mult: 1.5 } }),
  // Immunités
  fx('immune_attack', 'attribute', { immunities: ['attack_reduction'] }),
  fx('immune_strength', 'attribute', { immunities: ['weapon_strength_reduction'] }),
  fx('immune_contact', 'attribute', { immunities: ['enemy_contact_effects'] }),
  // Un seul effet portant les deux polarités sur la même stat
  fx('mixed', 'attribute', { attack: { add: 10, mult: 0.5 } }),
].map(e => [e.id, e]));

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
  armor: 40,
  attack: 50,
  defense: 30,
  attack_interval: 5,
  damage: { normal: 30, piercing: 10, is_magical: false, is_fire: false, bonus_v_large: 0, bonus_v_infantry: 0 },
  resistance: { physical: 20, magic: 0, fire: 0, ward_save: 0 },
  icon: '',
  ...overrides,
});

/** Unité effective : toute la chaîne de couches, dans l'ordre obligatoire */
const effective = (unit: Unit, ctx: Omit<LayerContext, 'catalog'> = {}): Unit =>
  runLayers(unit, EFFECTIVE_UNIT_LAYERS, { ...ctx, catalog });

describe('armes natives', () => {
  it('une arme magique / enflammée native le reste sans effet', () => {
    const unit = makeUnit({ damage: { ...makeUnit().damage!, is_magical: true, is_fire: true } });
    const result = effective(unit);
    expect(result.damage?.is_magical).toBe(true);
    expect(result.damage?.is_fire).toBe(true);
  });
});

describe('retrait de l\'attaque magique / enflammée', () => {
  const magical = makeUnit({ damage: { ...makeUnit().damage!, is_magical: true, is_fire: true } });

  it('l\'emporte sur l\'arme native', () => {
    const result = effective(magical, { opponentCardEffects: ['dampen', 'quench'] });
    expect(result.damage?.is_magical).toBe(false);
    expect(result.damage?.is_fire).toBe(false);
  });

  it('l\'emporte sur une modification manuelle', () => {
    const result = effective(magical, { manual: { 'damage.normal': 10 }, opponentCardEffects: ['dampen'] });
    expect(result.damage?.is_magical).toBe(false);
    expect(result.damage?.normal).toBe(40);
  });

  it('l\'emporte sur un effet positif qui l\'accorde', () => {
    const plain = makeUnit();
    expect(effective(plain, { cardEffects: ['grant_magic', 'grant_fire'] }).damage).toMatchObject({ is_magical: true, is_fire: true });
    const result = effective(plain, { cardEffects: ['grant_magic', 'grant_fire'], opponentCardEffects: ['dampen', 'quench'] });
    expect(result.damage?.is_magical).toBe(false);
    expect(result.damage?.is_fire).toBe(false);
  });
});

describe('résistance physique', () => {
  it('le malus s\'applique après un bonus et après une modification manuelle', () => {
    // (20 + 10 manuel) + 30 bonus = 60, puis ×0,5 = 30 (et non 20×… dans un autre ordre : 45)
    const result = effective(makeUnit(), {
      manual: { 'resistance.physical': 10 },
      cardEffects: ['res_boon'],
      opponentCardEffects: ['res_malus'],
    });
    expect(result.resistance?.physical).toBe(30);
  });

  it('n\'est pas bornée entre les couches', () => {
    const unit = makeUnit({ resistance: { physical: 10, magic: 0, fire: 0, ward_save: 0 } });
    const ctx: LayerContext = { cardEffects: ['big_malus', 'res_boon'], catalog };
    // Malus d'abord : -40 (non borné), puis le bonus de +30 donne -10 et non 30
    const malusFirst = runLayers(unit, [negativeEffectsLayer, positiveEffectsLayer], ctx);
    expect(malusFirst.resistance?.physical).toBe(-10);
    // Ordre normal : le bonus (+30) puis le malus (-50)
    expect(effective(unit, ctx).resistance?.physical).toBe(-10);
    expect(runLayers(unit, [negativeEffectsLayer], ctx).resistance?.physical).toBe(-40);
  });
});

describe('unité large', () => {
  const attacker = makeUnit({ damage: { ...makeUnit().damage!, bonus_v_large: 20 }, armor: 0 });
  const withLand = (land: Partial<Unit['land_unit']>, extra: Partial<Unit> = {}): Unit => {
    const base = makeUnit({ armor: 0, ...extra });
    return { ...base, land_unit: { ...base.land_unit, ...land } };
  };

  it('un cavalier ou une monture / un engin non small rend l\'unité large', () => {
    expect(derivedValuesLayer(withLand({ mount_size: 'large' }), {}).is_large).toBe(true);
    expect(derivedValuesLayer(withLand({ engine_size: 'medium' }), {}).is_large).toBe(true);
    expect(derivedValuesLayer(withLand({ battle_entity: { hit_points: 1, size: 'large', type: '' } }), {}).is_large).toBe(true);
    expect(derivedValuesLayer(withLand({ mount_size: 'small', engine_size: 'small' }), {}).is_large).toBe(false);
    expect(derivedValuesLayer(withLand({}), {}).is_large).toBe(false);
  });

  it('les calculs utilisent bonus_v_large contre une unité montée', () => {
    const mounted = effective(withLand({ mount_size: 'large' }));
    const foot = effective(withLand({}));
    // 50 - 30 + 40 + 20 = 80 contre une cible large, 60 sinon (bonus_v_infantry = 0)
    expect(calculateAttackRatio(attacker, mounted)).toBeCloseTo(0.8);
    expect(calculateAttackRatio(attacker, foot)).toBeCloseTo(0.6);
    // (30 + 20×0,75) + 10 + 20×0,25 = 60 contre une cible large, 40 sinon
    expect(calculateDamageOnHit(attacker, mounted)).toBeCloseTo(60);
    expect(calculateDamageOnHit(attacker, foot)).toBeCloseTo(40);
  });

  it('unité persistée sans tailles de monture / engin : is_large déjà renseigné conservé', () => {
    expect(derivedValuesLayer(withLand({}, { is_large: true }), {}).is_large).toBe(true);
    // Même si la taille du cavalier dit le contraire : on garde la valeur persistée
    const legacy = withLand({ battle_entity: { hit_points: 1, size: 'large', type: '' } }, { is_large: false });
    expect(derivedValuesLayer(legacy, {}).is_large).toBe(false);
  });
});

describe('immunités', () => {
  const unit = makeUnit();
  const opponentCardEffects = ['curse'];

  it('sans immunité : malus de contact et bonus propres', () => {
    const r = effective(unit, { cardEffects: ['boon'], opponentCardEffects });
    expect(r).toMatchObject({ attack: 45, armor: 30 });
    expect(r.damage).toMatchObject({ normal: 29, piercing: 8 });
  });

  it('attack_reduction annule le malus d\'attaque mais pas le bonus', () => {
    const r = effective(unit, { cardEffects: ['boon', 'immune_attack'], opponentCardEffects });
    expect(r.attack).toBe(55);
    expect(r.armor).toBe(30);
    expect(r.damage).toMatchObject({ normal: 29, piercing: 8 });
  });

  it('weapon_strength_reduction annule les malus de dégâts normaux / perforants mais pas le bonus', () => {
    const r = effective(unit, { cardEffects: ['boon', 'immune_strength'], opponentCardEffects });
    expect(r.attack).toBe(45);
    expect(r.damage).toMatchObject({ normal: 34, piercing: 10 });
  });

  it('enemy_contact_effects annule les effets de contact reçus mais pas les bonus propres', () => {
    const r = effective(unit, { cardEffects: ['boon', 'immune_contact'], opponentCardEffects });
    expect(r).toMatchObject({ attack: 55, armor: 40 });
    expect(r.damage).toMatchObject({ normal: 34, piercing: 10 });
  });
});

describe('ordre des couches', () => {
  const unit = makeUnit();

  it('×0 négatif après un bonus manuel et un ×1,5 positif donne 0', () => {
    const r = effective(unit, { manual: { attack: 10 }, cardEffects: ['rage'], opponentCardEffects: ['nullify'] });
    expect(r.attack).toBe(0);
  });

  it('×0,5 négatif après ×1,5 positif donne ×0,75', () => {
    const r = effective(unit, { cardEffects: ['rage'], opponentCardEffects: ['halve'] });
    expect(r.attack).toBe(37.5);
  });

  it('le manuel passe avant les multiplicateurs positifs', () => {
    // (50 + 10) × 1,5 = 90 (et non 50 × 1,5 + 10 = 85)
    expect(effective(unit, { manual: { attack: 10 }, cardEffects: ['rage'] }).attack).toBe(90);
  });

  it('multiplicateurs additifs au sein d\'une étape : ×1,5 et ×1,5 donnent ×2', () => {
    expect(effective(unit, { cardEffects: ['rage', 'rage2'] }).attack).toBe(100);
  });

  it('un même effet peut contribuer aux deux étapes (add > 0 positif, mult < 1 négatif)', () => {
    // positif : 50 + 10 = 60 ; négatif : 60 × 0,5 = 30
    expect(effective(unit, { cardEffects: ['mixed'] }).attack).toBe(30);
  });

  it('applyEffects = positif puis négatif', () => {
    const r = applyEffects(unit, ['rage'], ['halve'], catalog);
    expect(r.attack).toBe(37.5);
  });
});

describe('couches pures', () => {
  it('manualLayer ajoute sans borne, sans muter l\'unité reçue', () => {
    const unit = makeUnit();
    const r = manualLayer(unit, { manual: { attack: -80, 'health.unit': 5, 'resistance.fire': 7 } });
    expect(r.attack).toBe(-30);
    expect(r.health).toEqual({ unit: 10005, entity: 100 });
    expect(r.resistance).toEqual({ physical: 20, magic: 0, fire: 7, ward_save: 0 });
    expect(unit.attack).toBe(50);
    expect(unit.health?.unit).toBe(10000);
  });
});

describe('stats négatives', () => {
  it('peuvent être négatives entre les couches, les calculs les bornent à 0', () => {
    const unit = makeUnit({ attack: 5, armor: 10 });
    const r = effective(unit, { opponentCardEffects: ['curse'] });
    expect(r.attack).toBe(-5);
    expect(r.armor).toBe(0);
    expect(r.damage?.normal).toBe(25);

    const defender = makeUnit({ armor: 0 });
    const zeroAttack = makeUnit({ attack: 0 });
    expect(calculateAttackRatio(r, defender)).toBeCloseTo(calculateAttackRatio(zeroAttack, defender));

    // Défense et armure négatives de la cible bornées à 0
    const negDefender = makeUnit({ defense: -50, armor: -20 });
    const zeroDefender = makeUnit({ defense: 0, armor: 0 });
    expect(calculateAttackRatio(zeroAttack, negDefender)).toBeCloseTo(calculateAttackRatio(zeroAttack, zeroDefender));
    expect(calculateDamageOnHit(zeroAttack, negDefender)).toBeCloseTo(calculateDamageOnHit(zeroAttack, zeroDefender));
  });

  it('dégâts normaux négatifs : bornés à 0 au calcul', () => {
    const unit = makeUnit();
    const r = manualLayer(unit, { manual: { 'damage.normal': -50 } });
    expect(r.damage?.normal).toBe(-20);
    // normal borné à 0 : il ne reste que le perforant
    expect(calculateDamageOnHit(r, makeUnit({ armor: 0 }))).toBeCloseTo(10);
  });

  it('dégâts normaux et perforants nuls : 0 (et non NaN), même avec un bonus', () => {
    const noDamage = makeUnit({
      damage: { normal: 0, piercing: 0, is_magical: false, is_fire: false, bonus_v_large: 20, bonus_v_infantry: 20 },
    });
    const foot = makeUnit({ armor: 0 });
    const mounted = makeUnit({ is_large: true });
    expect(calculateDamageOnHit(noDamage, foot)).toBe(0);
    expect(calculateDamageOnHit(noDamage, mounted)).toBe(0);
  });

  it('dégâts normaux et perforants négatifs : bornés à 0 donc 0 (et non NaN)', () => {
    const negDamage = makeUnit({
      damage: { normal: -10, piercing: -5, is_magical: false, is_fire: false, bonus_v_large: 20, bonus_v_infantry: 20 },
    });
    expect(calculateDamageOnHit(negDamage, makeUnit())).toBe(0);
  });

  it('cas régulier inchangé : normal 30, perforant 10, bonus 20 contre armure 0', () => {
    const withBonus = makeUnit({
      damage: { normal: 30, piercing: 10, is_magical: false, is_fire: false, bonus_v_large: 0, bonus_v_infantry: 20 },
    });
    // (30 + 20×0,75) + 10 + 20×0,25 = 60
    expect(calculateDamageOnHit(withBonus, makeUnit({ armor: 0 }))).toBeCloseTo(60);
  });

  it('clampNonNegative', () => {
    expect(clampNonNegative(-3)).toBe(0);
    expect(clampNonNegative(4.5)).toBe(4.5);
  });
});
