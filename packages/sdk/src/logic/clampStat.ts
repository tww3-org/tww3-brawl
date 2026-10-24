/**
 * Borne une stat à 0 minimum.
 *
 * Les couches d'effets ne bornent pas (une stat peut devenir négative entre deux couches, sans perte
 * d'information) : la borne est appliquée à la lecture, dans les calculs de combat et à l'affichage.
 */
export const clampNonNegative = (value: number): number => Math.max(0, value)
