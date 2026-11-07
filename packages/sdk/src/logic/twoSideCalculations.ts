import type { Faction, Unit, Version } from '../types'
import { averageHealthLostPerUnitPerHit, regenerationBurst, regenerationPerHit } from './oneSideCalculations'
import { getMaxEntities } from '../utils/getMaxEntities'

/**
 * Type for unit with entity number information
 */
export interface UnitWithEntityNumber {
  selection: {
    unit?: Unit;
    version?: Version;
    faction?: Faction;
  };
  entityNumber: number;
}

/**
 * Result of a combat calculation between two units
 */
export interface CombatResult {
    winner: 'left' | 'right'
    hitsNeeded: number
    remainingHealth: number
    /** Aucune des deux unités ne peut tuer l'autre (la régénération compense les dégâts des deux côtés) */
    stalemate: boolean
    /** Fraction de vie max régénérée par chaque côté entre deux attaques adverses (après le facteur feu) */
    regenerationPerHit: { left: number; right: number }
    /** Détail par phase du duel (bornes en coups et dégâts nets subis par coup de chaque côté) */
    phases?: PhaseBreakdown[]
}

/**
 * Détail d'une phase d'un duel : `[start, end)` en coups (`end` = Infinity pour la dernière),
 * dégâts nets subis par coup de chaque côté dans cette phase (régénération déduite)
 */
export interface PhaseBreakdown {
  start: number
  end: number
  leftNetTaken: number
  rightNetTaken: number
}

/**
 * Une phase du duel : les unités effectives (sorts de la phase compris) et sa durée en coups
 * (`Infinity` pour la dernière phase)
 */
export interface DuelPhaseUnits {
  hits: number
  left: UnitWithEntityNumber
  right: UnitWithEntityNumber
}

/**
 * Gold damage inflicted by each unit of a duel
 */
export interface GoldDamage {
  winner: number
  loser: number
}

/**
 * Calculates the gold damage inflicted by a winning unit and a losing unit.
 *
 * Only the multiplayer cost is used:
 * - winnerGoldDamageInflicted = loserMultiplayerCost (the winner kills the loser: 100% of its HP)
 * - loserGoldDamageInflicted = (1 - winRatio) * winnerMultiplayerCost
 *
 * @param winnerUnit - Unit that wins the duel
 * @param loserUnit - Unit that loses the duel
 * @param winRatio - Winner's remaining health, between 0 and 1 (clamped)
 * @returns Gold damage inflicted by each side, or null if a multiplayer cost is missing
 */
export function calculateGoldDamage(
  winnerUnit: UnitWithEntityNumber,
  loserUnit: UnitWithEntityNumber,
  winRatio: number
): GoldDamage | null {
  const winner = winnerUnit.selection.unit
  const loser = loserUnit.selection.unit

  if (!winner || !loser) {
    return null
  }

  const winnerGoldValue = winner.multiplayer_cost
  const loserGoldValue = loser.multiplayer_cost

  if (
    typeof winnerGoldValue !== 'number' ||
    typeof loserGoldValue !== 'number'
  ) {
    return null
  }

  // Ensure winRatio stays within [0, 1]
  const clampedWinRatio = Math.min(1, Math.max(0, winRatio))

  return {
    winner: loserGoldValue,
    loser: (1 - clampedWinRatio) * winnerGoldValue
  }
}

/** Dégâts nets par coup et soins à durée limitée d'une phase, pour chaque côté */
function phaseFigures(leftUnit: UnitWithEntityNumber, rightUnit: UnitWithEntityNumber) {
    const left = leftUnit.selection.unit!
    const right = rightUnit.selection.unit!

    // Dégâts bruts infligés par chaque côté à chaque coup
    const leftGross = averageHealthLostPerUnitPerHit(left, right) * (Math.min(getMaxEntities(left), leftUnit.entityNumber))
    const rightGross = averageHealthLostPerUnitPerHit(right, left) * (Math.min(getMaxEntities(right), rightUnit.entityNumber))

    // Régénération de chaque côté entre deux coups adverses
    const leftRegen = regenerationPerHit(right, left)
    const rightRegen = regenerationPerHit(left, right)

    return {
        // Dégâts nets : ce que subit réellement chaque côté par coup
        leftNetTaken: Math.max(0, rightGross - leftRegen),
        rightNetTaken: Math.max(0, leftGross - rightRegen),
        leftRegen,
        rightRegen,
        // Vie à épuiser pour tuer chaque côté
        leftHealth: 1 + regenerationBurst(right, left),
        rightHealth: 1 + regenerationBurst(left, right),
    }
}

/**
 * Nombre de coups pour épuiser `health` quand chaque phase i inflige `damages[i]` par coup pendant
 * `lengths[i]` coups (parcours de la spec 003, règle 5). Infinity si la vie n'est jamais épuisée.
 */
