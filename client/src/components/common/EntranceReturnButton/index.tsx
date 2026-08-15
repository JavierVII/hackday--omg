import { ArrowLeft, House } from "lucide-react";
import { Link, useLocation } from "react-router";

import "./styles.css";

export function EntranceReturnButton() {
  const { pathname } = useLocation();

  if (pathname === "/") return null;

  return (
    <Link
      className="entrance-return"
      to="/"
      aria-label="返回进入页"
      title="返回进入页"
    >
      <ArrowLeft className="entrance-return__arrow" size={15} strokeWidth={2} aria-hidden="true" />
      <House size={17} strokeWidth={1.8} aria-hidden="true" />
      <span>返回入口</span>
    </Link>
  );
}
