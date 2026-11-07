/**
 * Durée des phases d'une version de sort (voir specs/003-spells-row/research.md R3).
 *
 * Chaque phase est un effet indépendant. Une phase sans durée positive reprend, faute de mieux,
 * `special_ability.active_time` divisé par le nombre de phases retenues de la version.
 * Sont comptées dans ce diviseur : les phases à durée explicite et les phases sans durée qui ont
 * au moins un effet (`hasEffects`). Les phases `*_miscast` sont écartées en amont par l'appelant.
 * Une phase sans durée reste ignorée si `active_time` n'est pas > 0 ou si elle n'a aucun effet.
 *
 * @template {{ duration?: number | null }} P
 * @param {P[]} phases phases candidates (hors `*_miscast`)
 * @param {number | null | undefined} activeTime `special_ability.active_time` de la version
 * @param {(phase: P) => boolean} hasEffects la phase produit-elle au moins un effet ?
 * @returns {{ phase: P, duration: number }[]} phases retenues (même ordre) avec leur durée
 */
export function resolvePhaseDurations(phases, activeTime, hasEffects) {
  const kept = phases.filter((p) => p.duration > 0 || hasEffects(p));
  const fallback = activeTime > 0 && kept.length ? activeTime / kept.length : 0;
  return kept
    .map((phase) => ({ phase, duration: phase.duration > 0 ? phase.duration : fallback }))
    .filter((r) => r.duration > 0);
}
