import type { BrawlModifiers, EffectDefinition, EffectImmunity, StatModifier, Unit } from '../types';
import { EFFECTS_CATALOG } from '../data/effects';

export type Catalog = Record<string, EffectDefinition>;

export const hasEffect = (catalog: Catalog, id: string): boolean =>
  Object.prototype.hasOwnProperty.call(catalog, id);

/**
 * Contexte partagé par toutes les couches d'un duel.
 * Chaque couche lit ce dont elle a besoin et ignore le reste.
 */
export interface LayerContext {
  /** Modifications manuelles (bonus utilisateur / URL) de cette unité */
  manual?: ManualModifications;
  /** Effets de la carte de l'unité (ids actifs) */
  cardEffects?: string[];
  /** Effets de la carte adverse (ids actifs) */
  opponentCardEffects?: string[];
  /** Catalogue d'effets (injectable pour les tests) */
  catalog?: Catalog;
}

/**
 * Une couche est une fonction pure : elle retourne une nouvelle unité sans muter celle reçue.
 * Elle ne touche que les champs qu'elle modifie, en partant de la valeur reçue : elle ne reconstruit
 * jamais un sous-objet (`damage`, `resistance`…) de zéro, elle copie celui qu'elle a reçu.
 */
export type UnitLayer = (unit: Unit, ctx: LayerContext) => Unit;

/** Exécute une liste explicite de couches, dans l'ordre donné */
export function runLayers(unit: Unit, layers: readonly UnitLayer[], ctx: LayerContext = {}): Unit {
  return layers.reduce((current, layer) => layer(current, ctx), unit);
}

// ---------------------------------------------------------------------------
// Couche « valeurs dérivées »
// ---------------------------------------------------------------------------

/** Taille non « small » : une entité large (monstre, cavalier…) */
const isBigSize = (size: string | undefined): boolean => !!size && size !== 'small';

/**
 * Valeurs déduites des données de base : `is_large` = la taille du cavalier, de la monture ou de l'engin
 * est définie et différente de 'small'.
 *
 * Unité persistée avant l'ajout de `mount_size` / `engine_size` (localStorage) : sans aucune des deux tailles,
 * un `is_large` déjà renseigné est conservé tel quel.
 */
export const derivedValuesLayer: UnitLayer = unit => {
  const { mount_size, engine_size, battle_entity } = unit.land_unit;
  if (mount_size === undefined && engine_size === undefined && unit.is_large !== undefined) {
    return unit;
  }
  return {
    ...unit,
    is_large: [battle_entity?.size, mount_size, engine_size].some(isBigSize),
  };
};

// ---------------------------------------------------------------------------
// Couche « modifications manuelles »
// ---------------------------------------------------------------------------

/** Chemins numériques modifiables manuellement (bonus utilisateur, synchronisé avec l'URL) */
export const UNIT_BONUS_PATHS = [
  'health.unit',
  'armor',
  'attack',
  'defense',
  'damage.normal',
  'damage.piercing',
  'damage.bonus_v_large',
  'damage.bonus_v_infantry',
  'resistance.physical',
  'resistance.magic',
  'resistance.fire',
  'resistance.ward_save',
  'recruitment_cost',
  'upkeep_cost',
] as const;

export type UnitBonusPath = typeof UNIT_BONUS_PATHS[number];

/** Modifications manuelles : valeur à ajouter à chaque chemin (absent = 0) */
export type ManualModifications = Partial<Record<UnitBonusPath, number>>;

/** Ajoute `value` au nombre situé à `path`, en copiant chaque objet traversé (sans mutation) */
function addAtPath<T extends object>(obj: T, path: string[], value: number): T {
  const [key, ...rest] = path;
  const current = (obj as Record<string, unknown>)[key];
  const next = rest.length === 0
    ? (typeof current === 'number' ? current : 0) + value
    : addAtPath((current ?? {}) as object, rest, value);
  return { ...obj, [key]: next };
}

/**
 * Applique les modifications manuelles : ajoute la valeur au champ, sans borne
 * (le total saisi par l'utilisateur doit rester exact, la borne se fait à la lecture).
 */
export const manualLayer: UnitLayer = (unit, ctx) => {
  let result = unit;
  for (const path of UNIT_BONUS_PATHS) {
    const value = ctx.manual?.[path];
    if (typeof value === 'number' && value !== 0) {
      result = addAtPath(result, path.split('.'), value);
    }
  }
  return result;
};

// ---------------------------------------------------------------------------
// Couches « effets » (positive puis négative)
// ---------------------------------------------------------------------------

type Polarity = 'positive' | 'negative';

