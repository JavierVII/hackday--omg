import {
  Backpack,
  BadgeCheck,
  Box,
  CalendarDays,
  Camera,
  ChevronRight,
  Gem,
  Heart,
  Image,
  Landmark,
  Layers,
  Maximize2,
  MapPin,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { AppBottomNav } from "../../components/common/AppBottomNav";
import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import { westLakePortraits, type Photo } from "../../lib/assets";

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
    serial: "西湖藏 · 001",
    verse: "塔影入湖，夕照成金",
    form: "八面楼阁式塔",
    acquire: "完成雷峰夕照探索",
    intro:
      "雷峰塔立在西湖南岸的夕照山上，与北岸的保俶塔隔湖相望。日落时塔身被夕照染成暖金，影子一直铺到湖心去。这一件按塔身逐层建模，绕塔一周可以看清檐角、斗拱与自下而上的收分。",
    thumbnailUrl: "/assets/digital_assets/leifeng-pagoda.jpg",
    modelUrl: encodeURI("/assets/models_glb/雷峰塔.glb"),
  },
  {
    name: "荷花",
    type: "自然收藏",
    source: "曲院风荷",
    date: "2026.08.15",
    tone: "story",
    serial: "西湖藏 · 002",
    verse: "风过曲院，一池新荷",
    form: "重瓣红荷 · 单枝",
    acquire: "夏夜赏荷路线",
    intro:
      "曲院风荷的名字来自宋时酒坊边的那片荷塘，荷风里曾混着酒香。这一枝取自岳湖水域的重瓣红荷，花瓣的翻卷、叶面的起伏与叶脉走向都照实景采集，凑近看能见到边缘那层淡粉。",
    thumbnailUrl: "/assets/digital_assets/lotus.jpg",
    modelUrl: encodeURI("/assets/models_glb/荷花.glb"),
  },
  {
    name: "油纸伞",
    type: "互动道具",
    source: "烟雨西湖",
    date: "2026.08.14",
    tone: "lantern",
    serial: "西湖藏 · 003",
    verse: "一伞在手，收尽湖雨",
    form: "竹骨 · 桐油皮纸面",
    acquire: "雨天漫游触发",
    previewScale: 0.78,
    modelUrl: encodeURI("/assets/models_glb/油纸伞.glb"),
    intro:
      "以竹为骨、皮纸为面，桐油反复刷上十余道，是江南梅雨天里的旧物。撑开时伞面透光，雨点落上去声音细密。收进数字空间后可作随身道具，在雨天的漫游里遮雨，也遮晴日的晒。",
    thumbnailUrl: "/assets/digital_assets/oil-paper-umbrella.jpg",
  },
  {
    name: "茶具",
    type: "文化器物",
    source: "龙井问茶",
    date: "2026.08.13",
    tone: "moon",
    serial: "西湖藏 · 004",
    verse: "一盏龙井，半日清闲",
    form: "青瓷壶盏一组",
    acquire: "龙井问茶茶席",
    intro:
      "龙井茶产在西湖西南的龙井、翁家山与满觉陇一带，明前采、当日炒，讲究的是一盏一盏慢慢喝。这一组含壶、盏与茶则，釉色照着青瓷的冷青调，壶身上留着窑变的浅痕。",
    thumbnailUrl: "/assets/digital_assets/tea-set.jpg",
    modelUrl: encodeURI("/assets/models_glb/茶具.glb"),
  },
  {
    name: "松鼠",
    type: "生态精灵",
    source: "西湖群山",
    date: "2026.08.12",
    tone: "story",
    serial: "西湖藏 · 005",
    verse: "林间一闪，尾梢先到",
    form: "赤腹松鼠 · 带动作",
    acquire: "群山步道偶遇",
    brightness: 1.38,
    modelUrl: encodeURI("/assets/models_glb/松鼠.glb"),
    intro:
      "赤腹松鼠常出没在西湖群山的樟树与马尾松间，尾巴几乎和身子一样长。遇见它多在清早，抱着松果沿枝干竖着跑。这一件保留了原始动作，安静看一会儿，它会在原地理毛。",
    thumbnailUrl: "/assets/digital_assets/squirrel.jpg",
  },
  {
    name: "兔子",
    type: "灵境伙伴",
    source: "湖畔草木",
    date: "2026.08.12",
    tone: "moon",
    serial: "西湖藏 · 006",
    verse: "月色微凉，有兔跟来",
    form: "灵境伙伴 · 可随行",
    acquire: "中秋雅集夜访",
    previewScale: 0.78,
    modelUrl: encodeURI("/assets/models_glb/兔子.glb"),
    intro:
      "中秋雅集那夜从草丛里跟出来的一只，被同行的人认作月宫来客。它是湖畔草木间最安静的伙伴，收进数字空间后可以陪着漫游——你走它走，你停下看景，它也在脚边停下。",
    thumbnailUrl: "/assets/digital_assets/rabbit.jpg",
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
    title: "三潭收下最后一缕月光",
    location: "杭州西湖 · 三潭印月",
    date: "8月14日 19:32",
    note: "晚风掠过湖面，两座石塔把最后一缕霞光留在水里。",
    photo: westLakePortraits.threePools,
  },
  {
    title: "集贤亭亮灯了",
    location: "杭州西湖 · 集贤亭",
    date: "8月14日 20:06",
    note: "暮色落下来，亭灯和湖上的倒影同时亮起。",
    photo: westLakePortraits.jixianPavilionDusk,
  },
  {
    title: "雷峰塔与一叶归舟",
    location: "杭州西湖 · 雷峰塔",
    date: "8月12日 17:48",
    note: "游船从塔下的金色湖面缓缓驶过，正好按下快门。",
    photo: westLakePortraits.leifengSunset,
  },
] as const;

