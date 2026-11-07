import { describe, expect, it } from 'vitest';
// @ts-expect-error script .mjs sans déclaration de types (hors du projet tsc du SDK)
import { resolvePhaseDurations } from '../../../../../scripts/spell-durations.mjs';

type Phase = { id: string; duration?: number | null; fx?: boolean };
const resolve = (phases: Phase[], activeTime: number | null | undefined) =>
  (resolvePhaseDurations(phases, activeTime, (p: Phase) => p.fx !== false) as { phase: Phase; duration: number }[])
    .map(r => [r.phase.id, r.duration]);

describe('resolvePhaseDurations', () => {
  it('conserve les durées explicites', () => {
    expect(resolve([{ id: 'a', duration: 10 }, { id: 'b', duration: 14 }], 99)).toEqual([['a', 10], ['b', 14]]);
  });

  it('repli : active_time / nombre de phases pour une phase sans durée', () => {
    expect(resolve([{ id: 'a', duration: 0 }], 20)).toEqual([['a', 20]]);
    expect(resolve([{ id: 'a', duration: null }, { id: 'b', duration: 0 }], 20)).toEqual([['a', 10], ['b', 10]]);
  });

  it('le diviseur compte aussi les phases à durée explicite', () => {
    expect(resolve([{ id: 'a', duration: 8 }, { id: 'b', duration: 0 }], 20)).toEqual([['a', 8], ['b', 10]]);
  });

  it('une phase sans durée ni effet est ignorée et ne compte pas dans le diviseur', () => {
    expect(resolve([{ id: 'a', duration: 0 }, { id: 'b', duration: 0, fx: false }], 12)).toEqual([['a', 12]]);
  });

  it('reste ignorée sans active_time positif', () => {
    expect(resolve([{ id: 'a', duration: 0 }], 0)).toEqual([]);
    expect(resolve([{ id: 'a', duration: 0 }, { id: 'b', duration: 5 }], undefined)).toEqual([['b', 5]]);
  });
});
