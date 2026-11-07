import { describe, expect, it } from 'vitest';
import type { EffectDefinition, Unit } from '../types';
import { getDefaultEffects, getNativeCardEffects } from './applyEffects';
import type { Catalog } from './unitLayers';

const fx = (id: string, extra: Partial<EffectDefinition> = {}): EffectDefinition => ({
  id, kind: 'ability', name: id, icon: '', placement: 'effects', target: 'self', passive: true,
  polarity: 'positive', modifiers: { attack: { add: 5 } }, ...extra,
});

const catalog: Catalog = {
  passive: fx('passive'),
  spell_self: fx('spell_self', { spell: { spell_id: 'spell_self' } }),
  spell_enemy: fx('spell_enemy', { target: 'enemy', polarity: 'negative', spell: { spell_id: 'spell_enemy' } }),
  hex: fx('hex', { target: 'enemy', polarity: 'negative' }),
};

const unit = (effects: string[]): Unit => ({
  version: 'v', unit: 'u', caste: 'melee_infantry', num_men: 1,
  land_unit: { num_engines: 0, num_mounts: 0, onscreen_name: 'u', bonus_hit_points: 0, battle_entity: { hit_points: 1, size: 'small', type: '' } },
  battle_mounts: [], icon: '', effects,
});

describe('getNativeCardEffects et entrées de sort', () => {
  it('ignore les entrées `spell`, des deux côtés', () => {
    const own = unit(['passive', 'spell_self', 'spell_enemy']);
    const opponent = unit(['hex', 'spell_enemy']);
    expect(getNativeCardEffects(own, opponent, catalog).map(e => [e.id, e.source])).toEqual([
      ['passive', 'own'],
      ['hex', 'opponent'],
    ]);
    expect(getDefaultEffects(own, opponent, catalog)).toEqual(['passive', 'hex']);
  });
});
