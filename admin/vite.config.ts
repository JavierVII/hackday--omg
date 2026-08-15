import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const adminBasePath = (env.VITE_ADMIN_BASE_PATH ?? "/admin").replace(/\/$/, "");
  return { base: `${adminBasePath}/`, plugins: [react(), tailwindcss()], server: { host: "0.0.0.0", port: 5173 } };
});
