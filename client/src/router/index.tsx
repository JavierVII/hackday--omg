import { Navigate, Route, Routes } from "react-router";

import { ExplorePage } from "../pages/ExplorePage";
import { GuidePage } from "../pages/GuidePage";
import { HomePage } from "../pages/HomePage";
import { SceneLoadingPage } from "../pages/SceneLoadingPage";
import { ScenicDetailPage } from "../pages/ScenicDetailPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/scenic/:scenicAreaId" element={<ScenicDetailPage />} />
      <Route path="/scene/:sceneId/loading" element={<SceneLoadingPage />} />
      <Route path="/scene/:sceneId/explore" element={<ExplorePage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
