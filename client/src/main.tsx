import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import { App } from "./App";
import { ConfigProvider } from "./app/providers/ConfigProvider";
import { UserProgressProvider } from "./app/providers/UserProgressProvider";
import "./styles/tokens.css";
import "./styles/global.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root was not found");
}

createRoot(root).render(
  <StrictMode>
    <ConfigProvider>
      <UserProgressProvider>
        {/* GitHub Pages 无服务端重写，用 hash 路由保证任意深链都能加载 index.html */}
        <HashRouter>
          <App />
        </HashRouter>
      </UserProgressProvider>
    </ConfigProvider>
  </StrictMode>,
);
