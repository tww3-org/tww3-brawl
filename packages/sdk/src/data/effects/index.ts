import type { EffectDefinition } from '../../types';
import { BUILTIN_EFFECTS } from './builtinEffects';
import { GENERATED_EFFECTS } from './catalog.generated';

export * from './builtinEffects';
export * from './catalog.generated';

/** Catalogue complet : effets natifs + effets générés */
export const EFFECTS_CATALOG: Record<string, EffectDefinition> = {
  ...GENERATED_EFFECTS,
  ...BUILTIN_EFFECTS,
};

/** Retourne la définition d'un effet, ou undefined s'il est inconnu */
export function getEffect(id: string): EffectDefinition | undefined {
  return Object.prototype.hasOwnProperty.call(EFFECTS_CATALOG, id)
    ? EFFECTS_CATALOG[id]
    : undefined;
}

/** Liste les effets du catalogue, éventuellement filtrés */
export function listEffects(
  filter?: (effect: EffectDefinition) => boolean
): EffectDefinition[] {
  const all = Object.values(EFFECTS_CATALOG);
  return filter ? all.filter(filter) : all;
}