const momentCoverPhoto = westLakePortraits.jixianPavilionSunset;

const travelMomentPosters = [
  {
    src: "/assets/travel_moments/moon-over-water-zine.png",
    alt: "三潭印月石塔与湖面被重绘成暖色撕纸旅行纪念画",
    focus: "50% 68%",
  },
  {
    src: "/assets/travel_moments/lanterns-after-dusk-zine.png",
    alt: "暮色集贤亭与荷叶被重绘成黄色光线贯穿的撕纸旅行纪念画",
    focus: "50% 40%",
  },
  {
    src: "/assets/travel_moments/golden-hour-drifts-zine.png",
    alt: "雷峰塔与湖上游船被重绘成蓝色线条连接的撕纸旅行纪念画",
    focus: "50% 55%",
  },
] as const satisfies readonly Photo[];

const travelMomentDetails = [
  {
    fullDate: "2026年8月14日 · 19:32",
    mood: "湖面很静，连晚霞也慢了下来。",
    mediaType: "photo",
    mediaCount: 3,
    memoryNumber: "0814-01",
  },
  {
    fullDate: "2026年8月14日 · 20:06",
    mood: "亭灯亮起时，像有人替黄昏按下了暂停。",
    mediaType: "photo",
    mediaCount: 1,
    memoryNumber: "0814-02",
  },
  {
    fullDate: "2026年8月12日 · 17:48",
    mood: "塔影与归舟同框，今天的好运有了形状。",
    mediaType: "photo",
    mediaCount: 1,
    memoryNumber: "0812-01",
  },
] as const;

type TravelMomentMediaType = "photo" | "selfie" | "video";

type TravelMoment = (typeof demoTravelMoments)[number] & {
  poster: Photo;
  fullDate: string;
  mood: string;
  mediaType: TravelMomentMediaType;
  mediaCount: number;
  memoryNumber: string;
  isZine: boolean;
  videoSrc?: string;
};

const travelMoments: readonly TravelMoment[] = demoTravelMoments.map((moment, index) => ({
  ...moment,
  ...travelMomentDetails[index],
  poster: travelMomentPosters[index],
  isZine: true,
}));

