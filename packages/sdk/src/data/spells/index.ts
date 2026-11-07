import type { SpellDefinition } from '../../types';
import { SPELLS_CATALOG } from './catalog.generated';

export * from './catalog.generated';

/** Retourne la définition d'un sort (identifié par la clé de sa version simple), ou undefined s'il est inconnu */
export function getSpell(id: string): SpellDefinition | undefined {
  return Object.prototype.hasOwnProperty.call(SPELLS_CATALOG, id)
    ? SPELLS_CATALOG[id]
    : undefined;
}

/** Liste les sorts du catalogue (versions simples uniquement), éventuellement filtrés */
export function listSpells(
  filter?: (spell: SpellDefinition) => boolean
): SpellDefinition[] {
  const all = Object.values(SPELLS_CATALOG);
  return filter ? all.filter(filter) : all;
}
