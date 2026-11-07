import { describe, expect, it } from 'vitest';
import type { SpellDefinition, SpellVersion } from '../../types';
import { hasSpellEffects, listSelectableSpells } from './index';

const version = (id: string, effects: string[][]): SpellVersion => ({
  id,
  name: id,
  phases: effects.map((e, i) => ({ id: `${id}_${i}`, duration: 8, effects: e })),
});

const spell = (id: string, normal: SpellVersion, overcast?: SpellVersion): SpellDefinition => ({
  id, name: id, icon: '', mana_cost: 5, normal, ...(overcast && { overcast }),
});

describe('listSelectableSpells', () => {
  const catalog = {
    useful: spell('useful', version('useful', [['fx']])),
    empty: spell('empty', version('empty', [[], []])),
    partial: spell('partial', version('partial', [[], ['fx']])),
    overcastOnly: spell('overcastOnly', version('overcastOnly', [[]]), version('overcastOnly_up', [['fx']])),
  };

  it('masque les sorts dont toutes les phases ont des effets vides', () => {
    expect(listSelectableSpells(catalog).map(s => s.id)).toEqual(['useful', 'partial', 'overcastOnly']);
  });

  it('hasSpellEffects : au moins une phase avec effet', () => {
    expect(hasSpellEffects(catalog.empty)).toBe(false);
    expect(hasSpellEffects(catalog.partial)).toBe(true);
  });

  it('le catalogue réel ne contient aucun sort proposé sans effet', () => {
    expect(listSelectableSpells().every(hasSpellEffects)).toBe(true);
    expect(listSelectableSpells().length).toBeGreaterThan(0);
  });
});
