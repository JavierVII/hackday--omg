import type { Asset3D, ThemeConfig } from "@hackday/contracts";
import { seedAssets, seedThemes } from "../mocks/seed";
import { createLocalStorageRepository } from "./storage/localStorageRepository";

const PREFIX = "hackday-omg:admin:v1";

/** 本地存储仓库：无需后端即可演示的资产 / 主题数据源。 */
export const repositories = {
  assets: createLocalStorageRepository<Asset3D>(`${PREFIX}:assets`, seedAssets),
  themes: createLocalStorageRepository<ThemeConfig>(`${PREFIX}:themes`, seedThemes),
};
