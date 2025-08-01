import { Unit } from '../types'

const base_attack = 40
const min_att_def_layer = 8
const max_att_def_layer = 90

export function calculateAttackRatio(attacker: Unit, defender: Unit): number {
    const attackerAttack = attacker.attack || 0
    const defenderDefense = defender.defense || 0
    const isLarge = defender.is_large || false
    
    const bonusDamage = isLarge 
        ? (attacker.damage?.bonus_v_large || 0)
        : (attacker.damage?.bonus_v_infantry || 0)
    
    return Math.max(min_att_def_layer, Math.min(
        attackerAttack - defenderDefense + base_attack + bonusDamage
        , max_att_def_layer)) / 100
}

export function calculateDamageOnHit(attacker: Unit, defender: Unit): number {
    const normalDamage = attacker.damage?.normal || 0
    const piercingDamage = attacker.damage?.piercing || 0
    const armor = defender.armor || 0
    
    return (normalDamage * (1 - Math.min(armor * 0.75 * 0.01, 1)) + piercingDamage)
}

export function calculateResistRatio(attacker: Unit, defender: Unit): number {
    const wardSave = defender.resistance?.ward_save || 0
    const physicalResist = defender.resistance?.physical || 0
    const fireResist = defender.resistance?.fire || 0
    
    const isMagical = attacker.damage?.is_magical || false
    const isFire = attacker.damage?.is_fire || false
    
    return (wardSave 
        + (isMagical ? 0: Math.max(physicalResist, 0)) // Physical resist
        + (isFire ? Math.min(Math.max(fireResist, -100), 100):  0) // Fire resist
    )/100
}

export function averageHealthLostPerEntity(attacker: Unit, defender: Unit) {
    const att_ratio = calculateAttackRatio(attacker, defender)
    const resist_ratio = calculateResistRatio(attacker, defender)
    let damage_value = att_ratio * (1 - resist_ratio) * calculateDamageOnHit(attacker, defender)
    return damage_value / (defender.health?.entity || 0) 
}

export function averageHealthLostPerUnit(attacker: Unit, defender: Unit) {
    const att_ratio = calculateAttackRatio(attacker, defender)
    const resist_ratio = calculateResistRatio(attacker, defender)
    let damage_value = att_ratio * (1 - resist_ratio) * calculateDamageOnHit(attacker, defender)
    return damage_value / (defender.health?.unit || 0) 
}