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
    try { return JSON.parse(await readFile(dataFile, "utf8")) as AdminConfigState; }
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
