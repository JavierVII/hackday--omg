import type { Vec3 } from "../../mocks/contracts";
import { WEST_LAKE_IDS } from "../../mocks/contracts";

export interface RouteCfg {
  points: Vec3[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  camYaw: number;
}

// AR 导航推荐路线 + 可行走边界 + 初始相机朝向（角色由 WASD 操控，路线只做地面导引）
export const ROUTES: Record<string, RouteCfg> = {
  [WEST_LAKE_IDS.scenes.reserved]: {
    points: [
      { x: 0.25, y: 0, z: -0.33 },
      { x: 1, y: 0, z: -0.5 },
      { x: 2.4, y: 0, z: -0.7 },
      { x: 4.75, y: 0, z: -0.8 },
      { x: 5.66, y: 0, z: -1.2 },
      { x: 5.7, y: 0, z: 0 },
      { x: 5.5, y: 0, z: 2.5 },
      { x: 5.25, y: 0, z: 5 },
      { x: 5.25, y: 0, z: 7.75 },
      { x: 4.75, y: 0, z: 8.25 },
      { x: 4.75, y: 0, z: 9 },
      { x: 4.25, y: 0, z: 9.5 },
      { x: 4, y: 0, z: 10 },
      { x: 4, y: 0, z: 10.25 },
      { x: 3.75, y: 0, z: 10.5 },
      { x: 3.75, y: 0, z: 11.25 },
      { x: 3.5, y: 0, z: 11.5 },
      { x: 3.5, y: 0, z: 14 },
      { x: 3.25, y: 0, z: 14.25 },
      { x: 3.25, y: 0, z: 14.75 },
      { x: 2.75, y: 0, z: 15.25 },
      { x: 2.78, y: 0, z: 15.63 },
    ],
    bounds: { minX: -28, maxX: 23, minZ: -13, maxZ: 68 },
    camYaw: -1.405,
  },
};
