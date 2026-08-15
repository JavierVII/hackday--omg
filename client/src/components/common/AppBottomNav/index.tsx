import { Link } from "react-router";

interface BottomNavProps {
  readonly activePath: "/home" | "/profile" | "/space";
}

interface GlyphProps {
  readonly active: boolean;
}

function RealmGlyph({ active }: GlyphProps) {
  return (
    <svg className="app-bottom-nav__glyph" viewBox="0 0 24 24" focusable="false">
      <path
        className="app-bottom-nav__glyph-wash"
        d="M12 4.15c.55 3.7 2.6 5.75 6.3 6.3-3.7.55-5.75 2.6-6.3 6.3-.55-3.7-2.6-5.75-6.3-6.3 3.7-.55 5.75-2.6 6.3-6.3Z"
        fill={active ? "currentColor" : "none"}
      />
      <path d="M12 4.15c.55 3.7 2.6 5.75 6.3 6.3-3.7.55-5.75 2.6-6.3 6.3-.55-3.7-2.6-5.75-6.3-6.3 3.7-.55 5.75-2.6 6.3-6.3Z" />
      <path d="M5.25 6.8A8.3 8.3 0 0 0 4.1 11M18.75 17.2A8.3 8.3 0 0 0 19.9 13" />
      <circle cx="5" cy="5.65" r=".85" fill="currentColor" stroke="none" />
      <circle cx="19" cy="18.35" r=".85" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LakeHomeGlyph({ active }: GlyphProps) {
  return (
    <svg className="app-bottom-nav__glyph" viewBox="0 0 24 24" focusable="false">
      <path
        className="app-bottom-nav__glyph-wash"
        d="m4.15 10.05 7.85-5.7 7.85 5.7v8.1H4.15Z"
        fill={active ? "currentColor" : "none"}
      />
      <path d="m3.45 10.25 8.55-6.1 8.55 6.1" />
      <path d="M5.4 9.25v8.9h13.2v-8.9" />
      <path d="M7.55 14.65c1.45-.95 2.9-.95 4.35 0s2.9.95 4.55-.05M7.8 18.15h8.4" />
    </svg>
  );
}

function TravelerGlyph({ active }: GlyphProps) {
  return (
    <svg className="app-bottom-nav__glyph" viewBox="0 0 24 24" focusable="false">
      <path
        className="app-bottom-nav__glyph-wash"
        d="M12 4.15a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6ZM5.15 19.5c.55-4.25 2.85-6.35 6.85-6.35s6.3 2.1 6.85 6.35Z"
        fill={active ? "currentColor" : "none"}
      />
      <circle cx="12" cy="7.45" r="3.3" />
      <path d="M5.15 19.5c.55-4.25 2.85-6.35 6.85-6.35s6.3 2.1 6.85 6.35" />
      <path d="M8.2 18.4c1.25-.7 2.5-.7 3.75 0s2.5.7 3.85 0" />
    </svg>
  );
}

const navigationItems = [
  { label: "个人空间", icon: RealmGlyph, to: "/space" },
  { label: "首页", icon: LakeHomeGlyph, to: "/home" },
  { label: "我的", icon: TravelerGlyph, to: "/profile" },
] as const;

export function AppBottomNav({ activePath }: BottomNavProps) {
  return (
    <nav className="app-bottom-nav" aria-label="游客端主导航">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.to === activePath;

        return (
          <Link
            className={isActive ? "app-bottom-nav__item is-active" : "app-bottom-nav__item"}
            key={item.to}
            to={item.to}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="app-bottom-nav__icon" aria-hidden="true">
              <Icon active={isActive} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
