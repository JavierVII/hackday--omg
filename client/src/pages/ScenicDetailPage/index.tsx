import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BatteryMedium,
  Box,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Navigation,
  Route,
  Share2,
  SignalHigh,
  Star,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import "./styles.css";

interface ExploreEntry {
  description: string;
  icon: LucideIcon;
  label: string;
}

interface ScenicSpot {
  className: string;
  distance: string;
  name: string;
}

interface TravelStory {
  className: string;
  subtitle: string;
  title: string;
}

const exploreEntries: ExploreEntry[] = [
  {
    label: "线上 3D 云游",
    description: "足不出户云游西湖",
    icon: Box,
  },
  {
    label: "线下智游向导",
    description: "智能定位与讲解",
    icon: Navigation,
  },
  {
    label: "经典游览路线",
    description: "精选路线推荐",
    icon: Route,
  },
];

const scenicSpots: ScenicSpot[] = [
  { name: "乌龟潭", distance: "2.4 km", className: "is-turtle-pond" },
  { name: "曲院风荷", distance: "1.8 km", className: "is-lotus" },
  { name: "雷峰夕照", distance: "3.2 km", className: "is-sunset" },
];

const travelStories: TravelStory[] = [
  { title: "西湖晨色", subtitle: "不负人间四月天", className: "is-dawn" },
  { title: "漫步苏堤", subtitle: "邂逅夏日荷香", className: "is-summer" },
  { title: "断桥落日", subtitle: "浪漫定格瞬间", className: "is-evening" },
];

export function ScenicDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <main className="scenic-stage scenic-stage--refined">
      <article className="scenic-detail scenic-detail--refined">
        <div className="scenic-detail__scroll scenic-detail__scroll--refined" aria-label="景区详情内容" tabIndex={0}>
          <section className="scenic-cover" aria-labelledby="scenic-title">
            <div className="scenic-status" aria-label="当前时间 9 点 24 分">
              <time>9:24</time>
              <span className="scenic-status__icons" aria-hidden="true">
                <SignalHigh size={14} strokeWidth={2.2} />
                <Wifi size={14} strokeWidth={2.2} />
                <BatteryMedium size={16} strokeWidth={2.2} />
              </span>
            </div>

            <div className="scenic-cover__toolbar">
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
              <span><MapPin size={13} aria-hidden="true" /> 距离 12.4 km</span>
              <span><Clock3 size={13} aria-hidden="true" /> 建议游玩 3–5 小时</span>
            </div>
          </section>

          <section className="scenic-explore-rail" aria-label="景区游览入口">
            {exploreEntries.map((entry) => {
              const Icon = entry.icon;

              return (
                <button key={entry.label} type="button">
                  <span className="scenic-explore-rail__icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <strong>{entry.label}</strong>
                  <small>{entry.description}</small>
                </button>
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

          <section className="scenic-content-section" aria-labelledby="nearby-spots-title">
            <div className="scenic-section-title">
              <h2 id="nearby-spots-title">附近景点</h2>
              <button type="button" aria-label="查看全部附近景点">
                查看全部 <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="scenic-spot-rail">
              {scenicSpots.map((spot) => (
                <article className="scenic-spot-card" key={spot.name}>
                  <span className={`scenic-spot-card__image ${spot.className}`} aria-hidden="true" />
                  <span className="scenic-spot-card__copy">
                    <span>
                      <strong>{spot.name}</strong>
                      <small>{spot.distance}</small>
                    </span>
                  </span>
                  <button className="scenic-spot-card__action" type="button" aria-label={`进入${spot.name}的 3D 场景`}>
                    <Box size={14} strokeWidth={1.8} aria-hidden="true" />
                    <span>进入 3D 场景</span>
                    <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
                  </button>
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
                <article className={`scenic-story-card ${story.className}`} key={story.title}>
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
          <button type="button">
            <span className="scenic-cta-bar__icon" aria-hidden="true"><Box size={22} strokeWidth={1.8} /></span>
            <span>开启 3D 云游</span>
            <ArrowRight size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </footer>
      </article>
    </main>
  );
}
