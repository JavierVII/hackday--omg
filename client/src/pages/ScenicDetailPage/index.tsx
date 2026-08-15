import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Navigation,
  Route,
  Share2,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import { westLakeHero, westLakeLandscapes, westLakePortraits, type Photo } from "../../lib/assets";

import "./styles.css";

interface ExploreEntry {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly to?: string;
}

interface ScenicScene {
  readonly caption: string;
  readonly name: string;
  readonly photo: Photo;
  /** 已建好 3D 场景的才有 sceneId，其余显示「场景制作中」 */
  readonly sceneId?: string;
}

interface TravelStory {
  readonly photo: Photo;
  readonly subtitle: string;
  readonly title: string;
}

/** Demo 主线场景，游客从这里进入 3D 云游 */
const primarySceneId = "scene-broken-bridge";

const exploreEntries: readonly ExploreEntry[] = [
  {
    label: "线上 3D 云游",
    description: "足不出户云游西湖",
    icon: Box,
    to: `/scene/${primarySceneId}/loading`,
  },
  {
    label: "线下智游向导",
    description: "智能定位与讲解",
    icon: Navigation,
    to: "/guide",
  },
  {
    label: "经典游览路线",
    description: "精选路线推荐",
    icon: Route,
  },
];

const scenicScenes: readonly ScenicScene[] = [
  {
    // TODO 换图：这是西湖雪景，不是断桥本身。拿到断桥实拍后替换。
    name: "断桥残雪",
    caption: "雪后湖上桥亭",
    photo: westLakeLandscapes.snowBridge,
    sceneId: primarySceneId,
  },
  {
    name: "雷峰塔",
    caption: "隔湖望塔影",
    photo: westLakePortraits.leifengPagodaDay,
    sceneId: "scene-leifeng-pagoda",
  },
  {
    name: "三潭印月",
    caption: "湖心石塔",
    photo: westLakePortraits.threePools,
  },
];

const travelStories: readonly TravelStory[] = [
  {
    title: "一窗湖山",
    subtitle: "我心相印亭的圆门",
    photo: westLakePortraits.heartMirrorGate,
  },
  {
    title: "落日集贤亭",
    subtitle: "日头正落在亭顶",
    photo: westLakePortraits.jixianPavilionSunset,
  },
  {
    title: "乌龟潭静水",
    subtitle: "一潭绿水与茅亭",
    photo: westLakeLandscapes.turtlePond,
  },
];

