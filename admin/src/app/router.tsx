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
import { ThemesPage } from "../pages/themes/ThemesPage";
import { InteractionsPage } from "../pages/operations/InteractionsPage";
import { GamesPage } from "../pages/operations/GamesPage";
import { PublishPage } from "../pages/PublishPage";

export const router = createBrowserRouter([
  {
    element: <AppShell/>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace/> },
      { path: "/dashboard", element: <DashboardPage/> },
      { path: "/assets", element: <AssetsPage/> },
      { path: "/themes", element: <ThemesPage/> },
      { path: "/operations", element: <InteractionsPage/> },
      { path: "/operations/activities", element: <PlaceholderPage title="活动管理" description="景区活动创建与发布能力将在后续阶段接入。"/> },
      { path: "/operations/games", element: <GamesPage/> },
      { path: "/operations/interactions", element: <InteractionsPage/> },
      { path: "/operations/publish", element: <PublishPage/> },
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
