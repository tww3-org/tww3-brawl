/**
 * Calcule le nouveau bonus après un clic sur un bouton de ModifierDisplay.
 * Le pas est exprimé en pourcentage de la valeur de base (au minimum `step`).
 * Logique partagée entre NumericInput (desktop) et ModifierDialog (mobile).
 */
export function applyModifierStep(bonus: number, step: number, baseValue: number): number {
    if (step > 0) {
        return bonus + Math.round(Math.max(step, step * baseValue / 100))
    }
    return bonus + Math.round(Math.min(step, step * baseValue / 100))
}
