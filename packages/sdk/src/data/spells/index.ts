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

/**
 * Un sort est proposable s'il produit au moins un effet : le catalogue généré contient aussi des sorts dont toutes
 * les phases ont `effects: []` (stats hors whitelist corps à corps), sans impact sur le duel (spec 003, cas limites).
 * Vérifie la version simple et l'overcast : un overcast seul porteur d'effets rend le sort utile.
 */
export function hasSpellEffects(spell: SpellDefinition): boolean {
  return [spell.normal, spell.overcast].some(
    version => version?.phases.some(phase => phase.effects.length > 0)
  );
}

/**
 * Sorts à proposer dans le sélecteur de la ligne « Sorts » : `listSpells()` privé des sorts sans aucun effet
 * (voir `hasSpellEffects`). Le catalogue est injectable pour les tests.
 */
export function listSelectableSpells(
  spells: Record<string, SpellDefinition> = SPELLS_CATALOG
): SpellDefinition[] {
  return Object.values(spells).filter(hasSpellEffects);
}
