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
  ThumbsUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import { CloudTourViewer } from "../../components/overlays/CloudTourViewer";
import { westLakeHero, westLakeLandscapes, westLakePortraits, type Photo } from "../../lib/assets";
import { WEST_LAKE_IDS } from "../../mocks/contracts";

import "./styles.css";

interface ExploreEntry {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly label: string;
  /** 入口打开嵌入的线上 3D 云游（Aholo Viewer），而不是跳转路由 */
  readonly opensCloudTour?: boolean;
  readonly to?: string;
}

interface ScenicScene {
  readonly caption: string;
  readonly name: string;
  readonly photo: Photo;
}

interface ScenicReview {
  readonly author: string;
  readonly avatar: string;
  readonly comment: string;
  readonly date: string;
  readonly likes: number;
  readonly rating: number;
  readonly tag: string;
}

/** Aholo 线上 3D 云游的嵌入地址（西湖 3D 场景） */
const aholoViewerSrc = "https://studio.aholo3d.cn/viewer?projectId=3FO4K4WSS5J6&subSiteFrom=embed";

const exploreEntries: readonly ExploreEntry[] = [
  {
    label: "线上 3D 云游",
    description: "足不出户云游西湖",
    icon: Box,
    opensCloudTour: true,
  },
  {
    label: "线下智游向导",
    description: "智能定位与讲解",
    icon: Navigation,
    // 进入乌龟潭实景：先过场景加载页做定位校准，再进 3D 探索。
    to: `/scene/${WEST_LAKE_IDS.scenes.reserved}/loading`,
  },
  {
    label: "经典游览路线",
    description: "精选路线推荐",
    icon: Route,
  },
];

const scenicScenes: readonly ScenicScene[] = [
  {
    name: "乌龟潭",
    caption: "曲水藏幽 · 云游画面",
    photo: westLakeLandscapes.turtlePond,
  },
  {
    name: "雷峰塔",
    caption: "隔湖望塔影 · 云游画面",
    photo: westLakePortraits.leifengPagodaDay,
  },
  {
    name: "三潭印月",
    caption: "湖心石塔 · 云游画面",
    photo: westLakePortraits.threePools,
  },
];

const scenicReviews: readonly ScenicReview[] = [
  {
    author: "小陈不吃葱",
    avatar: "陈",
    comment: "本来只想散步十分钟，结果沿湖走了两万步。西湖负责美，我的腿负责记住它。",
    date: "2 天前",
    likes: 328,
    rating: 5,
    tag: "暴走型选手",
  },
  {
    author: "杭州天气观察员",
    avatar: "杭",
    comment: "来之前：西湖不就是一个湖？来之后：这句话幸好没让白娘子听见。",
    date: "5 天前",
    likes: 216,
    rating: 5,
    tag: "真香现场",
  },
  {
    author: "减肥从明天开始",
    avatar: "吃",
    comment: "在苏堤走掉一杯奶茶，转头在楼外楼吃回三杯。风景和热量都很圆满。",
    date: "1 周前",
    likes: 189,
    rating: 4,
    tag: "边走边吃",
  },
];

export function ScenicDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCloudTourOpen, setIsCloudTourOpen] = useState(false);

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

              if (entry.to) {
                return <Link key={entry.label} to={entry.to}>{body}</Link>;
              }

              if (entry.opensCloudTour) {
                return (
                  <button key={entry.label} type="button" onClick={() => setIsCloudTourOpen(true)}>
                    {body}
                  </button>
                );
              }

              return <button key={entry.label} type="button">{body}</button>;
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
              <h2 id="scenic-scenes-title">云游秘境</h2>
              <button type="button" aria-label="查看全部云游秘境">
                查看全部 <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="scenic-spot-rail">
              <div className="scenic-rail__track">
                {[...scenicScenes, ...scenicScenes].map((scene, index) => {
                  const isClone = index >= scenicScenes.length;

                  return (
                    <article
                      className={isClone ? "scenic-spot-card is-clone" : "scenic-spot-card"}
                      key={`${scene.name}-${index}`}
                      aria-hidden={isClone || undefined}
                    >
                      <span className="scenic-spot-card__image">
                        <img
                          alt={isClone ? "" : scene.photo.alt}
                          decoding="async"
                          loading="lazy"
                          src={scene.photo.src}
                          style={{ objectPosition: scene.photo.focus }}
                        />
                        <span className="scenic-spot-card__mask" aria-hidden="true" />
                        <span className="scenic-spot-card__copy">
                          <strong>{scene.name}</strong>
                          <small>{scene.caption}</small>
                        </span>
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="scenic-content-section scenic-reviews" aria-labelledby="scenic-reviews-title">
            <div className="scenic-section-title">
              <h2 id="scenic-reviews-title">游客点评</h2>
              <button type="button">
                全部 2,368 条 <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="scenic-review-summary">
              <div className="scenic-review-summary__score">
                <strong>4.9</strong>
                <span>
                  <span className="scenic-review-stars" aria-label="游客评分 4.9 分">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} size={13} strokeWidth={1.5} fill="currentColor" aria-hidden="true" />
                    ))}
                  </span>
                  <small>超出 98% 同类景区</small>
                </span>
              </div>
              <div className="scenic-review-tags" aria-label="热门评价">
                <span>景色很美 1284</span>
                <span>适合散步 896</span>
                <span>拍照出片 742</span>
              </div>
            </div>

            <div className="scenic-review-rail">
              <div className="scenic-rail__track">
                {[...scenicReviews, ...scenicReviews].map((review, index) => {
                  const isClone = index >= scenicReviews.length;

                  return (
                    <article
                      className={isClone ? "scenic-review-card is-clone" : "scenic-review-card"}
                      key={`${review.author}-${index}`}
                      aria-hidden={isClone || undefined}
                    >
                      <header>
                        <span className="scenic-review-card__avatar" aria-hidden="true">{review.avatar}</span>
                        <span className="scenic-review-card__author">
                          <strong>{review.author}</strong>
                          <small>{review.date}</small>
                        </span>
                        <span className="scenic-review-stars" aria-label={isClone ? undefined : `评分 ${review.rating} 分`}>
                          {Array.from({ length: 5 }, (_, starIndex) => (
                            <Star
                              key={starIndex}
                              size={11}
                              strokeWidth={1.5}
                              fill={starIndex < review.rating ? "currentColor" : "none"}
                              aria-hidden="true"
                            />
                          ))}
                        </span>
                      </header>
                      <p>{review.comment}</p>
                      <footer>
                        <span>{review.tag}</span>
                        <span><ThumbsUp size={12} strokeWidth={1.7} aria-hidden="true" /> {review.likes}</span>
                      </footer>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <footer className="scenic-cta-bar scenic-cta-bar--refined">
          <button type="button" onClick={() => setIsCloudTourOpen(true)}>
            <span className="scenic-cta-bar__icon" aria-hidden="true"><Box size={22} strokeWidth={1.8} /></span>
            <span>开启 3D 云游</span>
            <ArrowRight size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </footer>

        {isCloudTourOpen && (
          <CloudTourViewer
            src={aholoViewerSrc}
            loadingText="正在进入西湖…"
            onClose={() => setIsCloudTourOpen(false)}
          />
        )}
      </article>
    </main>
  );
}
