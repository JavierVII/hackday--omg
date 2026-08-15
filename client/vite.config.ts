import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
  },
  optimizeDeps: {
    // aholo-viewer 用 new URL("./splat-worker.js", import.meta.url) 加载三个 worker。
    // 一旦被预构建进 .vite/deps/，这些相对路径会指向不存在的位置（404），
    // splat 的解码/加载/排序全部静默失败，实景点云永远不显示。
    exclude: ["@manycore/aholo-viewer"],
  },
});
