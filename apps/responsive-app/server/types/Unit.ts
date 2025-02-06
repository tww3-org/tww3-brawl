export default interface Unit {
    health: {
        unit: number,
        entity: number
    }
    armor: number,
    attack: number,
    defense: number,
    attack_interval: number,
    damage: {
        normal: number,
        piercing: number,
        is_magical: boolean,
        is_fire: boolean,
        bonus_v_large: number,
        bonus_v_infantry: number
    },
    resistance: {
        physical: number
        magical: number
        fire: number
        ward_save: number
    },
    is_large: boolean
}