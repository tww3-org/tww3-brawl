import { Unit } from '../types'

// Constants for attack/defense calculations
const base_attack = 40
const min_att_def_layer = 8
const max_att_def_layer = 90

/**
 * Calculates the attack ratio between an attacker and defender unit.
 * This represents the probability of a successful hit based on attack vs defense stats.
 * 
 * @param attacker - The attacking unit
 * @param defender - The defending unit
 * @returns A ratio between 0.08 and 0.90 representing hit probability
 */
export function calculateAttackRatio(attacker: Unit, defender: Unit): number {
    const attackerAttack = attacker.attack || 0
    const defenderDefense = defender.defense || 0
    const isLarge = defender.is_large || false
    
    // Apply bonus damage based on target type (large vs infantry)
    const bonusDamage = isLarge 
        ? (attacker.damage?.bonus_v_large || 0)
        : (attacker.damage?.bonus_v_infantry || 0)
    
    // Calculate attack ratio with base attack and bonus damage, clamped between min/max values
    return Math.max(min_att_def_layer, Math.min(
        attackerAttack - defenderDefense + base_attack + bonusDamage
        , max_att_def_layer)) / 100
}

/**
 * Calculates the actual damage dealt on a successful hit.
 * Takes into account normal damage, piercing damage, and armor reduction.
 * 
 * @param attacker - The attacking unit
 * @param defender - The defending unit
 * @returns The total damage value after armor calculations
 */
export function calculateDamageOnHit(attacker: Unit, defender: Unit): number {
    const normalDamage = attacker.damage?.normal || 0
    const piercingDamage = attacker.damage?.piercing || 0
    const armor = defender.armor || 0
    
    // Normal damage is reduced by armor, piercing damage ignores armor
    return (normalDamage * (1 - Math.min(armor * 0.75 * 0.01, 1)) + piercingDamage)
}

/**
 * Calculates the resistance ratio that reduces incoming damage.
 * Considers ward save, physical resistance, and fire resistance based on damage type.
 * 
 * @param attacker - The attacking unit (determines damage type)
 * @param defender - The defending unit (provides resistance stats)
 * @returns A ratio between 0 and 1 representing damage reduction
 */
export function calculateResistRatio(attacker: Unit, defender: Unit): number {
    const wardSave = defender.resistance?.ward_save || 0
    const physicalResist = defender.resistance?.physical || 0
    const fireResist = defender.resistance?.fire || 0
    
    const isMagical = attacker.damage?.is_magical || false
    const isFire = attacker.damage?.is_fire || false
    
    // Ward save applies to all damage types
    // Physical resistance only applies to non-magical damage
    // Fire resistance only applies to fire damage
    return (wardSave 
        + (isMagical ? 0: Math.max(physicalResist, 0)) // Physical resist
        + (isFire ? Math.min(Math.max(fireResist, -100), 100):  0) // Fire resist
    )/100
}

/**
 * Calculates the average health lost per entity in the defending unit.
 * An entity represents a single model/figure within the unit.
 * 
 * @param attacker - The attacking unit
 * @param defender - The defending unit
 * @returns The average health lost per entity as a percentage
 */
export function averageHealthLostPerEntity(attacker: Unit, defender: Unit) {
    const att_ratio = calculateAttackRatio(attacker, defender)
    const resist_ratio = calculateResistRatio(attacker, defender)
    let damage_value = att_ratio * (1 - resist_ratio) * calculateDamageOnHit(attacker, defender)
    return damage_value / (defender.health?.entity || 0) 
}

/**
 * Calculates the average health lost per unit (total unit health).
 * This represents the overall damage to the entire unit.
 * 
 * @param attacker - The attacking unit
 * @param defender - The defending unit
 * @returns The average health lost per unit as a percentage
 */
export function averageHealthLostPerUnit(attacker: Unit, defender: Unit) {
    const att_ratio = calculateAttackRatio(attacker, defender)
    const resist_ratio = calculateResistRatio(attacker, defender)
    let damage_value = att_ratio * (1 - resist_ratio) * calculateDamageOnHit(attacker, defender)
    return damage_value / (defender.health?.unit || 0) 
}