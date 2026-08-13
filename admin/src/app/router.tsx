import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { DetailShell } from "./DetailShell";
import { DashboardPage } from "../pages/DashboardPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { AssetsPage } from "../pages/assets/AssetsPage";
import { NewAssetPage } from "../pages/assets/NewAssetPage";
import { AssetBuildPage } from "../pages/assets/AssetBuildPage";
import { AssetReviewPage } from "../pages/assets/AssetReviewPage";
import { AssetDetailPage } from "../pages/assets/AssetDetailPage";

export const router = createBrowserRouter([
  {
    element: <AppShell/>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace/> },
      { path: "/dashboard", element: <DashboardPage/> },
      { path: "/assets", element: <AssetsPage/> },
      { path: "/themes", element: <PlaceholderPage title="节日装扮" description="主题配置与预览能力已预留。"/> },
      { path: "/operations", element: <PlaceholderPage title="运营管理" description="活动与互动游戏管理入口。"/> },
      { path: "/operations/activities", element: <PlaceholderPage title="活动管理" description="景区活动创建与发布能力将在后续阶段接入。"/> },
      { path: "/operations/games", element: <PlaceholderPage title="互动游戏" description="互动游戏配置与发布能力将在后续阶段接入。"/> },
      { path: "/operations/interactions", element: <PlaceholderPage title="互动点配置" description="互动点配置能力将在后续业务阶段接入。"/> },
      { path: "/operations/publish", element: <PlaceholderPage title="预览并发布" description="共享配置预览与发布页面将在后续业务阶段接入。"/> },
    ],
  },
  {
    element: <DetailShell/>,
    children: [
      { path: "/assets/new", element: <NewAssetPage/> },
      { path: "/assets/:id/build", element: <AssetBuildPage/> },
      { path: "/assets/:id/review", element: <AssetReviewPage/> },
      { path: "/assets/:id", element: <AssetDetailPage/> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace/> },
]);
