import type { DuelPhaseUnits, UnitWithEntityNumber } from '@tww3-brawl/sdk/src/logic/twoSideCalculations';
import type { Unit, Version, Faction, SpellCasts } from '@tww3-brawl/sdk/src/types'
import { buildDuelPhases, spellWindows, type DuelPhase } from '@tww3-brawl/sdk/src/logic/spellPhases';
import type { Paths } from '~/shared/jsonpath';
import { getNativeCardEffects } from '@tww3-brawl/sdk/src/logic/applyEffects';
import {
  EFFECTIVE_UNIT_LAYERS,
  UNIT_BONUS_PATHS,
  derivedValuesLayer,
  runLayers,
  type LayerContext,
  type UnitBonusPath,
} from '@tww3-brawl/sdk/src/logic/unitLayers';
import { getEffect, getSpell } from '@tww3-brawl/sdk';

// Type for unit selection with version and faction
export interface UnitSelection {
  unit?: Unit;
  version?: Version;
  faction?: Faction;
  // Name pinned at the moment of the original hero/unit pick (see
  // updateUnitSelection in UnitCard/index.vue). Kept stable across later
  // mount swaps (updateUnit), which replace `unit` with the mounted
  // variant's own data but must NOT change the displayed card title
  // (spec.md FR-008).
  displayName?: string;
}

// Type for unit with active entity count
export interface UnitWithEntityNumberAndBonus {
  selection: UnitSelection;
  entityNumber: number;
  bonus: UnitBonus;
  /** Optionnel : absent des états persistés avant l'ajout des effets */
  effects?: UnitEffectState;
  /** Optionnel : absent des états persistés avant l'ajout de la ligne « Sorts » */
  spells?: UnitSpellState;
}

/** Lancers de sorts d'une carte (compteurs entiers 0..MAX_SPELL_CASTS par version) */
export interface UnitSpellState {
  casts: SpellCasts;
}

/** Borne haute d'un compteur de lancers */
export const MAX_SPELL_CASTS = 9;

/**
 * État des effets d'une carte :
 * - `overrides` : activation forcée par id (prioritaire sur l'état par défaut)
 * - `added` : ids du catalogue ajoutés manuellement (actifs par défaut)
 */
export interface UnitEffectState {
  overrides: Record<string, boolean>;
  added: string[];
}

export function defaultEffectState(): UnitEffectState {
  return { overrides: {}, added: [] };
}

/** Effet affiché sur une carte avec son état courant */
export interface DisplayedEffect {
  id: string;
  /** true : effet natif de l'unité (ou sort de l'adversaire) ; false : ajouté manuellement */
  native: boolean;
  active: boolean;
  /** 'opponent' : effet natif placé ici parce que l'adversaire le porte */
  source: 'own' | 'opponent';
}

type SideData = Readonly<UnitWithEntityNumberAndBonus> | null | undefined;

/**
 * Effets affichés sur la carte d'un côté : natifs (selon l'adversaire) puis ajoutés.
 * Actif = override explicite, sinon état par défaut (passif pour un natif, actif pour un ajouté).
 */
export function displayedEffects(side: SideData, other: SideData): DisplayedEffect[] {
  const unit = side?.selection?.unit;
  if (!unit) {
    return [];
  }
  const overrides = side.effects?.overrides ?? {};
  const result: DisplayedEffect[] = getNativeCardEffects(unit, other?.selection?.unit).map(e => ({
    id: e.id,
    native: true,
    active: overrides[e.id] ?? e.active,
    source: e.source,
  }));
  const seen = new Set(result.map(e => e.id));
  for (const id of side.effects?.added ?? []) {
    if (!seen.has(id) && getEffect(id)) {
      seen.add(id);
      result.push({ id, native: false, active: overrides[id] ?? true, source: 'own' });
    }
  }
  return result;
}

/** Ids des effets actifs affichés sur la carte d'un côté */
export function activeEffectIds(side: SideData, other: SideData): string[] {
  return displayedEffects(side, other).filter(e => e.active).map(e => e.id);
}

/**
 * Unités effectives d'un duel : couches appliquées dans l'ordre obligatoire du SDK
 * (valeurs dérivées, bonus manuel, effets positifs, effets négatifs).
 * Point d'entrée unique pour tous les calculs de combat.
 */
export function effectiveUnits(
  left: SideData,
  right: SideData
): { left: UnitWithEntityNumber | null; right: UnitWithEntityNumber | null } {
  const build = (side: SideData, other: SideData): UnitWithEntityNumber | null => {
    if (!side) {
      return null;
    }
    return {
      selection: {
        unit: fullyEffectiveUnit(side, other),
        version: side.selection?.version,
        faction: side.selection?.faction,
      },
      entityNumber: side.entityNumber,
    };
  };
  return { left: build(left, right), right: build(right, left) };
}

/** Lancers de sorts d'un côté (vide si absent, ex. ancien état persisté) */
export function spellCastsOf(side: SideData): SpellCasts {
  return side?.spells?.casts ?? {};
}

