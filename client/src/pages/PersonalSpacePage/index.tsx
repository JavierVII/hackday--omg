import {
  Backpack,
  BadgeCheck,
  CalendarDays,
  Camera,
  ChevronRight,
  Drama,
  Gem,
  Home,
  Image,
  Lamp,
  Landmark,
  MapPin,
  MoonStar,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { westLakePortraits } from "../../lib/assets";

import "./styles.css";

type SpaceView = "assets" | "moments";

const demoDigitalAssets = [
  {
    name: "月映断桥",
    type: "限定纪念卡",
    source: "杭州西湖",
    date: "2026.08.14",
    icon: MoonStar,
    tone: "moon",
  },
  {
    name: "白蛇传·相逢",
    type: "故事徽章",
    source: "断桥残雪",
    date: "2026.08.14",
    icon: Drama,
    tone: "story",
  },
  {
    name: "雷峰拾光",
    type: "场景模型",
    source: "雷峰塔",
    date: "2026.08.12",
    icon: Landmark,
    tone: "pagoda",
  },
  {
    name: "三潭印月灯",
    type: "互动道具",
    source: "小瀛洲",
    date: "2026.08.10",
    icon: Lamp,
    tone: "lantern",
  },
] as const;

const demoTravelMoments = [
  {
    title: "断桥的第一缕月光",
    location: "杭州西湖 · 断桥残雪",
    date: "8月14日 19:32",
    note: "晚风从湖面吹来，和云游搭档一起等到了月亮。",
    photo: westLakePortraits.threePools,
  },
  {
    title: "灯谜答对啦",
    location: "杭州西湖 · 中秋雅集",
    date: "8月14日 20:06",
    note: "解开最后一道灯谜，也把“月映断桥”带回了背包。",
    photo: westLakePortraits.jixianPavilionDusk,
  },
  {
    title: "雷峰塔下的金色时刻",
    location: "杭州西湖 · 雷峰塔",
    date: "8月12日 17:48",
    note: "光落在塔影与湖面之间，刚好按下了快门。",
    photo: westLakePortraits.leifengSunset,
  },
] as const;

const momentCoverPhoto = westLakePortraits.jixianPavilionSunset;

const bottomNavigation = [
  { label: "个人空间", icon: Sparkles, to: "/space" },
  { label: "首页", icon: Home, to: "/home" },
  { label: "我的", icon: User, to: "/profile" },
] as const;

function DigitalAssets() {
  return (
    <div className="space-view" role="tabpanel" aria-label="数字资产">
      <section className="space-wallet" aria-label="旅人背包概览">
        <div className="space-wallet__icon"><Backpack size={24} strokeWidth={1.7} /></div>
        <div>
          <p>旅人背包</p>
          <strong>收藏每一段真实到过的风景</strong>
        </div>
        <span>4 / 12</span>
      </section>

      <div className="space-section-heading">
        <div>
          <h2>我的数字资产</h2>
          <p>来自 3 个景区的旅途收获</p>
        </div>
        <button type="button">筛选 <ChevronRight size={14} /></button>
      </div>

      <section className="space-featured-asset" aria-label="最近获得的数字资产">
        <div className="space-featured-asset__copy">
          <span>最近获得</span>
          <h3>月映断桥</h3>
          <p>完成中秋灯谜挑战后获得</p>
          <small><MapPin size={12} /> 杭州西湖</small>
        </div>
        <div className="space-featured-asset__art" aria-hidden="true">
          <MoonStar size={46} strokeWidth={1.3} />
          <span />
        </div>
      </section>

      <section className="space-asset-grid" aria-label="数字资产列表">
        {demoDigitalAssets.map(({ name, type, source, date, icon: Icon, tone }) => (
          <button className={`space-asset-card space-asset-card--${tone}`} key={name} type="button">
            <span className="space-asset-card__art">
              <Icon size={34} strokeWidth={1.45} />
              <BadgeCheck className="space-asset-card__verified" size={16} fill="currentColor" />
            </span>
            <span className="space-asset-card__copy">
              <small>{type}</small>
              <strong>{name}</strong>
              <span>{source}</span>
              <time>{date}</time>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

function TravelMoments() {
  return (
    <div className="space-view" role="tabpanel" aria-label="游玩瞬间">
      <section className="space-moment-summary" aria-label="西湖旅途回忆">
        <img
          src={momentCoverPhoto.src}
          alt={momentCoverPhoto.alt}
          style={{ objectPosition: momentCoverPhoto.focus }}
        />
        <div className="space-moment-summary__shade" />
        <div className="space-moment-summary__copy">
          <span><CalendarDays size={13} /> 2026年8月</span>
          <h2>这一程，西湖有记忆</h2>
          <p>3 次漫游 · 8 个瞬间</p>
        </div>
        <div className="space-moment-summary__count"><strong>8</strong><span>瞬间</span></div>
      </section>

      <div className="space-section-heading">
        <div>
          <h2>最近瞬间</h2>
          <p>风景、故事和当时的心情</p>
        </div>
        <button type="button"><Camera size={14} /> 制作游记</button>
      </div>

      <section className="space-moment-list" aria-label="游玩瞬间列表">
        {demoTravelMoments.map((moment, index) => (
          <article className="space-moment-card" key={moment.title}>
            <div className="space-moment-card__media">
              <img
                src={moment.photo.src}
                alt={moment.photo.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: moment.photo.focus }}
              />
              <span><Image size={13} /> {index === 0 ? "3张" : "1张"}</span>
            </div>
            <div className="space-moment-card__copy">
              <time>{moment.date}</time>
              <h3>{moment.title}</h3>
              <p className="space-moment-card__location"><MapPin size={12} /> {moment.location}</p>
              <p>{moment.note}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function PersonalSpacePage() {
  const [activeView, setActiveView] = useState<SpaceView>("assets");

  return (
    <main className="app-home-stage space-stage">
      <section className="app-home space-page" aria-label="个人空间">
        <header className="space-header">
          <div className="space-status" aria-label="当前时间 9 点 24 分">
            <time>9:24</time>
            <span>灵境奇旅</span>
          </div>

          <div className="space-title-row">
            <div>
              <h1>个人空间</h1>
              <p>把旅途带回家，也把故事留在这里</p>
            </div>
            <div className="space-title-row__mark" aria-hidden="true"><Sparkles size={22} /></div>
          </div>

          <section className="space-overview" aria-label="个人空间概览">
            <div><Gem size={18} /><strong>4</strong><span>数字资产</span></div>
            <div><Camera size={18} /><strong>8</strong><span>游玩瞬间</span></div>
            <div><Landmark size={18} /><strong>3</strong><span>到访景区</span></div>
          </section>
        </header>

        <div className="space-content">
          <div className="space-tabs" role="tablist" aria-label="个人空间内容">
            <button
              className={activeView === "assets" ? "is-active" : undefined}
              type="button"
              role="tab"
              aria-selected={activeView === "assets"}
              onClick={() => setActiveView("assets")}
            >
              <Gem size={17} /> 数字资产
            </button>
            <button
              className={activeView === "moments" ? "is-active" : undefined}
              type="button"
              role="tab"
              aria-selected={activeView === "moments"}
              onClick={() => setActiveView("moments")}
            >
              <Camera size={17} /> 游玩瞬间
            </button>
          </div>

          {activeView === "assets" ? <DigitalAssets /> : <TravelMoments />}
        </div>

        <nav className="app-bottom-nav" aria-label="游客端主导航">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === "/space";

            return (
              <Link
                className={isActive ? "app-bottom-nav__item is-active" : "app-bottom-nav__item"}
                key={item.to}
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
