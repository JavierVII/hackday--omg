import { Outlet } from "react-router-dom";

export function DetailShell() {
  return <div className="app-frame">
    <div className="app-shell detail-shell">
      <Outlet/>
    </div>
  </div>;
}
