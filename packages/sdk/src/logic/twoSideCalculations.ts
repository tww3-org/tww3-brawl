import { Unit } from '../types'
import { averageHealthLostPerUnitPerHit } from './oneSideCalculations'

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

/**
 * Calculates the winner between two units and provides detailed combat statistics.
 * 
 * @param leftUnit - The left unit with entity number in the comparison
 * @param rightUnit - The right unit with entity number in the comparison
 * @returns Object containing winner, number of hits needed, and remaining health
 */
export function calculateWinner(leftUnit: UnitWithEntityNumber, rightUnit: UnitWithEntityNumber): CombatResult {
    // Calculate damage each unit deals to the other

    const leftUnitWithBonus = { ...leftUnit.selection.unit!, bonus: leftUnit.selection.bonus }
    const rightUnitWithBonus = { ...rightUnit.selection.unit!, bonus: rightUnit.selection.bonus }
    const leftDamageToRight = averageHealthLostPerUnitPerHit(leftUnit.selection.unit!, rightUnit.selection.unit!) * (leftUnit.entityNumber || 1)
    const rightDamageToLeft = averageHealthLostPerUnitPerHit(rightUnit.selection.unit!, leftUnit.selection.unit!) * (rightUnit.entityNumber || 1)
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
