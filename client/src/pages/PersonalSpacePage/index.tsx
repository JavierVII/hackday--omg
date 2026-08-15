import {
  Backpack,
  BadgeCheck,
  Box,
  CalendarDays,
  Camera,
  ChevronRight,
  Gem,
  Home,
  Image,
  Landmark,
  Maximize2,
  MapPin,
  RotateCcw,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";

import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import { westLakePortraits } from "../../lib/assets";

import "./styles.css";

type SpaceView = "assets" | "moments";

const AssetPreviewCanvas = lazy(() =>
  import("../../three/AssetPreviewCanvas").then((module) => ({
    default: module.AssetPreviewCanvas,
  })),
);

const digitalAssets = [
  {
    name: "雷峰塔",
    type: "景观模型",
    source: "雷峰夕照",
    date: "2026.08.15",
    tone: "pagoda",
    thumbnailUrl: "/assets/digital_assets/leifeng-pagoda.jpg",
    modelUrl: encodeURI("/assets/models_glb/雷峰塔.glb"),
  },
  {
    name: "荷花",
    type: "自然收藏",
    source: "曲院风荷",
    date: "2026.08.15",
    tone: "story",
    thumbnailUrl: "/assets/digital_assets/lotus.jpg",
    modelUrl: encodeURI("/assets/models_glb/荷花.glb"),
  },
  {
    name: "油纸伞",
    type: "互动道具",
    source: "烟雨西湖",
    date: "2026.08.14",
    tone: "lantern",
    thumbnailUrl: "/assets/digital_assets/oil-paper-umbrella.jpg",
    previewScale: 0.78,
    modelUrl: encodeURI("/assets/models_glb/油纸伞.glb"),
  },
  {
    name: "茶具",
    type: "文化器物",
    source: "龙井问茶",
    date: "2026.08.13",
    tone: "moon",
    thumbnailUrl: "/assets/digital_assets/tea-set.jpg",
    modelUrl: encodeURI("/assets/models_glb/茶具.glb"),
  },
  {
    name: "松鼠",
    type: "生态精灵",
    source: "西湖群山",
    date: "2026.08.12",
    tone: "story",
    thumbnailUrl: "/assets/digital_assets/squirrel.jpg",
    brightness: 1.38,
    modelUrl: encodeURI("/assets/models_glb/松鼠.glb"),
  },
  {
    name: "兔子",
    type: "灵境伙伴",
    source: "湖畔草木",
    date: "2026.08.12",
    tone: "moon",
    thumbnailUrl: "/assets/digital_assets/rabbit.jpg",
    previewScale: 0.78,
    modelUrl: encodeURI("/assets/models_glb/兔子.glb"),
  },
] as const;

type DigitalAsset = (typeof digitalAssets)[number];

const assetLevelThresholds = [0, 3, 8, 14] as const;
const assetLevelTitles = ["初见旅人", "湖畔拾光者", "西湖典藏家", "灵境守藏人"] as const;

function getAssetCollectionStatus(collected: number) {
  let level = 1;

  for (let index = 1; index < assetLevelThresholds.length; index += 1) {
    if (collected < assetLevelThresholds[index]) break;
    level = index + 1;
  }

  const currentLevelAt = assetLevelThresholds[level - 1];
  const nextLevelAt = assetLevelThresholds[level] ?? currentLevelAt + 6;
  const progress = Math.min(
    100,
    Math.round(((collected - currentLevelAt) / (nextLevelAt - currentLevelAt)) * 100),
  );

  return {
    collected,
    level,
    nextLevel: level + 1,
    nextLevelAt,
    progress,
    title: assetLevelTitles[level - 1] ?? assetLevelTitles.at(-1),
  };
}

const assetCollection = getAssetCollectionStatus(digitalAssets.length);

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

function AssetViewer({ asset, onClose }: { asset: DigitalAsset; onClose: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const handleReady = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => setHasError(true), []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="asset-viewer" role="dialog" aria-modal="true" aria-label={`${asset.name} 3D 预览`}>
      <button className="asset-viewer__backdrop" type="button" aria-label="关闭预览" onClick={onClose} />
      <section className="asset-viewer__panel">
        <header className="asset-viewer__header">
          <div>
            <small>{asset.type} · {asset.source}</small>
            <h2>{asset.name}</h2>
          </div>
          <button className="asset-viewer__close" type="button" aria-label="关闭 3D 预览" onClick={onClose} autoFocus>
            <X size={20} />
          </button>
        </header>

        <div className="asset-viewer__stage">
          <Suspense fallback={null}>
            <AssetPreviewCanvas
              modelUrl={asset.modelUrl}
              resetKey={resetKey}
              modelScale={"previewScale" in asset ? asset.previewScale : 1}
              brightness={"brightness" in asset ? asset.brightness : 1}
              onReady={handleReady}
              onError={handleError}
            />
          </Suspense>
          {!isLoaded && !hasError && (
            <div className="asset-viewer__loading" role="status">
              <span />
              <p>正在打开数字藏品…</p>
            </div>
          )}
          {hasError && (
            <div className="asset-viewer__error" role="alert">
              <Box size={28} />
              <strong>模型暂时无法打开</strong>
              <p>请检查 GLB 文件是否完整后重试</p>
            </div>
          )}
          <button
            className="asset-viewer__reset"
            type="button"
            onClick={() => setResetKey((value) => value + 1)}
            aria-label="重置观察视角"
          >
            <RotateCcw size={16} />
            重置视角
          </button>
        </div>

        <footer className="asset-viewer__footer">
          <span><RotateCcw size={14} /> 拖动旋转</span>
          <span>滚轮或双指缩放</span>
          <time>{asset.date} 获得</time>
        </footer>
      </section>
    </div>,
    document.querySelector(".space-page") ?? document.body,
  );
}

function DigitalAssets() {
  const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(null);
  const featuredAsset = digitalAssets[0];

  return (
    <div className="space-view" role="tabpanel" aria-label="数字资产">
      <section className="space-wallet" aria-label="数字空间收藏等级">
        <div className="space-wallet__icon"><Backpack size={24} strokeWidth={1.7} /></div>
        <div className="space-wallet__copy">
          <div className="space-wallet__title">
            <p>数字空间</p>
            <span>Lv.{assetCollection.level}</span>
          </div>
          <strong>{assetCollection.title}</strong>
          <div
            className="space-wallet__progress"
            role="progressbar"
            aria-label="数字空间升级进度"
            aria-valuemin={0}
            aria-valuemax={assetCollection.nextLevelAt}
            aria-valuenow={assetCollection.collected}
          >
            <span style={{ width: `${assetCollection.progress}%` }} />
          </div>
          <small>
            已收藏 {assetCollection.collected} 件 · 再收集 {assetCollection.nextLevelAt - assetCollection.collected} 件升至 Lv.{assetCollection.nextLevel}
          </small>
        </div>
        <span>{assetCollection.collected} / {assetCollection.nextLevelAt}</span>
      </section>

      <div className="space-section-heading">
        <div>
          <h2>我的数字资产</h2>
          <p>6 件可以互动查看的旅途收藏</p>
        </div>
        <button type="button">筛选 <ChevronRight size={14} /></button>
      </div>

      <button
        className="space-featured-asset"
        type="button"
        aria-label={`查看${featuredAsset.name} 3D 模型`}
        onClick={() => setSelectedAsset(featuredAsset)}
      >
        <div className="space-featured-asset__copy">
          <span>最近获得</span>
          <h3>{featuredAsset.name}</h3>
          <p>完成雷峰夕照探索后获得</p>
          <small><MapPin size={12} /> {featuredAsset.source}</small>
        </div>
        <div className="space-featured-asset__art" aria-hidden="true">
          <img src={featuredAsset.thumbnailUrl} alt="" />
        </div>
        <Maximize2 className="space-featured-asset__open" size={15} aria-hidden="true" />
      </button>

      <section className="space-asset-grid" aria-label="数字资产列表">
        {digitalAssets.map((asset) => {
          return (
            <button
              className={`space-asset-card space-asset-card--${asset.tone}`}
              key={asset.name}
              type="button"
              aria-label={`查看${asset.name} 3D 模型`}
              onClick={() => setSelectedAsset(asset)}
            >
              <span className="space-asset-card__art">
                <img src={asset.thumbnailUrl} alt="" loading="lazy" decoding="async" />
                <BadgeCheck className="space-asset-card__verified" size={16} fill="currentColor" />
                <span className="space-asset-card__view"><Maximize2 size={11} /> 查看 3D</span>
              </span>
              <span className="space-asset-card__copy">
                <small>{asset.type}</small>
                <strong>{asset.name}</strong>
                <span>{asset.source}</span>
                <time>{asset.date}</time>
              </span>
            </button>
          );
        })}
      </section>

      {selectedAsset && <AssetViewer asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
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
    <main className="app-home-stage demo-app-stage space-stage">
      <section className="app-home space-page" aria-label="个人空间">
        <header className="space-header">
          <MobileStatusBar className="space-status" />

          <div className="space-title-row">
            <div>
              <h1>个人空间</h1>
              <p>把旅途带回家，也把故事留在这里</p>
            </div>
            <div className="space-title-row__mark" aria-hidden="true"><Sparkles size={22} /></div>
          </div>

          <section className="space-overview" aria-label="个人空间概览">
            <div><Gem size={18} /><strong>6</strong><span>数字资产</span></div>
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
