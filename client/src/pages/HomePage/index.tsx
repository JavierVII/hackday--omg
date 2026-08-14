import {
  ArrowRight,
  BatteryMedium,
  ChevronRight,
  Compass,
  Home,
  LayoutGrid,
  MapPin,
  Moon,
  Search,
  SignalHigh,
  Sparkles,
  User,
  Users,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

import {
  palaceMuseumPhotos,
  pingyaoPhotos,
  westLakePortraits,
  type Photo,
} from "../../lib/assets";

import "./styles.css";

interface DiscoverySection {
  readonly icon: LucideIcon;
  readonly items: readonly string[];
  readonly label: string;
  readonly tone: "ink" | "gold" | "mist";
}

interface ScenicAreaCard {
  readonly name: string;
  readonly photo: Photo;
  readonly region: string;
  /** 已上线的景区可以进详情页；未上线的只展示能力 */
  readonly to?: string;
}

const heroPhoto = westLakePortraits.leifengSunset;

const discoverySections: readonly DiscoverySection[] = [
  {
    label: "推荐",
    icon: Compass,
    items: ["热门去处", "今日限定", "附近好玩"],
    tone: "ink",
  },
  {
    label: "主题",
    icon: LayoutGrid,
    items: ["中秋雅集", "国庆主题", "四时西湖"],
    tone: "gold",
  },
  {
    label: "社区",
    icon: Users,
    items: ["达人游记", "瞬间分享", "纪念卡墙"],
    tone: "mist",
  },
];

/** 西湖是核心；另外两处用来说明平台可以承载任意景区 */
const scenicAreas: readonly ScenicAreaCard[] = [
  {
    name: "杭州西湖",
    region: "浙江 · 杭州",
    photo: westLakePortraits.jixianPavilionDusk,
    to: "/scenic/hangzhou-west-lake",
  },
  {
    name: "故宫博物院",
    region: "北京 · 东城",
    photo: palaceMuseumPhotos.cornerTower,
  },
  {
    name: "平遥古城",
    region: "山西 · 晋中",
    photo: pingyaoPhotos.mingQingStreet,
  },
];

const bottomNavigation = [
  { label: "个人空间", icon: Sparkles, to: "/space" },
  { label: "首页", icon: Home, to: "/home" },
  { label: "我的", icon: User, to: "/profile" },
] as const;

export function HomePage() {
  return (
    <main className="app-home-stage">
      <section className="app-home" aria-label="灵境奇旅游客端首页">
        <header className="app-home__header">
          <div className="app-home__glow" aria-hidden="true" />

          <div className="app-status" aria-label="当前时间 9 点 24 分">
            <time className="app-status__time">9:24</time>
            <span className="app-status__indicators" aria-hidden="true">
              <SignalHigh size={14} strokeWidth={2.2} />
              <Wifi size={14} strokeWidth={2.2} />
              <BatteryMedium size={16} strokeWidth={2.2} />
            </span>
          </div>

          <div className="app-brand-row">
            <p className="app-brand">灵境奇旅</p>
            <p className="app-brand__slogan">让每一处风景，都成为故事。</p>
          </div>

          <p className="app-location">
            <MapPin size={14} strokeWidth={2} aria-hidden="true" />
            杭州
            <span className="app-location__poem">湖光山色，醉美杭城。</span>
          </p>

          <label className="app-search">
            <Search size={16} strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">搜索景区、场景、主题或路线</span>
            <input type="search" placeholder="搜索景区、场景、主题、路线…" />
            <kbd>⌘ K</kbd>
          </label>
        </header>

        <div className="app-home__content">
          <section className="cloud-tour-card" aria-labelledby="cloud-tour-title">
            <div className="cloud-tour-card__copy">
              <p className="cloud-tour-card__eyebrow">今日云游</p>
              <h1 id="cloud-tour-title">水光山色，遇见西湖</h1>
              <p>走进可探索、可互动的数字风景，在故事里重新认识一座城。</p>
              <Link className="cloud-tour-card__cta" to="/scenic/hangzhou-west-lake">
                进入景区
                <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
            <figure className="cloud-tour-card__art">
              <img alt={heroPhoto.alt} src={heroPhoto.src} style={{ objectPosition: heroPhoto.focus }} />
            </figure>
          </section>

          <section className="scenic-area-rail" aria-labelledby="scenic-area-title">
            <div className="app-section-title">
              <h2 id="scenic-area-title">更多景区</h2>
              <span>陆续上线</span>
            </div>

            <ul className="scenic-area-rail__track">
              {scenicAreas.map((area) => {
                const body = (
                  <>
                    <img
                      alt={area.photo.alt}
                      decoding="async"
                      loading="lazy"
                      src={area.photo.src}
                      style={{ objectPosition: area.photo.focus }}
                    />
                    <span className="scenic-area-card__mask" aria-hidden="true" />
                    <span className="scenic-area-card__copy">
                      <strong>{area.name}</strong>
                      <small>{area.region}</small>
                    </span>
                    <span className="scenic-area-card__badge">
                      {area.to ? "可游览" : "即将开放"}
                    </span>
                  </>
                );

                return (
                  <li key={area.name}>
                    {area.to ? (
                      <Link className="scenic-area-card" to={area.to}>
                        {body}
                      </Link>
                    ) : (
                      <span className="scenic-area-card is-upcoming">{body}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="discovery-grid" aria-label="探索分类">
            {discoverySections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  className={`discovery-card discovery-card--${section.tone}`}
                  key={section.label}
                  type="button"
                >
                  <span className="discovery-card__heading">
                    <strong>{section.label}</strong>
                    <span aria-hidden="true">
                      <Icon size={16} strokeWidth={1.9} />
                    </span>
                  </span>
                  <span className="discovery-card__items">
                    {section.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </span>
                  <span className="discovery-card__more">
                    探索更多
                    <ChevronRight size={12} strokeWidth={2} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </section>

          <button className="festival-banner" type="button">
            <span className="festival-banner__edition">中秋限定</span>
            <span className="festival-banner__copy">
              <strong>中秋猜灯谜</strong>
              <small>在断桥答对灯谜，解锁「月映断桥」数字纪念卡</small>
            </span>
            <span className="festival-banner__stamp" aria-hidden="true">
              <Moon size={20} strokeWidth={1.7} />
            </span>
          </button>
        </div>

        <nav className="app-bottom-nav" aria-label="游客端主导航">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === "/home";

            return (
              <Link
                className={isActive ? "app-bottom-nav__item is-active" : "app-bottom-nav__item"}
                key={item.label}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="app-bottom-nav__icon" aria-hidden="true">
                  <Icon size={21} strokeWidth={isActive ? 2.1 : 1.8} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </section>
    </main>
  );
}