/** Cumul des modificateurs d'une stat : somme des add, somme des deltas de mult (mult - 1) */
interface Acc { add: number; multDelta: number }

/** Part d'un modificateur appartenant à la polarité demandée (add > 0 / mult > 1 : positive, add < 0 / mult < 1 : négative) */
function addContribution(acc: Acc, mod: StatModifier | undefined, polarity: Polarity): void {
  if (!mod) return;
  const positive = polarity === 'positive';
  if (mod.add !== undefined && (positive ? mod.add > 0 : mod.add < 0)) acc.add += mod.add;
  if (mod.mult !== undefined && (positive ? mod.mult > 1 : mod.mult < 1)) acc.multDelta += mod.mult - 1;
}

/** Arrondi à 2 décimales : évite le bruit flottant (ex. 7,6000000000000005) */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Applique le cumul d'une étape à une valeur : `valeur × max(0, 1 + Σ(mult - 1)) + Σadd`.
 * Les multiplicateurs sont additifs au sein d'une étape (×1,5 et ×1,2 donnent ×1,7) et multiplicatifs
 * entre étapes (×1,5 positif puis ×0,5 négatif donnent ×0,75 ; ×0 négatif après ×1,5 positif donne 0).
 */
const applyAcc = (base: number | undefined, acc: Acc): number =>
  round2((base ?? 0) * Math.max(0, 1 + acc.multDelta) + acc.add);

/**
 * Modificateurs reçus par l'unité, collectés une seule fois :
 * - effets de sa propre carte, sauf ceux de type 'contact' (leur malus va à l'adversaire) ;
 * - effets de contact de la carte adverse (type 'contact' et `contact_effect` imbus par les autres effets),
 *   dédupliqués, sauf si l'unité est immunisée ('enemy_contact_effects').
 * Retourne aussi les immunités portées par la carte de l'unité.
 */
function collectReceived(ctx: LayerContext): { received: BrawlModifiers[]; immunities: Set<EffectImmunity> } {
  const catalog = ctx.catalog ?? EFFECTS_CATALOG;
  const defs = (ids: string[] = []): EffectDefinition[] =>
    ids.filter(id => hasEffect(catalog, id)).map(id => catalog[id]);

  const own = defs(ctx.cardEffects);
  const opponent = defs(ctx.opponentCardEffects);
  const immunities = new Set<EffectImmunity>(own.flatMap(e => e.modifiers.immunities ?? []));

  const contacts = new Map<string, EffectDefinition>();
  for (const e of opponent) {
    if (e.kind === 'contact') contacts.set(e.id, e);
    const contactId = e.modifiers.contact_effect;
    if (contactId && hasEffect(catalog, contactId)) contacts.set(contactId, catalog[contactId]);
  }

  const received = [
    ...own.filter(e => e.kind !== 'contact'),
    ...(immunities.has('enemy_contact_effects') ? [] : [...contacts.values()]),
  ].map(e => e.modifiers);
  return { received, immunities };
}

/** Arrondi à 6 décimales : la régénération est une fraction de vie max, donc minuscule (0,001) */
const round6 = (n: number): number => Math.round(n * 1e6) / 1e6;

const EMPTY_DAMAGE: NonNullable<Unit['damage']> = {
  normal: 0, piercing: 0, bonus_v_large: 0, bonus_v_infantry: 0, is_magical: false, is_fire: false,
};
const EMPTY_RESISTANCE: NonNullable<Unit['resistance']> = { physical: 0, magic: 0, fire: 0, ward_save: 0 };

/**
 * Fabrique la couche d'effets d'une polarité. Aucune borne : une stat peut devenir négative.
 * - stats : la part positive (resp. négative) de chaque modificateur reçu ;
 * - booléens (`is_magical`, `is_fire`) : `true` accorde (couche positive), `false` retire (couche négative) ;
 * - arme native (couche positive) : si l'unité porte nativement `flaming_attack` (resp. `magical_attack`) et que
 *   `ctx.cardEffects` est défini sans cet id (l'utilisateur l'a désactivé), `is_fire` (resp. `is_magical`) repart de
 *   false ; un autre effet actif qui l'accorde le remet à true ;
 * - régénération (couche positive) : somme des `regeneration` reçus ; les soins continus (sans durée) vont dans
 *   `per_second`, les soins limités ajoutent `per_second × durée` à `burst` ;
 * - immunités (couche négative uniquement) : `attack_reduction` ignore les malus d'attaque,
 *   `weapon_strength_reduction` ceux de dégâts normaux / perforants.
 */
