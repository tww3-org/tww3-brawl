import type { DataStructure } from "../types/game";

export default defineEventHandler((event): DataStructure | null => {
  return event.context.gameData;
});
