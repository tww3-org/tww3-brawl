import type { Faction } from '../types';
import { IMG_BASE_URL, FACTION_SUFFIX } from './constants';

/**
 * Returns the full Cloudinary URL for a faction flag image, given a version and a Faction object.
 * @param version The version number as a string
 * @param faction Partial Faction object (must have flags_url)
 * @returns The full image URL as a string
 */
export function getFactionPortrait(version: string, faction: Partial<Faction> & { flags_url?: string }): string | undefined {
  if (!version || !faction?.flags_url) return undefined;
  return `${IMG_BASE_URL}/${version}/${faction.flags_url}/${FACTION_SUFFIX}`;
}
