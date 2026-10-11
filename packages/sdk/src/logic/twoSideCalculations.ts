import type { Faction, Unit, Version } from '../types'
import { averageHealthLostPerUnitPerHit } from './oneSideCalculations'
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
 * @param leftUnit - The left unit with entity number in the comparison
 * @param rightUnit - The right unit with entity number in the comparison
 * @returns Object containing winner, number of hits needed, and remaining health
 */
export function calculateWinner(leftUnit: UnitWithEntityNumber, rightUnit: UnitWithEntityNumber): CombatResult {
    // Calculate damage each unit deals to the other

    const leftDamageToRight = averageHealthLostPerUnitPerHit(leftUnit.selection.unit!, rightUnit.selection.unit!) * (Math.min(getMaxEntities(leftUnit.selection.unit!), leftUnit.entityNumber))
    const rightDamageToLeft = averageHealthLostPerUnitPerHit(rightUnit.selection.unit!, leftUnit.selection.unit!) * (Math.min(getMaxEntities(rightUnit.selection.unit!), rightUnit.entityNumber))
    /**
     * Internal function to calculate combat statistics for a winner
     * @param winner - Which unit wins ('left' or 'right')
     * @param damageDealt - Damage the winner deals per hit
     * @param damageTaken - Damage the winner takes per hit
     * @returns Object with hits needed and remaining health
     */
    function calculateCombatStats(winner: 'left' | 'right', damageDealt: number, damageTaken: number) {
        const hitsNeeded = 1 / damageDealt
        const totalDamageTaken = hitsNeeded * damageTaken
        const remainingHealth = 1 - totalDamageTaken

        return {
            winner,
            hitsNeeded,
            remainingHealth
        }
    }
    
    // Determine winner and calculate statistics
    if (leftDamageToRight > rightDamageToLeft) {
        return calculateCombatStats('left', leftDamageToRight, rightDamageToLeft)
    } else if (rightDamageToLeft > leftDamageToRight) {
        return calculateCombatStats('right', rightDamageToLeft, leftDamageToRight)
    } else {
        // Tie - both units deal equal damage, default to left
        return calculateCombatStats('left', leftDamageToRight, rightDamageToLeft)
    }
}
