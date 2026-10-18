import type { BrawlModifiers, EffectDefinition, EffectImmunity, StatModifier, Unit } from '../types';
import { EFFECTS_CATALOG } from '../data/effects';

type Catalog = Record<string, EffectDefinition>;

const has = (catalog: Catalog, id: string): boolean =>
  Object.prototype.hasOwnProperty.call(catalog, id);

/**
 * Effets natifs passifs d'une unité (toujours actifs en jeu).
 */
export function getDefaultEffects(unit: Unit, catalog: Catalog = EFFECTS_CATALOG): string[] {
  return (unit.effects ?? []).filter(id => has(catalog, id) && catalog[id].passive === true);
}

/** Accumule les modificateurs d'une stat : somme des add, produit des mult */
interface Acc { add: number; mult: number }
const newAcc = (): Acc => ({ add: 0, mult: 1 });

function accumulate(acc: Acc, mod: StatModifier | undefined, dropReductions: boolean): void {
  if (!mod) return;
  if (mod.add !== undefined && !(dropReductions && mod.add < 0)) acc.add += mod.add;
  if (mod.mult !== undefined && !(dropReductions && mod.mult < 1)) acc.mult *= mod.mult;
}

const apply = (base: number | undefined, acc: Acc): number => (base ?? 0) * acc.mult + acc.add;
const clamp0 = (n: number): number => Math.max(0, n);

/**
 * Applique des effets à une unité et retourne une nouvelle unité (sans mutation).
 *
 * - `ownEffects` : effets actifs sur l'unité (seuls ceux de cible 'self' la modifient)
 * - `enemyEffects` : effets actifs sur l'ennemi (seuls ceux de cible 'enemy' modifient l'unité)
 */
export function applyEffects(
  unit: Unit,
  ownEffects: string[],
  enemyEffects: string[],
  catalog: Catalog = EFFECTS_CATALOG
): Unit {
  const defs = (ids: string[]): EffectDefinition[] =>
    ids.filter(id => has(catalog, id)).map(id => catalog[id]);

  const own = defs(ownEffects);
  const enemy = defs(enemyEffects);

  const immunities = new Set<EffectImmunity>(own.flatMap(e => e.modifiers.immunities ?? []));

  // Effets de contact imbus par les effets ennemis
  const enemyIds = new Set(enemy.map(e => e.id));
  for (const e of enemy) {
    const contactId = e.modifiers.contact_effect;
    if (contactId && !enemyIds.has(contactId) && has(catalog, contactId)) {
      enemyIds.add(contactId);
      enemy.push(catalog[contactId]);
    }
  }

  const received: BrawlModifiers[] = [
    ...own.filter(e => e.target === 'self'),
    ...enemy.filter(e => e.target === 'enemy'),
  ]
    .filter(e => !(e.kind === 'contact' && immunities.has('enemy_contact_effects') && enemy.includes(e)))
    .map(e => e.modifiers);

  const dropAttack = immunities.has('attack_reduction');
  const dropStrength = immunities.has('weapon_strength_reduction');

  const attack = newAcc();
  const defense = newAcc();
  const armor = newAcc();
  const normal = newAcc();
  const piercing = newAcc();
  const bonusLarge = newAcc();
  const bonusInfantry = newAcc();
  const physical = newAcc();
  const magic = newAcc();
  const fire = newAcc();
  const ward = newAcc();

  let magical = false;
  let flaming = false;
  let removeMagical = false;
  let removeFire = false;

  for (const m of received) {
    accumulate(attack, m.attack, dropAttack);
    accumulate(defense, m.defense, false);
    accumulate(armor, m.armor, false);
    accumulate(normal, m.damage?.normal, dropStrength);
    accumulate(piercing, m.damage?.piercing, dropStrength);
    accumulate(bonusLarge, m.damage?.bonus_v_large, false);
    accumulate(bonusInfantry, m.damage?.bonus_v_infantry, false);
    accumulate(physical, m.resistance?.physical, false);
    accumulate(magic, m.resistance?.magic, false);
    accumulate(fire, m.resistance?.fire, false);
    accumulate(ward, m.resistance?.ward_save, false);
    if (m.damage?.is_magical === true) magical = true;
    if (m.damage?.is_magical === false) removeMagical = true;
    if (m.damage?.is_fire === true) flaming = true;
    if (m.damage?.is_fire === false) removeFire = true;
  }

  return {
    ...unit,
    attack: clamp0(apply(unit.attack, attack)),
    defense: clamp0(apply(unit.defense, defense)),
    armor: clamp0(apply(unit.armor, armor)),
    damage: {
      normal: clamp0(apply(unit.damage?.normal, normal)),
      piercing: clamp0(apply(unit.damage?.piercing, piercing)),
      bonus_v_large: clamp0(apply(unit.damage?.bonus_v_large, bonusLarge)),
      bonus_v_infantry: clamp0(apply(unit.damage?.bonus_v_infantry, bonusInfantry)),
      is_magical: magical && !removeMagical,
      is_fire: flaming && !removeFire,
    },
    resistance: {
      physical: apply(unit.resistance?.physical, physical),
      magic: apply(unit.resistance?.magic, magic),
      fire: apply(unit.resistance?.fire, fire),
      ward_save: apply(unit.resistance?.ward_save, ward),
    },
  };
}
