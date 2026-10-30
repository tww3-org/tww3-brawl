import type { BrawlModifiers, EffectDefinition, EffectImmunity, StatModifier } from '@tww3-brawl/sdk/src/types'
import { getEffect } from '@tww3-brawl/sdk'

/**
 * Formatage des modificateurs d'un effet pour l'affichage (tooltip, liste du sélecteur).
 * Les multiplicateurs sont une couche additive : 1.1 => « +10% », 0.85 => « −15% ».
 */

const MINUS = '−'

const round1 = (n: number): number => Math.round(n * 10) / 10

/** Multiplicateur en pourcentage signé (1.1 => « +10% », 0.85 => « −15% ») */
export function formatMult(mult: number): string {
  const pct = round1((mult - 1) * 100)
  return `${pct < 0 ? MINUS : '+'}${Math.abs(pct)}%`
}

/** Valeur additive signée (5 => « +5 », -3 => « −3 ») */
export function formatAdd(add: number): string {
  const value = round1(add)
  return `${value < 0 ? MINUS : '+'}${Math.abs(value)}`
}

function formatStat(mod: StatModifier | undefined): string | null {
  if (!mod) return null
  const parts: string[] = []
  if (mod.mult !== undefined && mod.mult !== 1) parts.push(formatMult(mod.mult))
  if (mod.add !== undefined && mod.add !== 0) parts.push(formatAdd(mod.add))
  return parts.length > 0 ? parts.join(', ') : null
}

const IMMUNITY_LABELS: Record<EffectImmunity, string> = {
  enemy_contact_effects: 'Immune to enemy contact effects',
  attack_reduction: 'Immune to attack reduction',
  weapon_strength_reduction: 'Immune to weapon strength reduction',
}

/** Lignes lisibles décrivant les modificateurs d'un effet */
export function describeModifiers(mods: BrawlModifiers): string[] {
  const stats: [string, StatModifier | undefined][] = [
    ['Attack', mods.attack],
    ['Defense', mods.defense],
    ['Armor', mods.armor],
    ['Damage Normal', mods.damage?.normal],
    ['Damage Piercing', mods.damage?.piercing],
    ['Bonus V Large', mods.damage?.bonus_v_large],
    ['Bonus V Infantry', mods.damage?.bonus_v_infantry],
    ['Resistance Physical', mods.resistance?.physical],
    ['Resistance Magic', mods.resistance?.magic],
    ['Resistance Fire', mods.resistance?.fire],
    ['Resistance Ward Save', mods.resistance?.ward_save],
  ]
  const lines: string[] = []
  for (const [label, mod] of stats) {
    const formatted = formatStat(mod)
    if (formatted) lines.push(`${label}: ${formatted}`)
  }
  if (mods.damage?.is_magical === true) lines.push('Magical attacks')
  if (mods.damage?.is_magical === false) lines.push('Removes magical attacks')
  if (mods.damage?.is_fire === true) lines.push('Flaming attacks')
  if (mods.damage?.is_fire === false) lines.push('Removes flaming attacks')
  if (mods.regeneration) {
    const { per_second, duration } = mods.regeneration
    const pct = Math.round(per_second * 10000) / 100
    lines.push(`Regeneration: ${pct}%/s${duration ? ` for ${duration}s` : ''}`)
  }
  if (mods.contact_effect) {
    lines.push(`Contact effect: ${getEffect(mods.contact_effect)?.name ?? mods.contact_effect}`)
  }
  for (const immunity of mods.immunities ?? []) {
    lines.push(IMMUNITY_LABELS[immunity] ?? immunity)
  }
  return lines
}

/** Le malus de l'effet est infligé à l'adversaire (effet de contact ou imbu d'un effet de contact) */
export function isInflictedOnOpponent(effect: EffectDefinition): boolean {
  return effect.kind === 'contact' || !!effect.modifiers.contact_effect
}
