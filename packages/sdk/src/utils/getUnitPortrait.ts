import type { Unit } from '../types';
import { IMG_BASE_URL } from './constants';

/**
 * Returns the full Cloudinary URL for a unit flag image, given a version and a Unit object.
 * @param version The version number as a string
 * @param unit Partial Unit object
 * @returns The full image URL as a string
 */
export function getUnitPortrait(
  version: string,
  unit: Partial<Unit> & { flags_url?: string }
): string | undefined {
  let img_path = `${IMG_BASE_URL}/${version}`;
  if (unit.general_portrait && unit.general_portrait.length > 0) {
    // Replace "portholes" with "units", then ".png" with ".webp", then concatenate to img_path
    const portraitPath = unit.general_portrait
      .replace('portholes', 'units')
      .replace('.png', '.webp');
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

export function getUnitIcon(
  version: string,
  unit: Partial<Unit> & { icon: string }
): string | undefined {
  let img_path = `${IMG_BASE_URL}/${version}`;
  img_path += `/ui/common ui/unit_category_icons/${unit.icon}.webp`;
  return img_path;
}

export function getUnitSemicircle(
  version: string,
  unit: Partial<Unit> & { caste: string; special_categories?: string[] }
): string | undefined {
  let img_path = `${IMG_BASE_URL}/${version}/ui/skins/default/unit_card_semicircle`;
  if (unit.special_categories) {
    if (['Lord', 'Hero'].includes(unit.caste)) {
      img_path += `_hero`;
    } else if (unit.special_categories.includes('blessed_spawnings')) {
      img_path += `_spawning`;
    } else if (unit.special_categories.includes('elector_counts')) {
      img_path += `_elector`;
    } else if (unit.special_categories.includes('renown')) {
      img_path += `_renown`;
    }
  }
  img_path += `.webp`;
  return img_path;
}

export function getUnitBorder(
  version: string,
): string | undefined {
  return `${IMG_BASE_URL}/${version}/ui/skins/default/unit_card_frame_plain.webp`;
}

export function getUnitHover(version: string) {
  return `${IMG_BASE_URL}/${version}/ui/skins/default/unit_card_hover.webp`;
}
