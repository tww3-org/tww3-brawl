/**
 * Arrondit une valeur pour l'affichage : 2 décimales max, sans zéros finaux
 * (7.6000000000000005 -> 7.6). N'altère pas la valeur stockée.
 */
export function roundForDisplay(value: number): number {
    return Math.round(value * 100) / 100
}
