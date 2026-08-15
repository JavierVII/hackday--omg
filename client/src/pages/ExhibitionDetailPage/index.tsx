import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  ChevronRight,
  Clock3,
  Headphones,
  Heart,
  MapPin,
  Route,
  Share2,
  Star,
  ThumbsUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import { CloudTourViewer } from "../../components/overlays/CloudTourViewer";
import { exhibitionPhotos, type Photo } from "../../lib/assets";

/* 详情页外壳（封面 / 工具栏 / 入口宫格 / 区块标题 / 横向卡带 / 点评 / 底部主操作）
   与景区详情页是同一套 `.scenic-*` 视觉，直接复用它的样式表，避免两份实现各自漂移。
   等出现第三个详情页时，应把这套外壳提到 `src/styles/` 或 `components/` 再共用。 */
import "../ScenicDetailPage/styles.css";
import "./styles.css";

interface ExploreEntry {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly label: string;
  /** 入口打开嵌入的线上 3D 云游（Aholo Viewer），而不是跳转路由 */
  readonly opensCloudTour?: boolean;
  readonly to?: string;
}

interface ExhibitionScene {
  readonly caption: string;
  readonly name: string;
  readonly photo: Photo;
}

interface ExhibitionFact {
  readonly label: string;
  readonly value: string;
}

interface ExhibitionReview {
  readonly author: string;
  readonly avatar: string;
  readonly comment: string;
  readonly date: string;
  readonly likes: number;
  readonly rating: number;
  readonly tag: string;
}

/** Aholo 线上 3D 云游的嵌入地址（数字展馆 3D 场景） */
const aholoViewerSrc = "https://studio.aholo3d.cn/viewer?projectId=3FO4K509ULL4&subSiteFrom=embed";

const exploreEntries: readonly ExploreEntry[] = [
  {
    label: "线上 3D 云游",
    description: "走进数字展厅",
    icon: Box,
    opensCloudTour: true,
  },
  {
    label: "线下导览",
    description: "逐幅听懂作品",
    icon: Headphones,
  },
  {
    label: "观展动线推荐",
    description: "三层顺序不走空",
    icon: Route,
  },
];

/** 当期展览信息，接入 `GET /api/client/config` 后应随场景一起下发 */
const exhibitionFacts: readonly ExhibitionFact[] = [
  { label: "展期", value: "2026.08.01 — 10.07" },
  { label: "展区", value: "一层中庭 · 二层长廊 · 三层小画布" },
  { label: "票务", value: "云游免票 · 到馆 60 元" },
];

const exhibitionScenes: readonly ExhibitionScene[] = [
  {
    name: "旋梯中庭",
    caption: "天光垂落 · 云游画面",
    photo: exhibitionPhotos.atriumStair,
  },
  {
    name: "天光长廊",
    caption: "沿墙看画 · 云游画面",
    photo: exhibitionPhotos.skylightHall,
  },
  {
    name: "小画布展区",
    caption: "方寸之间 · 云游画面",
    photo: exhibitionPhotos.smallCanvas,
  },
];

const exhibitionReviews: readonly ExhibitionReview[] = [
  {
    author: "不懂艺术但会拍",
    avatar: "拍",
    comment: "本来是进来蹭空调的，结果在一幅画前站了十分钟。看不懂，但确实被安静到了。",
    date: "3 天前",
    likes: 264,
    rating: 5,
    tag: "误入型选手",
  },
  {
    author: "周末美术馆钉子户",
    avatar: "馆",
    comment: "导览说这是第二樂章，我听完把三层又走了一遍——这次是配着乐看的，完全两个展。",
    date: "6 天前",
    likes: 198,
    rating: 5,
    tag: "二刷现场",
  },
  {
    author: "地板反光爱好者",
    avatar: "光",
    comment: "白墙、木地板、天窗，随手一拍都像画册内页。朋友问我是不是请了摄影师。",
    date: "1 周前",
    likes: 173,
    rating: 4,
    tag: "随手出片",
  },
];

