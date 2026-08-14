import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

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
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserProgressProvider>
    </ConfigProvider>
  </StrictMode>,
);
