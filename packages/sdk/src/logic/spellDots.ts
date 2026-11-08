import type { SpellDot, Unit } from '../types'
import { getMaxEntities } from '../utils/getMaxEntities'
import { calculateResistRatio, SECONDS_PER_ATTACK } from './oneSideCalculations'
import { clampNonNegative } from './clampStat'

/**
 * Dégâts sur la durée (DoT) des sorts (spec 004-spell-dots, sans simulation).
 *
 * Sémantique supposée des champs du jeu (non documentée, constitution II ; voir research R2 à R7) :
 * - `damage_amount` = dégâts par entité touchée et par tick ; `damage_chance` = probabilité par tick,
 *   vide = 1 ; les dégâts aléatoires sont ramenés à leur moyenne `damage_amount × damage_chance` ;
 * - `max_damaged_entities` (N) = nombre d'entités touchées ; le jeu est supposé frapper les mêmes N entités
 *   pendant tout le lancer, donc le plafond de PV s'applique par entité et par lancer (cumul de la phase) ;
 * - E = entités de départ de la cible (on ne suit pas les pertes en cours de combat) : `min(N, E)` instances
 *   portent ; N absent ou <= 0 = toutes les entités ;
 * - seules la résistance magique et le ward save réduisent un DoT, plafonnés à 95 % comme en mêlée
 *   (`calculateResistRatio` avec une attaque magique non enflammée) ; ni l'armure, ni la résistance
 *   physique, ni la résistance au feu ne s'appliquent ;
 * - les dégâts d'un lancer sont répartis uniformément sur les coups qu'il couvre (`durée / SECONDS_PER_ATTACK`) ;
 * - fréquence absente ou <= 0 = un tick par seconde (même convention que la régénération).
 * Les phases `positive` et les DoT visant des alliés sont écartés en amont (générateur du catalogue).
 */

/** Dégâts d'une phase de DoT subis par la cible à chaque coup couvert, et ventilation des pertes (par lancer) */
export interface DotDamage {
    /** Fraction de la vie de l'unité perdue par coup (même unité que les dégâts de mêlée) */
    perHit: number
    /** Dégâts bruts par lancer (PV), avant plafonds et résistance : moyenne par entité × N */
    gross: number
    /** PV perdus par plafond de PV d'une entité (overkill), par lancer, avant résistance */
    lostOverkill: number
    /** PV perdus faute d'entités (E < N), par lancer, avant résistance */
    lostEntities: number
    /** Ratio de résistance appliqué (<= 0,95) */
    resist: number
}

/**
 * Dégâts d'une phase de DoT subis par `defender` à chaque coup couvert.
 *
 * @param dot - DoT de la phase (la durée est celle de la phase)
 * @param defender - Unité effective de la phase (résistances après buffs et debuffs)
 * @param entityNumber - Effectif de départ du côté défenseur
 */
export function dotDamagePerHit(dot: SpellDot, defender: Unit, entityNumber: number): DotDamage {
    const entities = Math.max(0, Math.min(getMaxEntities(defender), entityNumber))
    const targeted = dot.max_entities > 0 ? dot.max_entities : entities
    const carried = Math.min(targeted, entities)

    const ticks = dot.duration / (dot.frequency > 0 ? dot.frequency : 1)
    const meanPerEntity = dot.damage_per_tick * dot.chance * ticks
    const instance = Math.min(meanPerEntity, clampNonNegative(defender.health?.entity || 0))

    // Attaque magique non enflammée : ward save + résistance magique, plafonnés à 95 % comme la mêlée
    const resist = calculateResistRatio(
        {
            ...defender,
            damage: { normal: 0, piercing: 0, is_magical: true, is_fire: false, bonus_v_large: 0, bonus_v_infantry: 0 },
        },
        defender
    )

    const perLaunch = instance * carried * (1 - resist)
    const unitHealth = clampNonNegative(defender.health?.unit || 0)
    return {
        perHit: unitHealth > 0 && dot.duration > 0 ? (perLaunch * SECONDS_PER_ATTACK) / dot.duration / unitHealth : 0,
        gross: meanPerEntity * targeted,
        lostOverkill: (meanPerEntity - instance) * carried,
        lostEntities: meanPerEntity * (targeted - carried),
        resist,
    }
}
