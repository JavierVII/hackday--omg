import {
  ArrowLeft,
  ArrowRight,
  Home,
  Leaf,
  MapPin,
  Moon,
  Search,
  Sparkles,
  Sunset,
  Timer,
  User,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link } from "react-router";

import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import { readAlmanac } from "../../lib/almanac";
import {
  palaceMuseumPhotos,
  pingyaoPhotos,
  westLakeLandscapes,
  westLakePortraits,
  type Photo,
} from "../../lib/assets";

import "./styles.css";

interface ScenicAreaCard {
  readonly name: string;
  readonly photo: Photo;
  readonly region: string;
  /** 已上线的景区可以进详情页；未上线的只展示能力 */
  readonly to?: string;
}

interface CloudTour {
  /** 对应 WEST_LAKE_IDS 里的景区 / 场景 ID */
  readonly id: string;
  readonly cta: string;
  /** 大字标题分两行排，避免不同长度的句子折行位置乱跳 */
  readonly heading: readonly [string, string];
  readonly blurb: string;
  readonly photo: Photo;
  readonly spot: string;
  readonly to: string;
}

/**
 * 今日云游可切换的三处去向：景区总览 + 两个场景。
 * 接入 `GET /api/client/config` 后应由 `scenes` 生成，不再写死。
 */
const cloudTours: readonly CloudTour[] = [
  {
    id: "hangzhou-west-lake",
    spot: "西湖全景",
    heading: ["水光山色，", "遇见西湖"],
    blurb: "走进可探索、可互动的数字风景，在故事里重新认识一座城。",
    cta: "进入景区",
    photo: westLakePortraits.jixianPavilionSunset,
    to: "/scenic/hangzhou-west-lake",
  },
  {
    id: "scene-broken-bridge",
    spot: "断桥残雪",
    heading: ["断桥不断，", "故事未完"],
    blurb: "白堤起处，听一段千年也没散场的相逢与等待。",
    cta: "云游断桥",
    photo: westLakeLandscapes.snowBridge,
    to: "/scene/scene-broken-bridge/loading",
  },
  {
    id: "scene-leifeng-pagoda",
    spot: "雷峰夕照",
    heading: ["塔影千年，", "夕照满湖"],
    blurb: "登上雷峰塔向北望，把一整面湖的金光收进一眼里。",
    cta: "登塔远眺",
    photo: westLakePortraits.leifengSunset,
    to: "/scene/scene-leifeng-pagoda/loading",
  },
];

/** 横向拖动超过该像素判定为一次切换 */
const SWIPE_THRESHOLD = 48;

/** 位移不到该像素仍算点击，免得点 CTA 时被判成拖动 */
const DRAG_SLOP = 8;

/** 中间卡宽度占视口宽度的百分比（同时写在卡片的内联样式上，保证与位移换算一致）。 */
const CARD_WIDTH_PCT = 88;

/** 相邻卡中心相对视口中心的偏移（占视口宽度百分比）：只让一条细边露出视口 */
const NEIGHBOR_OFFSET_PCT = 81;

/** translateX 的百分比相对卡片自身宽度，换算成相对视口的位移后直接交给 transform */
const NEIGHBOR_TRANSLATE = (NEIGHBOR_OFFSET_PCT / CARD_WIDTH_PCT) * 100;

/** 相邻卡相对当前卡的缩放，让中间的卡更醒目 */
const NEIGHBOR_SCALE = 0.84;

/** 相邻卡明显压暗，视线落点始终在中间卡上，交接处不再像两张卡硬拼 */
const NEIGHBOR_DIM = 0.8;

/**
 * 按「距当前卡的环状距离」算出每张卡的位移 / 缩放 / 压暗 / 层级。
 * 全部用 transform 表达，切换动画只走 GPU 合成，不触发布局。
 * 三张卡时左右相邻各露一截；更多张时更远的卡移出视口，不干扰。
 */
function coverflowPose(depth: number, total: number) {
  if (depth === 0) {
    return { offset: 0, opacity: 1, scale: 1, zIndex: 3 };
  }

  if (depth === 1) {
    return { offset: NEIGHBOR_TRANSLATE, opacity: NEIGHBOR_DIM, scale: NEIGHBOR_SCALE, zIndex: 2 };
  }

  if (depth === total - 1) {
    return { offset: -NEIGHBOR_TRANSLATE, opacity: NEIGHBOR_DIM, scale: NEIGHBOR_SCALE, zIndex: 2 };
  }

  return {
    offset: depth < total / 2 ? NEIGHBOR_TRANSLATE * 2 : -NEIGHBOR_TRANSLATE * 2,
    opacity: 0,
    scale: 0.7,
    zIndex: 1,
  };
}

interface DeckDrag {
  readonly pointerId: number;
  readonly x: number;
  readonly y: number;
  /** 首次超过 slop 时锁定方向：横向自己接管，纵向交还给页面滚动 */
  axis: "" | "x" | "y";
}

/** 中秋猜灯谜投放在断桥场景（interaction-mid-autumn-riddle） */
const festivalSceneId = "scene-broken-bridge";

/** 纪念卡限量额度，Demo 写死；接入后端后应由活动配置下发 */
const festivalQuota = { claimed: 1286, total: 5000 } as const;

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

/** 每秒一跳的时钟。倒计时与「湖山此刻」共用同一个 interval。 */
function useSecondTick() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  return now;
}

/**
 * 活动截止时刻：按「打开页面时刻 + 3 天」的零点算，而不是写死日期 ——
 * Demo 无论哪天演示都在活动期内，不会出现负数倒计时。
 */
function useFestivalDeadline() {
  return useMemo(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 3);

    return end.getTime();
  }, []);
}

