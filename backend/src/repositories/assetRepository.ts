import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Asset3D } from "@hackday/contracts";

const file = resolve(dirname(fileURLToPath(import.meta.url)), "../../data/assets.json");
const clone = <T>(value: T): T => structuredClone(value);

export class AssetRepository {
  async list(): Promise<Asset3D[]> {
    try { return clone(JSON.parse(await readFile(file, "utf8")) as Asset3D[]); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  }
  async get(id: string) { return (await this.list()).find((asset) => asset.id === id); }
  async save(asset: Asset3D) {
    const all = await this.list(); const index = all.findIndex((item) => item.id === asset.id);
    index < 0 ? all.push(asset) : all.splice(index, 1, asset);
    await mkdir(dirname(file), { recursive: true }); const temp = `${file}.tmp`;
    await writeFile(temp, `${JSON.stringify(all, null, 2)}\n`, "utf8"); await rename(temp, file); return clone(asset);
  }
}