export function ScenicDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <main className="scenic-stage scenic-stage--refined demo-app-stage">
      <article className="scenic-detail scenic-detail--refined">
        <div className="scenic-cover__toolbar" aria-label="景区快捷操作">
          <Link className="scenic-icon-button" to="/home" aria-label="返回游客端首页">
            <ArrowLeft size={21} strokeWidth={1.9} />
          </Link>
          <div className="scenic-cover__toolbar-group">
            <button
              className={isFavorite ? "scenic-icon-button is-active" : "scenic-icon-button"}
              type="button"
              aria-label={isFavorite ? "取消收藏" : "收藏景区"}
              aria-pressed={isFavorite}
              onClick={() => setIsFavorite((favorite) => !favorite)}
            >
              <Heart size={21} strokeWidth={1.9} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button className="scenic-icon-button" type="button" aria-label="分享景区">
              <Share2 size={21} strokeWidth={1.9} />
            </button>
          </div>
        </div>

        <div className="scenic-detail__scroll scenic-detail__scroll--refined" aria-label="景区详情内容" tabIndex={0}>
          <section className="scenic-cover" aria-labelledby="scenic-title">
            <img
              className="scenic-cover__photo"
              alt={westLakeHero.alt}
              src={westLakeHero.src}
              style={{ objectPosition: westLakeHero.focus }}
            />
            <span className="scenic-cover__scrim" aria-hidden="true" />

            <MobileStatusBar className="scenic-status" />
          </section>

          <section className="scenic-summary">
            <h1 id="scenic-title">杭州西湖风景名胜区</h1>
            <div className="scenic-summary__meta">
              <span className="scenic-summary__rating">
                <strong>4.9</strong>
                <span className="scenic-summary__stars" aria-label="评分 4.9 分">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={13} strokeWidth={1.6} fill="currentColor" aria-hidden="true" />
                  ))}
                </span>
              </span>
              <span><MapPin size={13} aria-hidden="true" /> 浙江杭州 · 西湖区</span>
              <span><Clock3 size={13} aria-hidden="true" /> 建议游玩 3–5 小时</span>
            </div>
          </section>

          <section className="scenic-explore-rail" aria-label="景区游览入口">
            {exploreEntries.map((entry) => {
              const Icon = entry.icon;
              const body = (
                <>
                  <span className="scenic-explore-rail__icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <strong>{entry.label}</strong>
                  <small>{entry.description}</small>
                </>
              );

              return entry.to ? (
                <Link key={entry.label} to={entry.to}>{body}</Link>
              ) : (
                <button key={entry.label} type="button">{body}</button>
              );
            })}
          </section>

          <section className="scenic-editorial" aria-labelledby="scenic-intro-title">
            <div className="scenic-editorial__mountains" aria-hidden="true" />
            <h2 id="scenic-intro-title">一湖映千年，山水皆有故事</h2>
            <p>
              西湖三面云山、一水抱城，湖山与城市相依相融。白堤、苏堤横卧碧波，古塔、长桥与四时花木共同构成流传千年的文化景观。
            </p>
          </section>

          <section className="scenic-content-section" aria-labelledby="scenic-scenes-title">
            <div className="scenic-section-title">
              <h2 id="scenic-scenes-title">3D 场景</h2>
              <button type="button" aria-label="查看全部 3D 场景">
                查看全部 <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="scenic-spot-rail">
              {scenicScenes.map((scene) => (
                <article className="scenic-spot-card" key={scene.name}>
                  <span className="scenic-spot-card__image">
                    <img
                      alt={scene.photo.alt}
                      decoding="async"
                      loading="lazy"
                      src={scene.photo.src}
                      style={{ objectPosition: scene.photo.focus }}
                    />
                  </span>
                  <span className="scenic-spot-card__copy">
                    <span>
                      <strong>{scene.name}</strong>
                      <small>{scene.caption}</small>
                    </span>
                  </span>
                  {scene.sceneId ? (
                    <Link
                      className="scenic-spot-card__action"
                      to={`/scene/${scene.sceneId}/loading`}
                      aria-label={`进入${scene.name}的 3D 场景`}
                    >
                      <Box size={14} strokeWidth={1.8} aria-hidden="true" />
                      <span>进入 3D 场景</span>
                      <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="scenic-spot-card__action is-pending">
                      <Box size={14} strokeWidth={1.8} aria-hidden="true" />
                      <span>场景制作中</span>
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="scenic-content-section" aria-labelledby="travel-stories-title">
            <div className="scenic-section-title">
              <h2 id="travel-stories-title">热门游记</h2>
              <button type="button">
                更多游记 <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="scenic-story-rail">
              {travelStories.map((story) => (
                <article className="scenic-story-card" key={story.title}>
                  <img
                    alt={story.photo.alt}
                    decoding="async"
                    loading="lazy"
                    src={story.photo.src}
                    style={{ objectPosition: story.photo.focus }}
                  />
                  <span className="scenic-story-card__mask" aria-hidden="true" />
                  <div className="scenic-story-card__copy">
                    <strong>{story.title}</strong>
                    <span>{story.subtitle}</span>
                  </div>
                  <button type="button" aria-label={`收藏游记：${story.title}`}>
                    <Heart size={17} strokeWidth={1.8} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="scenic-cta-bar scenic-cta-bar--refined">
          <Link to={`/scene/${primarySceneId}/loading`}>
            <span className="scenic-cta-bar__icon" aria-hidden="true"><Box size={22} strokeWidth={1.8} /></span>
            <span>开启 3D 云游</span>
            <ArrowRight size={20} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </footer>
      </article>
    </main>
  );
}
