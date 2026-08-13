import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { ToastProvider } from "./store/ToastProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><ThemeProvider><ToastProvider><RouterProvider router={router}/></ToastProvider></ThemeProvider></StrictMode>);
