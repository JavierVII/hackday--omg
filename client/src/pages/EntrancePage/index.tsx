import { Link } from "react-router";

import "./styles.css";

export function EntrancePage() {
  return (
    <main className="entrance-page">
      <div className="entrance-page__glow" aria-hidden="true" />

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
          <Link className="entrance-page__button entrance-page__button--primary" to="/home">
            体验游客端
          </Link>
          <button className="entrance-page__button entrance-page__button--secondary" type="button">
            进入管理端
          </button>
        </div>
      </section>

      <section className="entrance-preview" aria-label="产品界面预览占位区域">
        <div className="entrance-preview__ambient" aria-hidden="true" />
        <div className="entrance-preview__frame" aria-hidden="true">
          <div className="entrance-preview__speaker" />
          <div className="entrance-preview__screen" />
          <div className="entrance-preview__home-indicator" />
        </div>
        <p className="entrance-preview__hint">APP 预览区域</p>
      </section>

      <p className="entrance-page__footer">LINGJING JOURNEY · DIGITAL SCENIC EXPERIENCE</p>
    </main>
  );
}
