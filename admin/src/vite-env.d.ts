/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONFIG_MODE?: "mock" | "api";
  readonly VITE_CONFIG_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
