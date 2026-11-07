import type { EffectDefinition, SpellCasts, SpellDefinition } from '../types';
import { EFFECTS_CATALOG } from '../data/effects';
import { SPELLS_CATALOG } from '../data/spells';
import { SECONDS_PER_ATTACK } from './oneSideCalculations';

/**
 * Découpage du duel en phases pour les sorts (spec 003-spells-row, sans simulation).
 *
 * Algorithme :
 * 1. Chaque phase d'un sort est un effet indépendant (research R3) : une fenêtre par
 *    (côté, sort, version simple/overcast, phase), de `lancers × durée_phase / SECONDS_PER_ATTACK`
 *    instances de calcul (un coup = 4 s). Les lancers d'une même fenêtre additionnent leur durée ;
 *    la valeur peut être fractionnaire (on raisonne en espérance). Un compteur à 0 ne crée rien.
 * 2. Hypothèse « empilement au début » : toutes les instances couvertes sont placées au début du combat
 *    (aucun moment de lancement n'est simulé), donc la fenêtre `e` couvre les coups `[0, nₑ)`.
 *    Conséquence connue : les étages successifs d'un sort (ex. Heart of Winter `_1`…`_4`) agissent
 *    ensemble au lieu de s'enchaîner ; seul le résultat final du duel compte.
 * 3. Bornes de phases = union triée et dédoublonnée des nₑ des deux côtés, précédée de 0 ; la dernière
 *    phase `[max nₑ, ∞)` n'a aucun sort. La phase `[bᵢ, bᵢ₊₁)` contient les fenêtres telles que nₑ > bᵢ.
 * 4. Les modificateurs d'un sort viennent des `EffectDefinition` de la phase (R6) : ceux qui visent
 *    `self` vont sur la carte du lanceur, ceux qui visent `enemy` sur celle de l'adversaire.
 *
 * Les catalogues sont injectables pour les tests.
 */

export type SpellSide = 'left' | 'right';

/** Instances de calcul couvertes par une phase d'un sort lancé par un côté */
export interface SpellWindow {
  /** Côté qui lance */
  side: SpellSide;
  spellId: string;
  version: 'normal' | 'overcast';
  /** Id de la phase du sort */
  phaseId: string;
  /** `lancers × durée / SECONDS_PER_ATTACK`, > 0 ; fractionnaire autorisé */
  instances: number;
}

/** Une phase du duel : intervalle `[start, end)` en coups et effets de sort actifs */
export interface DuelPhase {
  /** Borne incluse, en coups */
  start: number;
  /** Borne exclue ; Infinity pour la dernière phase */
  end: number;
  /** Fenêtres actives (instances > start) */
  active: SpellWindow[];
  /** Ids d'effets de sort à ajouter aux `cardEffects` de l'unité de gauche (routage self/enemy) */
  leftCardEffects: string[];
  /** Ids d'effets de sort à ajouter aux `cardEffects` de l'unité de droite */
  rightCardEffects: string[];
}

const VERSIONS = ['normal', 'overcast'] as const;

/**
 * Fenêtres (instances couvertes) des sorts lancés par les deux côtés. Les sorts inconnus du catalogue,
 * les versions absentes (overcast inexistant) et les compteurs ≤ 0 sont ignorés.
 */
export function spellWindows(
  left: SpellCasts,
  right: SpellCasts,
  spells: Record<string, SpellDefinition> = SPELLS_CATALOG
): SpellWindow[] {
  const windows: SpellWindow[] = [];
  const sides: [SpellSide, SpellCasts][] = [['left', left], ['right', right]];
  for (const [side, casts] of sides) {
    for (const [spellId, count] of Object.entries(casts)) {
      const spell = Object.prototype.hasOwnProperty.call(spells, spellId) ? spells[spellId] : undefined;
      if (!spell) continue;
      for (const version of VERSIONS) {
        const casted = count[version];
        const def = spell[version];
        if (!def || !(casted > 0)) continue;
        for (const phase of def.phases) {
          const instances = (casted * phase.duration) / SECONDS_PER_ATTACK;
          if (instances > 0) windows.push({ side, spellId, version, phaseId: phase.id, instances });
        }
      }
    }
  }
  return windows;
}

/**
 * Découpage en phases + ids d'effets de sort à injecter dans les `cardEffects` de chaque côté.
 * Sans fenêtre : une seule phase `[0, ∞)`.
 */
export function buildDuelPhases(
  windows: SpellWindow[],
  effects: Record<string, EffectDefinition> = EFFECTS_CATALOG,
  spells: Record<string, SpellDefinition> = SPELLS_CATALOG
): DuelPhase[] {
  const bounds = [...new Set(windows.map(w => w.instances))].sort((a, b) => a - b);
  const starts = [0, ...bounds];

  return starts.map((start, i) => {
    const active = windows.filter(w => w.instances > start);
    const left = new Set<string>();
    const right = new Set<string>();
    for (const w of active) {
      const phase = spells[w.spellId]?.[w.version]?.phases.find(p => p.id === w.phaseId);
      const opposite = w.side === 'left' ? right : left;
      const own = w.side === 'left' ? left : right;
      for (const id of phase?.effects ?? []) {
        const def = effects[id];
        if (!def) continue;
        (def.target === 'enemy' ? opposite : own).add(id);
      }
    }
    return {
      start,
      end: i + 1 < starts.length ? starts[i + 1] : Infinity,
      active,
      leftCardEffects: [...left],
      rightCardEffects: [...right],
    };
  });
}