/**
 * Coups couverts par un sort lancé : fenêtre la plus longue parmi ses phases et ses versions
 * (les phases sont indépendantes et empilées au début du combat, donc elles se recouvrent).
 */
export function spellCoveredHits(spellId: string, casts: { normal: number; overcast: number }): number {
  return Math.max(0, ...spellWindows({ [spellId]: casts }, {}).map(w => w.instances));
}

/** Sorts lancés d'un côté (compteur total > 0, id connu du catalogue) avec leurs coups couverts */
export function castSpells(side: SideData) {
  return Object.entries(spellCastsOf(side)).flatMap(([id, casts]) => {
    const spell = getSpell(id);
    return spell && casts.normal + casts.overcast > 0
      ? [{ spell, casts, hits: spellCoveredHits(id, casts) }]
      : [];
  });
}

/**
 * Duel découpé en phases (sorts) : phases du SDK et unités effectives de chaque phase.
 * Pour chaque phase, les effets de sort actifs (`leftCardEffects` / `rightCardEffects`) s'ajoutent aux
 * `cardEffects` de la carte, puis les mêmes couches que `effectiveUnits` sont appliquées.
 * Sans sort lancé, une seule phase `[0, ∞)` dont les unités valent celles de `effectiveUnits`.
 */
export function duelPhases(
  left: SideData,
  right: SideData
): { phases: DuelPhase[]; units: DuelPhaseUnits[] } | null {
  if (!left || !right) {
    return null;
  }
  const phases = buildDuelPhases(spellWindows(spellCastsOf(left), spellCastsOf(right)));
  const build = (side: NonNullable<SideData>, other: NonNullable<SideData>, own: string[], opposing: string[]): UnitWithEntityNumber => {
    const ctx = layerContext(side, other);
    return {
      selection: {
        unit: side.selection?.unit && runLayers(side.selection.unit, EFFECTIVE_UNIT_LAYERS, {
          ...ctx,
          cardEffects: [...(ctx.cardEffects ?? []), ...own],
          opponentCardEffects: [...(ctx.opponentCardEffects ?? []), ...opposing],
        }),
        version: side.selection?.version,
        faction: side.selection?.faction,
      },
      entityNumber: side.entityNumber,
    };
  };
  const units = phases.map(p => ({
    hits: p.end - p.start,
    left: build(left, right, p.leftCardEffects, p.rightCardEffects),
    right: build(right, left, p.rightCardEffects, p.leftCardEffects),
  }));
  return { phases, units };
}

/** Unité de base d'un côté (valeurs dérivées uniquement, sans bonus ni effets) */
export function baseUnit(side: SideData): Unit | undefined {
  const unit = side?.selection?.unit;
  return unit && runLayers(unit, [derivedValuesLayer]);
}

/** Unité d'un côté après toutes les couches (valeurs dérivées, bonus manuel, effets) */
export function fullyEffectiveUnit(side: SideData, other: SideData): Unit | undefined {
  const unit = side?.selection?.unit;
  return unit && runLayers(unit, EFFECTIVE_UNIT_LAYERS, layerContext(side, other));
}

function layerContext(side: NonNullable<SideData>, other: SideData): LayerContext {
  return {
    manual: side.bonus,
    cardEffects: activeEffectIds(side, other),
    opponentCardEffects: activeEffectIds(other, side),
  };
}

export type UnitBonus = {[key in UnitBonusPathes]: number};

export function defaultUnitBonus(): UnitBonus {
  return UnitBonusPathes.reduce((acc, path) => {
    acc[path] = 0;
    return acc;
  }, {} as UnitBonus);
}

export type UnitPaths = Paths<Required<Unit>>;

/** Chemins modifiables manuellement : liste définie par le SDK (source unique, pour éviter toute dérive) */
export const UnitBonusPathes = UNIT_BONUS_PATHS;

export type UnitBonusPathes = UnitBonusPath;

export const statistics: { path: UnitPaths, color: string, label: string }[] = [
  { path: 'health.unit', color: 'green', label: 'Health' },
  { path: 'attack', color: 'blue', label: 'Attack' },
  { path: 'damage.normal', color: 'green', label: 'Damage Normal' },
  { path: 'damage.piercing', color: 'green', label: 'Damage Piercing' },
  { path: 'damage.bonus_v_large', color: 'green', label: 'Bonus V Large' },
  { path: 'damage.bonus_v_infantry', color: 'green', label: 'Bonus V Infantry' },
  { path: 'defense', color: 'red', label: 'Defense' },
  { path: 'armor', color: 'orange', label: 'Armor' },
  { path: 'resistance.physical', color: 'pink', label: 'Resistance Physical' },
  { path: 'resistance.magic', color: 'pink', label: 'Resistance Magic' },
  { path: 'resistance.fire', color: 'pink', label: 'Resistance Fire' },
  { path: 'resistance.ward_save', color: 'pink', label: 'Resistance Ward Save' },
  { path: 'recruitment_cost', color: '#B8860B', label: 'Recruitment Cost' },
  { path: 'upkeep_cost', color: '#B8860B', label: 'Upkeep Cost' },
] as const
