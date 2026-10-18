import type { BrawlModifiers, EffectDefinition, EffectImmunity, StatModifier, Unit } from '../types';
import { EFFECTS_CATALOG } from '../data/effects';

type Catalog = Record<string, EffectDefinition>;

const has = (catalog: Catalog, id: string): boolean =>
  Object.prototype.hasOwnProperty.call(catalog, id);

/** Effet natif affiché sur une carte, avec son état par défaut */
export interface NativeCardEffect {
  id: string;
  active: boolean;
}

/** Sort d'une unité qui s'applique à l'ennemi (ex. hex) : affiché sur la carte de celui qui le reçoit */
const isEnemyAbility = (e: EffectDefinition): boolean => e.kind === 'ability' && e.target === 'enemy';

/**
 * Effets natifs affichés sur la carte d'une unité, avec leur état par défaut :
 * ses propres effets (hors sorts ciblant l'ennemi) + les sorts ciblant l'ennemi de l'adversaire.
 * Actif par défaut si l'effet est passif.
 */
export function getNativeCardEffects(
  unit: Unit,
  opponent?: Unit,
  catalog: Catalog = EFFECTS_CATALOG
): NativeCardEffect[] {
  const result = new Map<string, NativeCardEffect>();
  const add = (id: string): void => {
    if (!result.has(id)) result.set(id, { id, active: catalog[id].passive === true });
  };
  for (const id of unit.effects ?? []) {
    if (has(catalog, id) && !isEnemyAbility(catalog[id])) add(id);
  }
  for (const id of opponent?.effects ?? []) {
    if (has(catalog, id) && isEnemyAbility(catalog[id])) add(id);
  }
  return [...result.values()];
}

/** Effets natifs actifs par défaut (passifs) sur la carte d'une unité */
export function getDefaultEffects(
  unit: Unit,
  opponent?: Unit,
  catalog: Catalog = EFFECTS_CATALOG
): string[] {
  return getNativeCardEffects(unit, opponent, catalog).filter(e => e.active).map(e => e.id);
}

/**
 * Accumule les modificateurs d'une stat : somme des add, somme des deltas de mult (mult - 1).
 * Les multiplicateurs forment une couche additive : ×0 et ×1,5 donnent 1 + (-1 + 0,5) = 0,5.
 */
interface Acc { add: number; multDelta: number }
const newAcc = (): Acc => ({ add: 0, multDelta: 0 });

function accumulate(acc: Acc, mod: StatModifier | undefined, dropReductions: boolean): void {
  if (!mod) return;
  if (mod.add !== undefined && !(dropReductions && mod.add < 0)) acc.add += mod.add;
  if (mod.mult !== undefined && !(dropReductions && mod.mult < 1)) acc.multDelta += mod.mult - 1;
}

const apply = (base: number | undefined, acc: Acc): number => (base ?? 0) * Math.max(0, 1 + acc.multDelta) + acc.add;
const clamp0 = (n: number): number => Math.max(0, n);

/**
 * Applique des effets à une unité et retourne une nouvelle unité (sans mutation).
 *
 * Les paramètres sont les effets « de carte » : ceux affichés (et actifs) sur la carte de chaque unité.
 * - `cardEffects` : effets de la carte de l'unité. Ils la modifient tous, sauf ceux de type 'contact'
 *   (leur malus va à l'adversaire) ; leur `contact_effect` est lui aussi destiné à l'adversaire.
 * - `opponentCardEffects` : effets de la carte adverse. Seuls les effets de contact modifient l'unité :
 *   ceux de type 'contact' et les `contact_effect` imbus par les autres effets.
 *
 * L'immunité 'enemy_contact_effects' (portée par la carte de l'unité) annule les effets de contact reçus.
 */
export function applyEffects(
  unit: Unit,
  cardEffects: string[],
  opponentCardEffects: string[],
  catalog: Catalog = EFFECTS_CATALOG
): Unit {
  const defs = (ids: string[]): EffectDefinition[] =>
    ids.filter(id => has(catalog, id)).map(id => catalog[id]);

  const own = defs(cardEffects);
  const opponent = defs(opponentCardEffects);

  const immunities = new Set<EffectImmunity>(own.flatMap(e => e.modifiers.immunities ?? []));

  // Effets de contact reçus de l'adversaire (dédupliqués)
  const contacts = new Map<string, EffectDefinition>();
  for (const e of opponent) {
    if (e.kind === 'contact') contacts.set(e.id, e);
    const contactId = e.modifiers.contact_effect;
    if (contactId && has(catalog, contactId)) contacts.set(contactId, catalog[contactId]);
  }

  const received: BrawlModifiers[] = [
    ...own.filter(e => e.kind !== 'contact'),
    ...(immunities.has('enemy_contact_effects') ? [] : [...contacts.values()]),
  ].map(e => e.modifiers);

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
