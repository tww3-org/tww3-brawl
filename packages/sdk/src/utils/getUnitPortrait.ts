import type { Unit } from '../types';
import { IMG_BASE_URL } from './constants';

/**
 * Returns the full Cloudinary URL for a unit flag image, given a version and a Unit object.
 * @param version The version number as a string
 * @param unit Partial Unit object 
 * @returns The full image URL as a string
 */
export function getUnitPortrait(version: string, unit: Partial<Unit> & { flags_url?: string }): string | undefined {
  let img_path = `${IMG_BASE_URL}/${version}`;
  if (unit.general_portrait && unit.general_portrait.length > 0) {
    // Replace "portholes" with "units", then ".png" with ".webp", then concatenate to img_path
    const portraitPath = unit.general_portrait.replace('portholes', 'units').replace('.png', '.webp');
    img_path += `/${portraitPath}`;
  } else {
    // Concatenate to img_path the string "/ui/units/icons/", then unit.unit, then the extension ".webp"
    if (unit.unit_card_url) {
      img_path += `/ui/units/icons/${unit.unit_card_url}.webp`;
    } else if (unit.unit) {
      img_path += `/ui/units/icons/${unit.unit}.webp`;
    }
  }
  return img_path;
}
