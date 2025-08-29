import { IMG_BASE_URL } from "./constants";

export function getImageUrl(version: string, path: string) {
  return `${IMG_BASE_URL}/${version}/${path}`;
}
