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
 *   les PV d'une entité sont ceux de l'unité entière (bonus de PV et montures compris) divisés par son nombre
 *   d'entités (`health.unit / max(1, entités)`), et non `health.entity` (PV de base de l'entité de combat) ;
 * - les PV courants `h` de l'entité touchée sont supposés uniformément répartis sur [0, H] (H = PV d'une entité) :
 *   les dégâts délivrés par instance sont l'espérance `E[min(D, h)]` (voir `expectedDotInstance`), valable pour
 *   toutes les cibles, entité unique comprise ;
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
    /**
     * PV perdus par plafond de PV d'une entité (overkill), par lancer, avant résistance :
     * (moyenne par entité − espérance `E[min(D, h)]` avec `h` uniforme sur [0, H]) × entités portantes
     */
    lostOverkill: number
    /** PV perdus faute d'entités (E < N), par lancer, avant résistance */
    lostEntities: number
    /** Ratio de résistance appliqué (<= 0,95) */
    resist: number
    /** PV réellement perdus par lancer, après plafonds et résistance */
    perLaunch: number
    /** PV de l'unité défenseuse utilisés pour le calcul (`health.unit`, borné à >= 0) */
    targetHealth: number
}

/**
 * Dégâts délivrés par une instance de DoT sur une entité dont les PV courants `h` sont supposés uniformément
 * répartis sur [0, H] : espérance `E[min(D, h)]`, en forme fermée.
 * - H <= 0 : 0 ;
 * - D >= H : H / 2 ;
 * - sinon : D − D² / (2H).
 *
 * @param damage - Dégâts moyens D de l'instance sur le lancer (par entité)
 * @param entityHealth - PV maximaux H d'une entité
 */
export function expectedDotInstance(damage: number, entityHealth: number): number {
    if (entityHealth <= 0) return 0
    if (damage >= entityHealth) return entityHealth / 2
    return damage - (damage * damage) / (2 * entityHealth)
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
    const unitHealth = clampNonNegative(defender.health?.unit || 0)
    // PV moyens d'une entité de l'unité entière (bonus de PV et montures compris) ; entité unique : toute la vie
    const entityHealth = unitHealth / Math.max(1, getMaxEntities(defender))
    const instance = expectedDotInstance(meanPerEntity, entityHealth)

    // Attaque magique non enflammée : ward save + résistance magique, plafonnés à 95 % comme la mêlée
    const resist = calculateResistRatio(
        {
            ...defender,
            damage: { normal: 0, piercing: 0, is_magical: true, is_fire: false, bonus_v_large: 0, bonus_v_infantry: 0 },
        },
        defender
    )

    const perLaunch = instance * carried * (1 - resist)
    return {
        perHit: unitHealth > 0 && dot.duration > 0 ? (perLaunch * SECONDS_PER_ATTACK) / dot.duration / unitHealth : 0,
        gross: meanPerEntity * targeted,
        lostOverkill: (meanPerEntity - instance) * carried,
        lostEntities: meanPerEntity * (targeted - carried),
        resist,
        perLaunch,
        targetHealth: unitHealth,
    }
}
