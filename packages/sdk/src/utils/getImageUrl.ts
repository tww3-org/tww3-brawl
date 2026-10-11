import { IMG_BASE_URL } from "./constants";

/**
 * Normalise un chemin d'image : les assets Cloudinary sont stockés en minuscules
 * et en `.webp`, alors que les données du jeu peuvent contenir des majuscules et du `.png`.
 */
export function normalizeImagePath(path: string) {
  return path.toLowerCase().replace(/\.png$/, '.webp');
}

export function getImageUrl(version: string, path: string) {
  return `${IMG_BASE_URL}/${version}/${normalizeImagePath(path)}`;
}

/**
 * Retourne l'URL de l'icône d'une monture. Les données peuvent être sales :
 * - `icon_name` est un chemin (contient "/") : utilisé tel quel ;
 * - `icon_name` est un nom lisible (ex. "Barded Warhorse") : converti en snake_case ;
 * - `icon_name` vaut "placeholder", une clé d'unité ou est vide : le suffixe est déduit
 *   de `mounted_unit` en retirant le préfixe `${base_unit}_` (ex. "hellsteed").
 */
export function getMountIcon(
  version: string,
  mount: { base_unit: string; mounted_unit: string; icon_name: string }
) {
  const iconName = mount.icon_name ?? '';
  if (iconName.includes('/')) {
    return getImageUrl(version, iconName);
  }
  const mountsDir = 'ui/campaign ui/mounts';
  if (iconName.includes(' ')) {
    const snake = iconName.trim().toLowerCase().replace(/\s+/g, '_');
    return getImageUrl(version, `${mountsDir}/mount_${snake}.webp`);
  }
  const prefix = `${mount.base_unit}_`;
  const suffix = mount.mounted_unit?.startsWith(prefix)
    ? mount.mounted_unit.slice(prefix.length)
    : '';
  if (suffix) {
    return getImageUrl(version, `${mountsDir}/mount_${suffix}.webp`);
  }
  return getImageUrl(version, iconName);
}

export function getSquareBorder(version: string) {
  return `${IMG_BASE_URL}/${version}/ui/skins/default/fe_frame_glow.webp`;
}

export function getSquareHover(version: string) {
  return `${IMG_BASE_URL}/${version}/ui/skins/default/build_city_chain_frame.webp`;
}
