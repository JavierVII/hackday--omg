import ImageTrail from "../../components/common/ImageTrail";

import "./styles.css";

// 占位风景图（后续可替换为 public/assets 下的西湖实景图）
const TRAIL_IMAGES = [
  "https://picsum.photos/id/1015/300/300",
  "https://picsum.photos/id/1016/300/300",
  "https://picsum.photos/id/1018/300/300",
  "https://picsum.photos/id/1019/300/300",
  "https://picsum.photos/id/1020/300/300",
  "https://picsum.photos/id/1021/300/300",
  "https://picsum.photos/id/1025/300/300",
  "https://picsum.photos/id/1026/300/300",
  "https://picsum.photos/id/1027/300/300",
  "https://picsum.photos/id/1028/300/300",
  "https://picsum.photos/id/1029/300/300",
  "https://picsum.photos/id/1030/300/300",
  "https://picsum.photos/id/1031/300/300",
  "https://picsum.photos/id/1035/300/300",
  "https://picsum.photos/id/1036/300/300",
  "https://picsum.photos/id/1039/300/300",
];

export function EntrancePage() {
  return (
    <main className="entrance-page">
      <div className="entrance-page__glow" aria-hidden="true" />

      {/* 全屏光影追随层：铺满页面，不拦截鼠标事件，位于内容之下 */}
      <div className="entrance-page__trail" aria-hidden="true">
        <ImageTrail items={TRAIL_IMAGES} variant={2} />
      </div>

      <span className="entrance-page__index" aria-hidden="true">
        01
      </span>

      <section className="entrance-page__content" aria-labelledby="entrance-title">
        <p className="entrance-page__eyebrow">灵境奇旅 · Web Demo</p>
        <h1 id="entrance-title" className="entrance-page__title">
          让每一处风景，
          <br />
          都成为故事。
        </h1>
        <p className="entrance-page__description">
          进入一个可游、可玩、可变化的数字景区。
          <br className="entrance-page__desktop-break" />
          游客在第三人称 3D 世界中探索，运营人员在管理台配置主题与互动。
        </p>

        <div className="entrance-page__actions" aria-label="入口选择">
          <button className="entrance-page__button entrance-page__button--primary" type="button">
            体验游客端
          </button>
          <button className="entrance-page__button entrance-page__button--secondary" type="button">
            进入管理端
          </button>
        </div>
      </section>

      <section className="entrance-preview" aria-label="产品界面预览区域">
        <div className="entrance-preview__ambient" aria-hidden="true" />
        <div className="entrance-preview__frame" aria-hidden="true">
          <div className="entrance-preview__speaker" />
          <div className="entrance-preview__screen" />
          <div className="entrance-preview__home-indicator" />
        </div>
        <p className="entrance-preview__hint">APP 预览 · 移动鼠标 · 光影追随</p>
      </section>

      <p className="entrance-page__footer">LINGJING JOURNEY · DIGITAL SCENIC EXPERIENCE</p>
    </main>
  );
}
