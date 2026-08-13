import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";

export const router = createBrowserRouter([
  {
    element: <AppShell/>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace/> },
      { path: "/dashboard", element: <DashboardPage/> },
      { path: "/assets", element: <PlaceholderPage title="3D资产" description="资产创建与 AI 重建流程将在下一阶段接入。"/> },
      { path: "/themes", element: <PlaceholderPage title="节日装扮" description="主题配置与预览能力已预留。"/> },
      { path: "/operations", element: <PlaceholderPage title="运营管理" description="活动与互动游戏管理入口。"/> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace/> },
]);
