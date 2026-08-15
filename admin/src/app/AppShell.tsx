import { Outlet } from "react-router-dom";
import { AdminChrome } from "./AdminChrome";
export function AppShell() { return <AdminChrome><Outlet/></AdminChrome>; }
