import { Outlet } from "react-router-dom";
import { AdminChrome } from "./AdminChrome";
export function DetailShell() { return <AdminChrome><div className="desktop-detail"><Outlet/></div></AdminChrome>; }
