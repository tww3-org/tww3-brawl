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

/**
 * Calculates the winner between two units and provides detailed combat statistics.
 *
 * Les dégâts bruts par coup (fraction de la vie de l'unité × entités) sont réduits de la régénération
 * du défenseur entre deux coups (`regenerationPerHit`, divisée par deux face à une attaque enflammée).
 * La vie à épuiser vaut 1 + les soins à durée limitée (`regenerationBurst`). Le gagnant est le côté
 * dont l'adversaire meurt en le moins de coups (égalité : gauche). Si aucun côté ne peut tuer l'autre,
 * le résultat est une impasse (`stalemate`).
 *
 * @param leftUnit - The left unit with entity number in the comparison
 * @param rightUnit - The right unit with entity number in the comparison
 * @returns Object containing winner, number of hits needed, remaining health, stalemate flag and regeneration per hit
 */
export function calculateWinner(leftUnit: UnitWithEntityNumber, rightUnit: UnitWithEntityNumber): CombatResult {
    const left = leftUnit.selection.unit!
    const right = rightUnit.selection.unit!

    // Dégâts bruts infligés par chaque côté à chaque coup
    const leftGross = averageHealthLostPerUnitPerHit(left, right) * (Math.min(getMaxEntities(left), leftUnit.entityNumber))
    const rightGross = averageHealthLostPerUnitPerHit(right, left) * (Math.min(getMaxEntities(right), rightUnit.entityNumber))

    // Régénération de chaque côté entre deux coups adverses
    const leftRegen = regenerationPerHit(right, left)
    const rightRegen = regenerationPerHit(left, right)

    // Dégâts nets : ce que subit réellement chaque côté par coup
    const leftNetTaken = Math.max(0, rightGross - leftRegen)
    const rightNetTaken = Math.max(0, leftGross - rightRegen)

    // Vie à épuiser pour tuer chaque côté
    const leftHealth = 1 + regenerationBurst(right, left)
    const rightHealth = 1 + regenerationBurst(left, right)

    const leftHitsToKill = rightNetTaken > 0 ? rightHealth / rightNetTaken : Infinity
    const rightHitsToKill = leftNetTaken > 0 ? leftHealth / leftNetTaken : Infinity

    const regen = { left: leftRegen, right: rightRegen }

    if (!isFinite(leftHitsToKill) && !isFinite(rightHitsToKill)) {
        return { winner: 'left', hitsNeeded: Infinity, remainingHealth: 1, stalemate: true, regenerationPerHit: regen }
    }

    // Égalité : gauche
    const winner: 'left' | 'right' = leftHitsToKill <= rightHitsToKill ? 'left' : 'right'
    const hitsNeeded = winner === 'left' ? leftHitsToKill : rightHitsToKill
    const winnerBurst = winner === 'left' ? leftHealth - 1 : rightHealth - 1
    const winnerNetTaken = winner === 'left' ? leftNetTaken : rightNetTaken

    return {
        winner,
        hitsNeeded,
        remainingHealth: Math.min(1, 1 + winnerBurst - hitsNeeded * winnerNetTaken),
        stalemate: false,
        regenerationPerHit: regen
    }
}
