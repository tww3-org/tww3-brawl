import { readFile } from "fs/promises";
import { join } from "path";
import type { DataStructure } from "../types/game";

let gameData: DataStructure | null = null;

export default defineNitroPlugin(async (nitro) => {
  try {
    const dataPath = join(process.cwd(), "server/data/data_v6.json");
    const rawData = await readFile(dataPath, "utf-8");
    gameData = JSON.parse(rawData);
    console.log("Game data loaded successfully");

    // Rendre les données disponibles pour les routes API
    nitro.hooks.hook("request", async (event) => {
      event.context.gameData = gameData;
    });
  } catch (error) {
    console.error("Error loading game data:", error);
  }
});