export function ExhibitionDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCloudTourOpen, setIsCloudTourOpen] = useState(false);
  const cover = exhibitionPhotos.atriumStair;

  return (
    <main className="scenic-stage scenic-stage--refined demo-app-stage">
      <article className="scenic-detail scenic-detail--refined">
        <div className="scenic-cover__toolbar" aria-label="展馆快捷操作">
          <Link className="scenic-icon-button" to="/home" aria-label="返回游客端首页">
            <ArrowLeft size={21} strokeWidth={1.9} />
          </Link>
          <div className="scenic-cover__toolbar-group">
            <button
              className={isFavorite ? "scenic-icon-button is-active" : "scenic-icon-button"}
              type="button"
              aria-label={isFavorite ? "取消收藏" : "收藏展馆"}
              aria-pressed={isFavorite}
              onClick={() => setIsFavorite((favorite) => !favorite)}
            >
              <Heart size={21} strokeWidth={1.9} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button className="scenic-icon-button" type="button" aria-label="分享展馆">
              <Share2 size={21} strokeWidth={1.9} />
            </button>
          </div>
        </div>

        <div className="scenic-detail__scroll scenic-detail__scroll--refined" aria-label="展馆详情内容" tabIndex={0}>
          <section className="scenic-cover" aria-labelledby="exhibition-title">
            <img
              className="scenic-cover__photo"
              alt={cover.alt}
              src={cover.src}
              style={{ objectPosition: cover.focus }}
            />
            <span className="scenic-cover__scrim" aria-hidden="true" />

            <MobileStatusBar className="scenic-status" />
          </section>

          <section className="scenic-summary">
            <h1 id="exhibition-title">艺术展览馆</h1>
            <div className="scenic-summary__meta">
              <span className="scenic-summary__rating">
                <strong>4.8</strong>
                <span className="scenic-summary__stars" aria-label="评分 4.8 分">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={13} strokeWidth={1.6} fill="currentColor" aria-hidden="true" />
                  ))}
                </span>
              </span>
              <span><MapPin size={13} aria-hidden="true" /> 数字展馆 · 三层常设</span>
              <span><Clock3 size={13} aria-hidden="true" /> 建议观展 40–60 分钟</span>
            </div>
          </section>

          <section className="scenic-explore-rail" aria-label="展馆游览入口">
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

          <section className="scenic-editorial" aria-labelledby="exhibition-intro-title">
            <div className="scenic-editorial__mountains" aria-hidden="true" />
            <h2 id="exhibition-intro-title">循光而行，看画里的第二樂章</h2>
            <p>
              三层挑高的白墙展厅，天光顺着异形天窗落进中庭，沿回廊一路铺到画前。云游时可以停在任意一幅前把它看久一点——不必赶下一个展厅。
            </p>
          </section>

          <section className="scenic-content-section" aria-labelledby="exhibition-current-title">
            <div className="scenic-section-title">
              <h2 id="exhibition-current-title">当期展览</h2>
              <button type="button" aria-label="查看往期展览">
                往期展览 <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="exhibition-current">
              <div className="exhibition-current__head">
                <p className="exhibition-current__name">第貳樂章 · 舞曲</p>
                <span className="exhibition-current__badge">展出中</span>
              </div>
              <dl className="exhibition-current__facts">
                {exhibitionFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="scenic-content-section" aria-labelledby="exhibition-scenes-title">
            <div className="scenic-section-title">
              <h2 id="exhibition-scenes-title">云游秘境</h2>
              <button type="button" aria-label="查看全部云游秘境">
                查看全部 <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="scenic-spot-rail">
              <div className="scenic-rail__track">
                {[...exhibitionScenes, ...exhibitionScenes].map((scene, index) => {
                  const isClone = index >= exhibitionScenes.length;

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

          <section className="scenic-content-section scenic-reviews" aria-labelledby="exhibition-reviews-title">
            <div className="scenic-section-title">
              <h2 id="exhibition-reviews-title">观展点评</h2>
              <button type="button">
                全部 736 条 <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="scenic-review-summary">
              <div className="scenic-review-summary__score">
                <strong>4.8</strong>
                <span>
                  <span className="scenic-review-stars" aria-label="观展评分 4.8 分">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} size={13} strokeWidth={1.5} fill="currentColor" aria-hidden="true" />
                    ))}
                  </span>
                  <small>超出 92% 同类展馆</small>
                </span>
              </div>
              <div className="scenic-review-tags" aria-label="热门评价">
                <span>布展用心 412</span>
                <span>随手出片 285</span>
                <span>导览清晰 163</span>
              </div>
            </div>

            <div className="scenic-review-rail">
              <div className="scenic-rail__track">
                {[...exhibitionReviews, ...exhibitionReviews].map((review, index) => {
                  const isClone = index >= exhibitionReviews.length;

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
            <span>进馆云游看展</span>
            <ArrowRight size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </footer>

        {isCloudTourOpen && (
          <CloudTourViewer
            src={aholoViewerSrc}
            loadingText="正在进入数字展厅…"
            onClose={() => setIsCloudTourOpen(false)}
          />
        )}
      </article>
    </main>
  );
}
