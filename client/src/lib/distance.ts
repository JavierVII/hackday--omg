import type { Vector3Value } from "../services/types";

export function distanceBetween(a: Vector3Value, b: Vector3Value): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
