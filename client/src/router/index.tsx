import { Navigate, Route, Routes } from "react-router";

import { EntrancePage } from "../pages/EntrancePage";
import { ExplorePage } from "../pages/ExplorePage";
import { GuidePage } from "../pages/GuidePage";
import { HomePage } from "../pages/HomePage";
import { PersonalSpacePage } from "../pages/PersonalSpacePage";
import { ProfilePage } from "../pages/ProfilePage";
import { SceneLoadingPage } from "../pages/SceneLoadingPage";
import { ScenicDetailPage } from "../pages/ScenicDetailPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<EntrancePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/space" element={<PersonalSpacePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/scenic/:scenicAreaId" element={<ScenicDetailPage />} />
      <Route path="/scene/:sceneId/loading" element={<SceneLoadingPage />} />
      <Route path="/scene/:sceneId/explore" element={<ExplorePage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
