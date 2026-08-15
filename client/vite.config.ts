import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    proxy: {
      // 管理端是独立 Vite 应用（admin/，端口 5174）。
      // 进入页「进入管理端」指向 /admin，经此代理直达管理端，演示时只需记 5173 一个地址。
      "/admin": {
        target: "http://127.0.0.1:5174",
        changeOrigin: true,
        // admin dev server 的 base 是 /admin/，无尾斜杠的 /admin 会 404。
        // 手动在地址栏输入 /admin 时也把它规整到 /admin/。
        rewrite: (path) => (path === "/admin" ? "/admin/" : path),
      },
    },
  },
  optimizeDeps: {
    // aholo-viewer 用 new URL("./splat-worker.js", import.meta.url) 加载三个 worker。
    // 一旦被预构建进 .vite/deps/，这些相对路径会指向不存在的位置（404），
    // splat 的解码/加载/排序全部静默失败，实景点云永远不显示。
    exclude: ["@manycore/aholo-viewer"],
  },
});
