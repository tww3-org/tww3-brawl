import type { EffectDefinition, Unit } from '../types';
import { EFFECTS_CATALOG } from '../data/effects';
import { hasEffect as has, negativeEffectsLayer, positiveEffectsLayer, runLayers, type Catalog } from './unitLayers';

/** Effet natif affiché sur une carte, avec son état par défaut */
export interface NativeCardEffect {
  id: string;
  active: boolean;
  /** 'opponent' : effet placé sur la carte parce que l'adversaire le porte */
  source: 'own' | 'opponent';
}

/** Sort d'une unité qui s'applique à l'ennemi (ex. hex) : affiché sur la carte de celui qui le reçoit */
const isEnemyAbility = (e: EffectDefinition): boolean => e.kind === 'ability' && e.target === 'enemy';

/**
 * Effets natifs affichés sur la carte d'une unité, avec leur état par défaut :
 * ses propres effets (hors sorts ciblant l'ennemi) + les sorts ciblant l'ennemi de l'adversaire.
 * Actif par défaut si `default_active`, sinon si l'effet est passif.
 */
export function getNativeCardEffects(
  unit: Unit,
  opponent?: Unit,
  catalog: Catalog = EFFECTS_CATALOG
): NativeCardEffect[] {
  const result = new Map<string, NativeCardEffect>();
  const add = (id: string, source: NativeCardEffect['source']): void => {
    if (!result.has(id)) {
      const def = catalog[id];
      result.set(id, { id, active: def.default_active ?? def.passive === true, source });
    }
  };
  for (const id of unit.effects ?? []) {
    if (has(catalog, id) && !isEnemyAbility(catalog[id])) add(id, 'own');
  }
  for (const id of opponent?.effects ?? []) {
    if (has(catalog, id) && isEnemyAbility(catalog[id])) add(id, 'opponent');
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
 * Applique les effets à une unité et retourne une nouvelle unité (sans mutation) :
 * couche des effets positifs, puis couche des effets négatifs (voir `unitLayers.ts`).
 *
 * Les paramètres sont les effets « de carte » : ceux affichés (et actifs) sur la carte de chaque unité.
 * - `cardEffects` : effets de la carte de l'unité. Ils la modifient tous, sauf ceux de type 'contact'
 *   (leur malus va à l'adversaire) ; leur `contact_effect` est lui aussi destiné à l'adversaire.
 * - `opponentCardEffects` : effets de la carte adverse. Seuls les effets de contact modifient l'unité :
 *   ceux de type 'contact' et les `contact_effect` imbus par les autres effets.
 *
 * Les immunités (portées par la carte de l'unité) ne filtrent que les modificateurs négatifs concernés.
 */
export function applyEffects(
  unit: Unit,
  cardEffects: string[],
  opponentCardEffects: string[],
  catalog: Catalog = EFFECTS_CATALOG
): Unit {
  return runLayers(unit, [positiveEffectsLayer, negativeEffectsLayer], { cardEffects, opponentCardEffects, catalog });
}
