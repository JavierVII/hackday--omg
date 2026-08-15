import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const adminBasePath = (env.VITE_ADMIN_BASE_PATH ?? "/admin").replace(/\/$/, "");
  return {
    base: `${adminBasePath}/`,
    plugins: [react(), tailwindcss()],
    server: {
      // 与 client（5173）分开：client 通过 /admin 代理到本端口，进入页「进入管理端」可直达。
      host: "0.0.0.0",
      port: 5174,
      strictPort: true,
      // 经 client 代理访问时页面源是 5173，显式声明 HMR 直连本端口，保证开发热更可用。
      hmr: { host: "127.0.0.1", port: 5174 },
    },
  };
});
