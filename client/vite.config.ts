import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// 开发期给静态资源加强缓存：浏览器把 /assets 下的 LOD 分块/模型/voxel/音频缓存到磁盘，
// 每次进 3D 场景不再向 dev server 重新校验 300+ 个请求，录屏演示重进场景时秒开。
// 只在 dev 生效；生产构建走 Vite 自带 hash 文件名 + immutable 缓存，不受影响。
// 若替换了资产文件，浏览器侧 Ctrl+Shift+R 强刷即可跳过缓存。
const devAssetStrongCache: Plugin = {
  name: "dev-asset-strong-cache",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && req.url.startsWith("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), devAssetStrongCache],
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
