import { Version } from "../types";
import { IMG_BASE_URL } from "./constants";

export function getVersionPortrait(version: Version) {
  return `${IMG_BASE_URL}/${version.id}/ui/skins/default/fe_logo.webp`;
}