import type { Faction } from '../types';

/**
 * Returns the full Cloudinary URL for a faction flag image, given a version and a Faction object.
 * @param version The version number as a string
 * @param faction Partial Faction object (must have flags_url)
 * @returns The full image URL as a string
 */
export function getFactionPortrait(version: string, faction: Partial<Faction> & { flags_url?: string }): string | undefined {
  if (!version || !faction?.flags_url) return undefined;
  return `https://res.cloudinary.com/fishofstone/image/upload/twwstats/api/${version}/${faction.flags_url}/mon_64.webp`;
}
