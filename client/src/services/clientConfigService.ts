const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8787";

export const clientConfigEndpoint = new URL(
  "/api/client/config",
  import.meta.env.VITE_BACKEND_BASE_URL ?? DEFAULT_BACKEND_BASE_URL,
).toString();

// Fetching and version polling will be implemented here once contracts are present.
