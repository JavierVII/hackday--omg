/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONFIG_MODE?: "mock" | "api";
  readonly VITE_CONFIG_API_URL?: string;
  readonly VITE_ADMIN_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