function formatCountdown(remaining: number) {
  const totalSeconds = Math.floor(Math.max(0, remaining) / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: pad(Math.floor((totalSeconds % 86400) / 3600)),
    minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: pad(totalSeconds % 60),
  };
}

/**
 * 今日云游卡组：三张卡叠成一摞，横向拖动或点圆点切换，
 * 后面卡片露出的下边缘用来提示「还有下一处」。
 *
 * 单独拆成组件是为了让拖动时的高频重渲染止步于此，
 * 不去带动首页里逐秒跳动的倒计时与「湖山此刻」。
 */
function CloudTourDeck() {
  const total = cloudTours.length;
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const dragRef = useRef<DeckDrag | null>(null);
  /** 本次按下是否已经拖动过，用来决定抬手后那次 click 要不要吃掉 */
  const movedRef = useRef(false);

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) {
      return;
    }

    dragRef.current = {
      axis: "",
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    movedRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;

    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (start.axis === "") {
      if (Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) {
        return;
      }

      start.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";

      // 锁定横向后接管指针，手指滑出卡片范围也能继续跟手
      if (start.axis === "x") {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }

    if (start.axis !== "x") {
      return;
    }

    movedRef.current = true;
    setDrag(dx);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;

    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - start.x;

    dragRef.current = null;
    setDrag(0);

    if (start.axis !== "x") {
      return;
    }

    if (dx <= -SWIPE_THRESHOLD) {
      go(index + 1);
    } else if (dx >= SWIPE_THRESHOLD) {
      go(index - 1);
    }
  };

  /** 拖完抬手时浏览器还会补一次 click，吃掉它，免得顺手打开了卡片链接 */
  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!movedRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    movedRef.current = false;
  };

  const dragging = drag !== 0;
  const current = cloudTours[index];

  return (
    <section className="cloud-tour" aria-label="今日云游" aria-roledescription="卡片轮播">
      <div
        className={`cloud-tour__viewport${dragging ? " is-dragging" : ""}`}
        onClickCapture={handleClickCapture}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
      >
        <div className="cloud-tour__track" style={{ transform: `translateX(${drag}px)` }}>
          {cloudTours.map((tour, position) => {
            const depth = (position - index + total) % total;
            const active = depth === 0;
            const { offset, opacity, scale, zIndex } = coverflowPose(depth, total);

            return (
              <article
                className={`cloud-tour-card${active ? "" : " is-behind"}`}
                inert={!active}
                key={tour.id}
                style={{
                  opacity,
                  transform: `translateX(${offset}%) scale(${scale})`,
                  width: `${CARD_WIDTH_PCT}%`,
                  zIndex,
                }}
              >
                <div className="cloud-tour-card__copy">
                  <p className="cloud-tour-card__eyebrow">今日云游 · {tour.spot}</p>
                  <h2 className="cloud-tour-card__title">
                    {tour.heading[0]}
                    <br />
                    {tour.heading[1]}
                  </h2>
                  <p>{tour.blurb}</p>
                  <Link className="cloud-tour-card__cta" to={tour.to}>
                    {tour.cta}
                    <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                  </Link>
                </div>
                <figure className="cloud-tour-card__art">
                  <img
                    alt={tour.photo.alt}
                    src={tour.photo.src}
                    style={{ objectPosition: tour.photo.focus }}
                  />
                </figure>
              </article>
            );
          })}
        </div>
      </div>

      <div className="cloud-tour__pager">
        <div className="cloud-tour__dots">
          {cloudTours.map((tour, position) => (
            <button
              aria-current={position === index || undefined}
              aria-label={`切换到第 ${position + 1} 处：${tour.spot}`}
              className="cloud-tour__dot"
              key={tour.id}
              onClick={() => go(position)}
              type="button"
            >
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        今日云游第 {index + 1} 处，共 {total} 处：{current.spot}
      </p>
    </section>
  );
}

export function HomePage() {
  const now = useSecondTick();
  const deadline = useFestivalDeadline();
  const countdown = formatCountdown(deadline - now);
  const almanac = readAlmanac(new Date(now));
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
            <h1 className="app-brand">灵境奇旅</h1>
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
          <CloudTourDeck />

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

          <section className="almanac-section" aria-labelledby="almanac-title">
            <div className="app-section-title">
              <h2 id="almanac-title">湖山此刻</h2>
              <span>
                {almanac.solarTerm} · {almanac.phenology}
              </span>
            </div>

            <Link
              className="almanac-card"
              to="/scenic/hangzhou-west-lake"
              aria-label={`${almanac.shichen}，${almanac.shichenNote}。此刻最宜去${almanac.pick.spot}`}
            >
              <span className="almanac-card__wash" aria-hidden="true" />

              <span className="almanac-card__head">
                <span className="almanac-card__hour">
                  <strong>{almanac.shichen}</strong>
                  <time>{almanac.clock}</time>
                </span>
                <span className="almanac-card__seal" aria-hidden="true">
                  {almanac.pick.label}
                </span>
              </span>

              <span className="almanac-card__note">{almanac.shichenNote}</span>

              <span className="almanac-card__meta">
                <Sunset size={12} strokeWidth={1.9} aria-hidden="true" />
                {almanac.sunsetLine}
              </span>

              <span className="almanac-card__pick">
                <img
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  loading="lazy"
                  src={almanac.pick.photo.src}
                  style={{ objectPosition: almanac.pick.photo.focus }}
                />
                <span className="almanac-card__pick-copy">
                  <small>
                    <Leaf size={11} strokeWidth={1.9} aria-hidden="true" />
                    此刻最宜
                  </small>
                  <strong>{almanac.pick.spot}</strong>
                  <em>{almanac.pick.line}</em>
                </span>
                <span className="almanac-card__pick-go">
                  去看看
                  <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
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
