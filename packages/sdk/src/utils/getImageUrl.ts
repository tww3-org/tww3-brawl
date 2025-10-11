import { IMG_BASE_URL } from "./constants";

export function getImageUrl(version: string, path: string) {
  return `${IMG_BASE_URL}/${version}/${path.replace(/\.png/, '.webp')}`;
}

export function getSquareBorder(version: string) {
  return `${IMG_BASE_URL}/${version}/ui/skins/default/fe_frame_glow.webp`;
}

export function getSquareHover(version: string) {
  return `${IMG_BASE_URL}/${version}/ui/skins/default/build_city_chain_frame.webp`;
}
