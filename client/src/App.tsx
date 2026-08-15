import { useLocation } from "react-router";

import { BackgroundMusic } from "./components/common/BackgroundMusic";
import { EntranceReturnButton } from "./components/common/EntranceReturnButton";
import { GateTransition } from "./components/overlays/GateTransition";
import { AppRouter } from "./router";

/** 需要实景漂移背景的页面：/home /space /profile /scenic/* /exhibition/* */
const DEMO_BG_ROUTES = /^\/(home|space|profile|scenic\/|exhibition\/)/;

export function App() {
  const location = useLocation();
  const showDemoBg = DEMO_BG_ROUTES.test(location.pathname);

  return (
    <>
      {/* 固定在根级、跨路由复用的背景层，避免切换页面时漂移动画复位。 */}
      <div className="demo-app-bg" data-hidden={!showDemoBg} aria-hidden="true" />
      <AppRouter />
      <EntranceReturnButton />
      <BackgroundMusic />
      {/* 过场层挂在路由之外，跨路由切换时动画不中断 */}
      <GateTransition />
    </>
  );
}
