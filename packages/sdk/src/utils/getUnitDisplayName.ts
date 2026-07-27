import type { Unit } from '../types';

/**
 * The broker.twwstats.com backend sometimes fails to resolve a unit's
 * localization key server-side and returns the raw, untranslated string
 * instead of a human-readable name, e.g.
 * `{{tr:and_units_onscreen_name_wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer}}`.
 * This is an upstream/third-party data quality issue (not something we can
 * fix at the source, see specs/001-fix-duplicate-unit-cards/spec.md
 * Assumptions) — we only detect and work around it on the frontend.
 */
export function isRawTranslationKey(name: string | undefined | null): boolean {
  if (!name) {
    return false;
  }
  const trimmed = name.trim();
  // Matches `{{tr:...}}` as observed in the wild, and the more generic
  // `{{...}}` shape in case the untranslated key ever surfaces without the
  // `tr:` prefix.
  return /^\{\{.*\}\}$/.test(trimmed);
}

/**
 * Derives a readable fallback name from a technical identifier (a unit's
 * `unit` id, or a mount's `mounted_unit` id), used when the backend has no
 * valid translated name to offer (see isRawTranslationKey above). No network
 * call, no translation lookup — just a slug-to-title transform.
 */
function humanizeUnitKey(unitKey: string): string {
  const words = unitKey
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Shared resolution logic behind both `getUnitDisplayName` and
 * `getMountDisplayName`: returns the backend-provided name when it is a
 * non-empty string that is NOT a raw, unresolved translation key, otherwise
 * falls back to a humanized transform of the technical identifier (see
 * humanizeUnitKey above). Kept internal — callers should go through the two
 * exported wrappers below so the right fallback id is always paired with the
 * right raw-name field.
 */
function resolveDisplayName(rawName: string | undefined | null, fallbackId: string): string {
  if (rawName && !isRawTranslationKey(rawName)) {
    return rawName;
  }
  return humanizeUnitKey(fallbackId);
}

/**
 * Resolves the display name for a unit: the backend's translated
 * `onscreen_name` when it is present and valid, otherwise a humanized
 * fallback derived from the unit's technical identifier. Use this
 * everywhere a unit name is shown to the user instead of reading
 * `land_unit.onscreen_name` directly, so a raw translation key is never
 * rendered (see specs/001-fix-duplicate-unit-cards/spec.md FR-003, FR-004).
 */
export function getUnitDisplayName(unit: Pick<Unit, 'unit' | 'land_unit'>): string {
  return resolveDisplayName(unit.land_unit?.onscreen_name, unit.unit);
}

/**
 * Resolves the display name for a mount option offered by a unit's
 * `battle_mounts` (e.g. in the mount picker dropdown): the backend's
 * `mount_name` when present and valid, otherwise a humanized fallback
 * derived from the mount's `mounted_unit` technical identifier. Same
 * raw-translation-key guard as `getUnitDisplayName`, applied to mount names
 * (see specs/001-fix-duplicate-unit-cards/spec.md FR-009).
 */
export function getMountDisplayName(mount: { mount_name?: string | null; mounted_unit: string }): string {
  return resolveDisplayName(mount.mount_name, mount.mounted_unit);
}

/**
 * Groups a flat list of same-category unit entries into one card per
 * logical unit "family", and returns exactly one representative entry per
 * family.
 *
 * Why grouping-by-`unit`-id is NOT correct here (see
 * specs/001-fix-duplicate-unit-cards/spec.md FR-007 and the 2026-07-27
 * Assumptions correction): a hero/lord with several selectable mounts gets a
 * DISTINCT `unit` technical id per mount variant (e.g.
 * `wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer_steed_of_slaanesh` vs.
 * `..._daemonic_steed`), even though all variants share the same base
 * character and, in the good-data case, the same resolved
 * `land_unit.onscreen_name`. The ORIGINAL (pre-regression) behavior grouped
 * by that resolved name, which correctly collapsed mount variants into one
 * card. Grouping by `unit`+`caste` breaks that, because the id differs per
 * mount.
 *
 * So the strategy here is a hybrid:
 * 1. Entries with a valid (non-raw) resolved name are grouped by that name —
 *    this restores the original, correct mount-variant collapsing.
 * 2. Entries whose name is still a raw, unresolved `{{tr:...}}` key are
 *    matched to an existing valid-name sibling's family by checking whether
 *    their `unit` id extends that sibling's `unit` id with a `_suffix`
 *    (Total War hero mount variants extend the base unit's technical id this
 *    way — confirmed in live data:
 *    `wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer_steed_of_slaanesh` extends
 *    `wh3_dlc27_sla_cha_styrkaar_the_sortsvinaer`). A matched raw entry joins
 *    that sibling's family and is discarded in favor of the valid-name entry
 *    by the existing cost-based tie-break below — it never becomes its own
 *    card.
 * 3. A raw entry with no such sibling anywhere in the list falls back to
 *    `getUnitDisplayName`'s humanized name as its own, isolated family (last
 *    resort — e.g. every variant in a family currently has a broken name).
 *
 * Once entries are grouped into families, each family is collapsed to a
 * single representative: prefer entries with a genuinely valid (non-raw)
 * name over raw ones, then break ties by lowest `recruitment_cost` (existing
 * behavior, kept to avoid regressing "same name, different HP" merges).
 */
export function dedupeUnitEntries<
  T extends Pick<Unit, 'unit' | 'land_unit' | 'recruitment_cost'>
>(units: T[]): T[] {
  // Every `unit` id that has at least one valid resolved name in this list,
  // mapped to that resolved name. Used both to build families and to match
  // raw entries to their base unit's family.
  const resolvedNameByUnitId = new Map<string, string>();
  for (const unit of units) {
    const name = unit.land_unit?.onscreen_name;
    if (name && !isRawTranslationKey(name)) {
      resolvedNameByUnitId.set(unit.unit, name);
    }
  }

  function familyKeyFor(unit: T): string {
    const name = unit.land_unit?.onscreen_name;
    if (name && !isRawTranslationKey(name)) {
      return name;
    }
    for (const [baseUnitId, resolvedName] of resolvedNameByUnitId) {
      if (unit.unit !== baseUnitId && unit.unit.startsWith(`${baseUnitId}_`)) {
        return resolvedName;
      }
    }
    return getUnitDisplayName(unit);
  }

  const byFamily = new Map<string, T[]>();
  for (const unit of units) {
    const key = familyKeyFor(unit);
    const list = byFamily.get(key);
    if (list) {
      list.push(unit);
    } else {
      byFamily.set(key, [unit]);
    }
  }

  const deduped: T[] = [];
  for (const entries of byFamily.values()) {
    const validEntries = entries.filter(u => !isRawTranslationKey(u.land_unit?.onscreen_name));
    const candidates = validEntries.length > 0 ? validEntries : entries;
    const chosen = [...candidates].sort(
      (a, b) => (a.recruitment_cost || 0) - (b.recruitment_cost || 0)
    )[0];
    deduped.push(chosen);
  }
  return deduped;
}
