import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AdminConfigState, ScenicExperienceConfig } from "@hackday/contracts";
import { createWestLakeSeed } from "../seed/westLakeSeed.js";

const dataFile = resolve(dirname(fileURLToPath(import.meta.url)), "../../data/config.json");
const clone = <T>(value: T): T => structuredClone(value);

function initialState(): AdminConfigState {
  const seed = createWestLakeSeed();
  return { draftConfig: clone(seed), publishedConfig: clone(seed), hasUnpublishedChanges: false, status: "saved" };
}

export class ConfigRepository {
  async read(): Promise<AdminConfigState> {
    try {
      const state = JSON.parse(await readFile(dataFile, "utf8")) as AdminConfigState;
      const seed = createWestLakeSeed();
      const fallback = seed.availableThemeIds;
      state.draftConfig.availableThemeIds ??= clone(fallback);
      state.publishedConfig.availableThemeIds ??= clone(fallback);
      for (const config of [state.draftConfig, state.publishedConfig]) {
        config.themes = config.themes.map((theme) => {
          const builtIn = seed.themes.find((item) => item.id === theme.id);
          return builtIn ? { ...theme, isBuiltIn: true, coverKey: theme.coverKey ?? builtIn.coverKey, environment: theme.environment ?? clone(builtIn.environment) } : theme;
        });
        for (const seededGame of seed.miniGames) {
          const index = config.miniGames.findIndex((game) => game.id === seededGame.id);
          if (index < 0) config.miniGames.push(clone(seededGame));
          else {
            const existing = config.miniGames[index];
            config.miniGames[index] = {
              ...seededGame,
              ...existing,
              // Upgrade the legacy demo label while preserving operator edits.
              name: existing.name === "猜灯谜" ? seededGame.name : existing.name,
              status: existing.status ?? seededGame.status,
              coverKey: existing.coverKey ?? seededGame.coverKey,
              riddle: existing.riddle ?? clone(seededGame.riddle),
            };
          }
        }
        for (const seededPoint of seed.interactionPoints) {
          const point = config.interactionPoints.find((item) => item.id === seededPoint.id);
          if (point) point.rewardId ??= seededPoint.rewardId;
        }
      }
      return state;
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const state = initialState(); await this.write(state); return state;
    }
  }

  async write(state: AdminConfigState): Promise<AdminConfigState> {
    await mkdir(dirname(dataFile), { recursive: true });
    const temporary = `${dataFile}.tmp`;
    await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    await rename(temporary, dataFile);
    return clone(state);
  }

  async updateDraft(mutator: (draft: ScenicExperienceConfig) => void): Promise<AdminConfigState> {
    const state = await this.read(); mutator(state.draftConfig);
    state.draftConfig.updatedAt = new Date().toISOString(); state.hasUnpublishedChanges = true; state.status = "unpublished_changes";
    return this.write(state);
  }
}