function hitsToKill(health: number, damages: number[], lengths: number[]): number {
    let hits = 0
    let remaining = health
    for (let i = 0; i < damages.length; i++) {
        const damage = damages[i]
        const length = lengths[i]
        if (damage > 0 && damage * length >= remaining) return hits + remaining / damage
        // Sans dégât, rien ne change ; une phase infinie sans dégât ne tue jamais
        if (damage > 0) remaining -= damage * length
        if (!isFinite(length)) return Infinity
        hits += length
    }
    return Infinity
}

/** Dégâts subis par un côté pendant `hits` coups, à travers les phases */
function damageTakenOver(hits: number, damages: number[], lengths: number[]): number {
    let taken = 0
    let start = 0
    for (let i = 0; i < damages.length && start < hits; i++) {
        taken += damages[i] * Math.min(lengths[i], hits - start)
        start += lengths[i]
    }
    return taken
}

/**
 * Calcule le vainqueur d'un duel découpé en phases (sorts, spec 003). Dans chaque phase, les dégâts bruts
 * et la régénération sont ceux de `calculateWinner`, sur les unités effectives de la phase. Pour chaque côté,
 * on parcourt les phases en retirant `dégâts nets × coups de la phase` à la vie de l'adversaire jusqu'à ce
 * qu'elle soit épuisée. Le soin limité (`burst`) vient des unités de la dernière phase (il ne dépend que des
 * effets on/off). Le côté qui a besoin de moins de coups gagne (égalité : gauche) ; si aucun côté ne meurt,
 * le résultat est une impasse.
 *
 * @param phases - Phases contiguës, de la première à la dernière (`hits` = Infinity)
 */
export function calculatePhasedWinner(phases: DuelPhaseUnits[]): CombatResult {
    const figures = phases.map(p => phaseFigures(p.left, p.right))
    const lengths = phases.map(p => p.hits)
    const leftNets = figures.map(f => f.leftNetTaken)
    const rightNets = figures.map(f => f.rightNetTaken)
    const last = figures[figures.length - 1]

    let start = 0
    const breakdown: PhaseBreakdown[] = phases.map((p, i) => {
        const phase = { start, end: start + p.hits, leftNetTaken: leftNets[i], rightNetTaken: rightNets[i] }
        start = phase.end
        return phase
    })

    const leftHitsToKill = hitsToKill(last.rightHealth, rightNets, lengths)
    const rightHitsToKill = hitsToKill(last.leftHealth, leftNets, lengths)

    const regen = { left: last.leftRegen, right: last.rightRegen }

    if (!isFinite(leftHitsToKill) && !isFinite(rightHitsToKill)) {
        return { winner: 'left', hitsNeeded: Infinity, remainingHealth: 1, stalemate: true, regenerationPerHit: regen, phases: breakdown }
    }

    // Égalité : gauche
    const winner: 'left' | 'right' = leftHitsToKill <= rightHitsToKill ? 'left' : 'right'
    const hitsNeeded = winner === 'left' ? leftHitsToKill : rightHitsToKill
    const winnerBurst = winner === 'left' ? last.leftHealth - 1 : last.rightHealth - 1
    const winnerNets = winner === 'left' ? leftNets : rightNets

    return {
        winner,
        hitsNeeded,
        remainingHealth: Math.min(1, 1 + winnerBurst - damageTakenOver(hitsNeeded, winnerNets, lengths)),
        stalemate: false,
        regenerationPerHit: regen,
        phases: breakdown
    }
}

/**
 * Calculates the winner between two units and provides detailed combat statistics.
 *
 * Les dégâts bruts par coup (fraction de la vie de l'unité × entités) sont réduits de la régénération
 * du défenseur entre deux coups (`regenerationPerHit`, divisée par deux face à une attaque enflammée).
 * La vie à épuiser vaut 1 + les soins à durée limitée (`regenerationBurst`). Le gagnant est le côté
 * dont l'adversaire meurt en le moins de coups (égalité : gauche). Si aucun côté ne peut tuer l'autre,
 * le résultat est une impasse (`stalemate`). C'est le cas « une seule phase infinie » de
 * `calculatePhasedWinner`.
 *
 * @param leftUnit - The left unit with entity number in the comparison
 * @param rightUnit - The right unit with entity number in the comparison
 * @returns Object containing winner, number of hits needed, remaining health, stalemate flag and regeneration per hit
 */
export function calculateWinner(leftUnit: UnitWithEntityNumber, rightUnit: UnitWithEntityNumber): CombatResult {
    return calculatePhasedWinner([{ hits: Infinity, left: leftUnit, right: rightUnit }])
}
