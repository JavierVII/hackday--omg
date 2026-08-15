interface VoxelMeta {
  gridBounds: { min: number[]; max: number[] };
  voxelResolution: number;
  treeDepth: number;
  nodeCount: number;
  leafDataCount: number;
}

function popcount8(v: number) {
  v = v - ((v >> 1) & 0x55);
  v = (v & 0x33) + ((v >> 2) & 0x33);
  return (v + (v >> 4)) & 0xf;
}

const SOLID_LEAF = 0xff000000;

// 稀疏体素八叉树（Laine–Karras 编码）运行时查询
// 体素坐标系 = 3DGS 原始局部系（z-up）；世界系为 y-up（splat rotation.x = -90°）
// world = (lx, lz, -ly)，local = (wx, -wz, wy)
export class VoxelGrid {
  private nodes: Uint32Array;
  private leafData: Uint32Array;
  private minX: number;
  private minY: number;
  private minZ: number;
  private res: number;
  private depth: number;
  private maxVoxelIndex: number;

  private constructor(meta: VoxelMeta, buffer: ArrayBuffer) {
    const words = new Uint32Array(buffer);
    this.nodes = words.subarray(0, meta.nodeCount);
    this.leafData = words.subarray(
      meta.nodeCount,
      meta.nodeCount + meta.leafDataCount
    );
    this.minX = meta.gridBounds.min[0];
    this.minY = meta.gridBounds.min[1];
    this.minZ = meta.gridBounds.min[2];
    this.res = meta.voxelResolution;
    this.depth = meta.treeDepth;
    this.maxVoxelIndex = (1 << meta.treeDepth) * 4;
  }

  static async load(baseUrl: string): Promise<VoxelGrid> {
    const meta = (await (
      await fetch(`${baseUrl}/voxel-meta.json`)
    ).json()) as VoxelMeta;
    const buffer = await (await fetch(`${baseUrl}/voxel.bin`)).arrayBuffer();
    return new VoxelGrid(meta, buffer);
  }

  occupiedLocal(lx: number, ly: number, lz: number): boolean {
    const ix = Math.floor((lx - this.minX) / this.res);
    const iy = Math.floor((ly - this.minY) / this.res);
    const iz = Math.floor((lz - this.minZ) / this.res);
    if (
      ix < 0 || iy < 0 || iz < 0 ||
      ix >= this.maxVoxelIndex || iy >= this.maxVoxelIndex || iz >= this.maxVoxelIndex
    ) {
      return false;
    }
    const bx = ix >> 2;
    const by = iy >> 2;
    const bz = iz >> 2;

    let nodeIndex = 0;
    for (let level = 0; level < this.depth; level++) {
      const node = this.nodes[nodeIndex];
      const childMask = node >>> 24;
      const firstChild = node & 0xffffff;
      const shift = this.depth - 1 - level;
      const octant =
        ((bx >>> shift) & 1) |
        (((by >>> shift) & 1) << 1) |
        (((bz >>> shift) & 1) << 2);
      if (!((childMask >>> octant) & 1)) return false;
      nodeIndex = firstChild + popcount8(childMask & ((1 << octant) - 1));
    }

    const leaf = this.nodes[nodeIndex];
    if (leaf === SOLID_LEAF) return true;
    const pairIndex = leaf & 0xffffff;
    const lo = this.leafData[pairIndex * 2];
    const hi = this.leafData[pairIndex * 2 + 1];
    const bit = (ix & 3) + (iy & 3) * 4 + (iz & 3) * 16;
    return bit < 32 ? ((lo >>> bit) & 1) === 1 : ((hi >>> (bit - 32)) & 1) === 1;
  }

  occupiedWorld(wx: number, wy: number, wz: number): boolean {
    return this.occupiedLocal(wx, -wz, wy);
  }

  groundHeight(
    wx: number,
    wz: number,
    fromY: number,
    maxDrop = 5
  ): number | null {
    // Sample at voxel centers and return the voxel's exact top face. Sampling
    // from the previous frame's character height at an arbitrary increment
    // can alternate between two values while standing still, which makes the
    // follow camera visibly jitter.
    const startIndex = Math.min(
      this.maxVoxelIndex - 1,
      Math.floor((fromY - this.minZ) / this.res)
    );
    const endIndex = Math.max(
      0,
      Math.floor((fromY - maxDrop - this.minZ) / this.res)
    );
    for (let index = startIndex; index >= endIndex; index--) {
      const centerY = this.minZ + (index + 0.5) * this.res;
      if (this.occupiedWorld(wx, centerY, wz)) {
        return this.minZ + (index + 1) * this.res;
      }
    }
    return null;
  }
}
