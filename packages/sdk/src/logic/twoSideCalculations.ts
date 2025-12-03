import { Unit } from '../types'
import { averageHealthLostPerUnitPerHit } from './oneSideCalculations'
import { getMaxEntities } from '../utils/getMaxEntities'

/**
 * Type for unit with entity number information
 */
export interface UnitWithEntityNumber {
  selection: {
    unit?: Unit;
    version?: any;
    faction?: any;
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

const GOLD_COST_KEYS = ['upkeep_cost', 'recruitment_cost', 'multiplayer_cost'] as const
type GoldCostKey = (typeof GOLD_COST_KEYS)[number]

/**
 * Calculates gold efficiency between a winning unit and a losing unit.
 *
 * For each gold indicator (upkeep, recruitment and multiplayer cost), we compute:
 * - winnerGoldDamageInflicted = loserGoldValue
 * - loserGoldDamageInflicted = (1 - winRatio) * winnerGoldValue
 * - ratioForStat = winnerGoldDamageInflicted / loserGoldDamageInflicted
 *
 * The final efficiency is the average of ratioForStat over all available indicators.
 *
 * @param winnerUnit - Unit that wins the duel
 * @param loserUnit - Unit that loses the duel
 * @param winRatio - Ratio between 0 and 1 representing how decisively the winner wins
 * @returns Average gold efficiency ratio across the three gold indicators
 */
export function calculateGoldEfficiency(
  winnerUnit: UnitWithEntityNumber,
  loserUnit: UnitWithEntityNumber,
  winRatio: number
): number {
  const winner = winnerUnit.selection.unit
  const loser = loserUnit.selection.unit

  if (!winner || !loser) {
    return 0
  }

  // Ensure winRatio stays within [0, 1]
  const clampedWinRatio = Math.min(1, Math.max(0, winRatio))

  const ratios: number[] = []

  for (const key of GOLD_COST_KEYS) {
    const winnerGoldValue = winner[key]
    const loserGoldValue = loser[key]

    if (
      typeof winnerGoldValue === 'number' &&
      typeof loserGoldValue === 'number'
    ) {
      const winnerGoldDamageInflicted = loserGoldValue
      const loserGoldDamageInflicted = (1 - clampedWinRatio) * winnerGoldValue

      // Ratio = winner_gold_damage_inflicted / loser_gold_damage_inflicted
      // Skip if loserGoldDamageInflicted is 0 to avoid division by zero
      if (loserGoldDamageInflicted > 0) {
        const ratioForStat = winnerGoldDamageInflicted / loserGoldDamageInflicted
        ratios.push(ratioForStat)
      }
    }
  }

  if (ratios.length === 0) {
    return 0
  }

  const sum = ratios.reduce((acc, value) => acc + value, 0)
  return sum / ratios.length
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