function effectsLayer(polarity: Polarity): UnitLayer {
  return (unit, ctx) => {
    const { received, immunities } = collectReceived(ctx);
    const negative = polarity === 'negative';
    const dropAttack = negative && immunities.has('attack_reduction');
    const dropStrength = negative && immunities.has('weapon_strength_reduction');

    const stat = (value: number | undefined, pick: (m: BrawlModifiers) => StatModifier | undefined, drop = false): number => {
      const acc: Acc = { add: 0, multDelta: 0 };
      if (!drop) for (const m of received) addContribution(acc, pick(m), polarity);
      return applyAcc(value, acc);
    };

    // Valeur booléenne : true accordé (positif) / false retiré (négatif), sinon inchangée
    const flag = (value: boolean, pick: (m: BrawlModifiers) => boolean | undefined): boolean => {
      const wanted = !negative;
      return received.some(m => pick(m) === wanted) ? wanted : value;
    };

    // Unité sans damage / resistance (champs optionnels) : on part de zéro, sinon de la valeur reçue
    const damage = { ...EMPTY_DAMAGE, ...unit.damage };
    // Arme native désactivée par l'utilisateur : on repart de false avant d'appliquer les effets actifs
    const nativeOff = (id: string): boolean =>
      !negative && !!unit.effects?.includes(id) && !!ctx.cardEffects && !ctx.cardEffects.includes(id);
    if (nativeOff('flaming_attack')) damage.is_fire = false;
    if (nativeOff('magical_attack')) damage.is_magical = false;
    const resistance = { ...EMPTY_RESISTANCE, ...unit.resistance };
    // Régénération : positive uniquement, aucun malus de régénération
    let regeneration = unit.regeneration;
    if (!negative) {
      const total = { per_second: unit.regeneration?.per_second ?? 0, burst: unit.regeneration?.burst ?? 0 };
      let found = false;
      for (const m of received) {
        if (!m.regeneration) continue;
        found = true;
        const { per_second, duration } = m.regeneration;
        if (duration !== undefined && duration > 0) total.burst += per_second * duration;
        else total.per_second += per_second;
      }
      if (found) regeneration = { per_second: round6(total.per_second), burst: round6(total.burst) };
    }

    return {
      ...unit,
      ...(regeneration && { regeneration }),
      attack: stat(unit.attack, m => m.attack, dropAttack),
      defense: stat(unit.defense, m => m.defense),
      armor: stat(unit.armor, m => m.armor),
      damage: {
        ...damage,
        normal: stat(damage.normal, m => m.damage?.normal, dropStrength),
        piercing: stat(damage.piercing, m => m.damage?.piercing, dropStrength),
        bonus_v_large: stat(damage.bonus_v_large, m => m.damage?.bonus_v_large),
        bonus_v_infantry: stat(damage.bonus_v_infantry, m => m.damage?.bonus_v_infantry),
        is_magical: flag(damage.is_magical, m => m.damage?.is_magical),
        is_fire: flag(damage.is_fire, m => m.damage?.is_fire),
      },
      resistance: {
        ...resistance,
        physical: stat(resistance.physical, m => m.resistance?.physical),
        magic: stat(resistance.magic, m => m.resistance?.magic),
        fire: stat(resistance.fire, m => m.resistance?.fire),
        ward_save: stat(resistance.ward_save, m => m.resistance?.ward_save),
      },
    };
  };
}

/** Effets positifs : bonus de stats (add > 0, mult > 1) et attributs accordés (`is_magical`/`is_fire` à true) */
export const positiveEffectsLayer: UnitLayer = effectsLayer('positive');

/**
 * Effets négatifs : malus de stats (add < 0, mult < 1) et attributs retirés (`is_magical`/`is_fire` à false),
 * filtrés par les immunités de l'unité. Un retrait l'emporte sur l'arme native, une modification manuelle
 * et un effet positif, car cette couche passe en dernier.
 */
export const negativeEffectsLayer: UnitLayer = effectsLayer('negative');

/**
 * Ordre OBLIGATOIRE des couches qui produisent l'unité effective d'un duel (avant les calculs de combat) :
 *   1. données de base (adaptUnit), puis valeurs dérivées (`is_large`) ;
 *   2. modifications manuelles (bonus utilisateur / URL) ;
 *   3. effets positifs ;
 *   4. effets négatifs ;
 *   5. calculs de combat (hors de cette liste : ils bornent les stats à 0 à la lecture).
 */
export const EFFECTIVE_UNIT_LAYERS: readonly UnitLayer[] = [
  derivedValuesLayer,
  manualLayer,
  positiveEffectsLayer,
  negativeEffectsLayer,
];
