import type { EffectDefinition } from '../../types';

/**
 * Effets d'arme natifs, non issus de la base de données du jeu.
 */
export const BUILTIN_EFFECTS: Record<string, EffectDefinition> = {
  magical_attack: {
    id: 'magical_attack',
    kind: 'weapon',
    name: 'Magical Attacks',
    icon: 'ui/skins/default/modifier_icon_magical.png',
    placement: 'attack',
    target: 'self',
    passive: true,
    polarity: 'positive',
    modifiers: { damage: { is_magical: true } },
  },
  flaming_attack: {
    id: 'flaming_attack',
    kind: 'weapon',
    name: 'Flaming Attacks',
    icon: 'ui/skins/default/modifier_icon_flaming.png',
    placement: 'attack',
    target: 'self',
    passive: true,
    polarity: 'positive',
    modifiers: { damage: { is_fire: true } },
  },
};
