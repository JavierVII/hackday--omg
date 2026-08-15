import {
  ArrowLeft,
  ArrowRight,
  Box,
  ChevronRight,
  Gem,
  Home,
  MapPin,
  Moon,
  Navigation,
  Search,
  Sparkles,
  Timer,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import {
  palaceMuseumPhotos,
  pingyaoPhotos,
  westLakeLandscapes,
  westLakePortraits,
  type Photo,
} from "../../lib/assets";

import "./styles.css";

/** 首页三张能力卡：对应本产品真正提供的三种游法，而不是内容社区式的频道分类 */
interface PlayStyle {
  /** 卡片底部的主操作文案，与 CLAUDE.md 的「主操作文案」约定一致：一卡一动作 */
  readonly action: string;
  readonly icon: LucideIcon;
  readonly items: readonly string[];
  readonly label: string;
  readonly to: string;
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

/** 中秋猜灯谜投放在断桥场景（interaction-mid-autumn-riddle） */
const festivalSceneId = "scene-broken-bridge";

/** 纪念卡限量额度，Demo 写死；接入后端后应由活动配置下发 */
const festivalQuota = { claimed: 1286, total: 5000 } as const;

const playStyles: readonly PlayStyle[] = [
  {
    label: "云游",
    icon: Box,
    items: ["3D 场景", "主题氛围", "自由探索"],
    action: "开始云游",
    to: "/scenic/hangzhou-west-lake",
    tone: "ink",
  },
  {
    label: "向导",
    icon: Navigation,
    items: ["实时定位", "沿途讲解", "路线推荐"],
    action: "开启向导",
    to: "/guide",
    tone: "mist",
  },
  {
    label: "藏品",
    icon: Gem,
    items: ["数字资产", "纪念卡", "游玩瞬间"],
    action: "打开背包",
    to: "/space",
    tone: "gold",
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

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * 活动倒计时。
 *
 * 截止时刻按「打开页面时刻 + 3 天」的零点算，而不是写死日期 ——
 * Demo 无论哪天演示都在活动期内，不会出现负数倒计时。
 */
function useFestivalCountdown() {
  const deadline = useMemo(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 3);

    return end.getTime();
  }, []);

  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, deadline - Date.now()));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline]);

  const totalSeconds = Math.floor(remaining / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: pad(Math.floor((totalSeconds % 86400) / 3600)),
    minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: pad(totalSeconds % 60),
  };
}

export function HomePage() {
  const countdown = useFestivalCountdown();
  const claimedPercent = Math.round((festivalQuota.claimed / festivalQuota.total) * 100);
  const rewardPhoto = westLakeLandscapes.snowBridge;

  return (
    <main className="app-home-stage demo-app-stage">
      <Link className="app-home-demo-back" to="/" aria-label="返回进入页">
        <ArrowLeft size={17} strokeWidth={1.9} aria-hidden="true" />
        返回进入页
      </Link>

      <section className="app-home" aria-label="灵境奇旅游客端首页">
        <header className="app-home__header">
          <div className="app-home__glow" aria-hidden="true" />

          <MobileStatusBar className="app-status" />

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
          </label>
        </header>

        <div className="app-home__content">
          <section className="cloud-tour-card" aria-labelledby="cloud-tour-title">
            <div className="cloud-tour-card__copy">
              <p className="cloud-tour-card__eyebrow">今日云游</p>
              <h1 id="cloud-tour-title">
                水光山色，
                <br />
                遇见西湖
              </h1>
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

          <section className="play-style-section" aria-labelledby="play-style-title">
            <div className="app-section-title">
              <h2 id="play-style-title">三种游法</h2>
              <span>云游 · 向导 · 藏品</span>
            </div>

            <div className="play-grid">
              {playStyles.map((style) => {
                const Icon = style.icon;

                return (
                  <Link
                    className={`play-card play-card--${style.tone}`}
                    key={style.label}
                    to={style.to}
                  >
                    <span className="play-card__heading">
                      <strong>{style.label}</strong>
                      <span aria-hidden="true">
                        <Icon size={16} strokeWidth={1.9} />
                      </span>
                    </span>
                    <span className="play-card__items">
                      {style.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </span>
                    <span className="play-card__action">
                      {style.action}
                      <ChevronRight size={12} strokeWidth={2} aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="festival-section" aria-labelledby="festival-section-title">
            <div className="app-section-title">
              <h2 id="festival-section-title">限时活动</h2>
              <span>中秋雅集 · 限时开放</span>
            </div>

            <Link
              className="festival-event"
              to={`/scene/${festivalSceneId}/loading`}
              aria-label={`参与中秋猜灯谜活动，解锁限量纪念卡「月映断桥」，距结束 ${countdown.days} 天`}
            >
              <span className="festival-event__moon" aria-hidden="true" />

              <span className="festival-event__status">
                <span className="festival-event__live">
                  <i aria-hidden="true" />
                  活动进行中
                </span>
                <span className="festival-event__timer">
                  <Timer size={12} strokeWidth={2} aria-hidden="true" />
                  距结束 {countdown.days} 天
                  <time>
                    {countdown.hours}:{countdown.minutes}:{countdown.seconds}
                  </time>
                </span>
              </span>

              <span className="festival-event__main">
                <span className="festival-event__copy">
                  <span className="festival-event__tag">中秋限定</span>
                  <strong>中秋猜灯谜</strong>
                  <small>在断桥答对三道灯谜，赢走限量数字纪念卡</small>
                </span>

                <span className="festival-event__prize">
                  <img
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    loading="lazy"
                    src={rewardPhoto.src}
                    style={{ objectPosition: rewardPhoto.focus }}
                  />
                  <span className="festival-event__prize-moon" aria-hidden="true">
                    <Moon size={12} strokeWidth={1.8} />
                  </span>
                  <span className="festival-event__prize-name">月映断桥</span>
                </span>
              </span>

              <span className="festival-event__footer">
                <span className="festival-event__quota">
                  <span className="festival-event__quota-bar">
                    <i style={{ width: `${claimedPercent}%` }} />
                  </span>
                  <small>
                    限量 {festivalQuota.total.toLocaleString("en-US")} 张 · 已有{" "}
                    {festivalQuota.claimed.toLocaleString("en-US")} 位旅人解锁
                  </small>
                </span>
                <span className="festival-event__cta">
                  立即参与
                  <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                </span>
              </span>
            </Link>
          </section>
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