function MomentMemoryCard({ moment, onClose }: { moment: TravelMoment; onClose: () => void }) {
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

  const mediaLabel = moment.mediaType === "video" ? "旅途视频" : moment.mediaType === "selfie" ? "旅途自拍" : "旅途照片";

  return createPortal(
    <div className="moment-memory-viewer" role="dialog" aria-modal="true" aria-labelledby="moment-memory-title">
      <button className="moment-memory-viewer__backdrop" type="button" aria-label="关闭纪念卡" onClick={onClose} />
      <article className="moment-memory-card">
        <button className="moment-memory-card__close" type="button" aria-label="关闭纪念卡" onClick={onClose} autoFocus>
          <X size={19} />
        </button>

        <div
          className={`moment-memory-card__media${moment.isZine ? " is-zine" : ""}`}
          style={moment.isZine ? {
            backgroundImage: `linear-gradient(rgb(15 39 33 / 36%), rgb(15 39 33 / 60%)), url(${moment.poster.src})`,
          } : undefined}
        >
          {moment.mediaType === "video" && moment.videoSrc ? (
            <video controls playsInline poster={moment.poster.src}>
              <source src={moment.videoSrc} />
            </video>
          ) : (
            <img
              src={moment.poster.src}
              alt={moment.poster.alt}
              style={{ objectPosition: moment.poster.focus }}
            />
          )}
          <div className="moment-memory-card__media-shade" />
          <span className="moment-memory-card__media-label">
            {moment.mediaType === "video" ? <Play size={12} fill="currentColor" /> : <Image size={13} />}
            {mediaLabel}
          </span>
          <span className="moment-memory-card__place"><MapPin size={12} /> {moment.location}</span>
        </div>

        <div className="moment-memory-card__body">
          <div className="moment-memory-card__eyebrow">
            <span>灵境奇旅 · 旅途纪念</span>
            <time>{moment.fullDate}</time>
          </div>
          <h2 id="moment-memory-title">{moment.title}</h2>
          <div className="moment-memory-card__rule" aria-hidden="true"><span /></div>
          <p className="moment-memory-card__note">{moment.note}</p>

          <blockquote className="moment-memory-card__mood">
            <Heart size={17} fill="currentColor" aria-hidden="true" />
            <div>
              <small>当时的心情</small>
              <p>{moment.mood}</p>
            </div>
          </blockquote>

          <footer className="moment-memory-card__footer">
            <span>MEMORY NO. {moment.memoryNumber}</span>
            <span className="moment-memory-card__seal" aria-hidden="true">西湖<br />留念</span>
          </footer>
        </div>
      </article>
    </div>,
    document.querySelector(".space-page") ?? document.body,
  );
}

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

        <div className="asset-viewer__body">
          <div className="asset-viewer__stage">
            <div className="asset-viewer__pedestal" aria-hidden="true" />

            <div className="asset-viewer__canvas">
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
            </div>

            <div className="asset-viewer__frame" aria-hidden="true" />
            <div className="asset-viewer__grain" aria-hidden="true" />
            <p className="asset-viewer__inscription" aria-hidden="true">{asset.verse}</p>
            <span className="asset-viewer__seal" aria-hidden="true">灵境</span>

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

          <section className="asset-viewer__intro" aria-label={`${asset.name} 藏品说明`}>
            <div className="asset-viewer__intro-head">
              <span className="asset-viewer__eyebrow">藏品说明</span>
              <span className="asset-viewer__serial"><Gem size={11} /> {asset.serial}</span>
            </div>
            <div className="asset-viewer__rule" aria-hidden="true"><span /></div>
            <p>{asset.intro}</p>

            <dl className="asset-viewer__facts">
              <div>
                <dt><Layers size={12} /> 形制</dt>
                <dd>{asset.form}</dd>
              </div>
              <div>
                <dt><MapPin size={12} /> 出处</dt>
                <dd>{asset.source}</dd>
              </div>
              <div>
                <dt><Sparkles size={12} /> 获得</dt>
                <dd>{asset.acquire}</dd>
              </div>
            </dl>
          </section>
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
          <p>{featuredAsset.acquire}</p>
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
  const [selectedMoment, setSelectedMoment] = useState<TravelMoment | null>(null);

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
        {travelMoments.map((moment) => (
          <button
            className="space-moment-card"
            key={moment.title}
            type="button"
            aria-label={`打开纪念卡：${moment.title}`}
            onClick={() => setSelectedMoment(moment)}
          >
            <div className="space-moment-card__media">
              <img
                src={moment.photo.src}
                alt={moment.photo.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: moment.photo.focus }}
              />
              <span><Image size={13} /> {moment.mediaCount}张</span>
            </div>
            <div className="space-moment-card__copy">
              <time>{moment.date}</time>
              <h3>{moment.title}</h3>
              <p className="space-moment-card__location"><MapPin size={12} /> {moment.location}</p>
              <p>{moment.note}</p>
            </div>
          </button>
        ))}
      </section>

      {selectedMoment && <MomentMemoryCard moment={selectedMoment} onClose={() => setSelectedMoment(null)} />}
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

        <AppBottomNav activePath="/space" />
      </section>
    </main>
  );
}
