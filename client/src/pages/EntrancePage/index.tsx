import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { Link } from "react-router";

import { useUiStore } from "../../app/stores/uiStore";
import ImageTrail from "../../components/common/ImageTrail";
import { assetUrl } from "../../lib/assets";
import { prefersReducedMotion } from "../../lib/motion";

import "./styles.css";

const ASSET_DIR = assetUrl("/assets/west_lake");

/** 西湖实景照片。新增图片只需在此追加文件名，其余无需改动。 */
const SCENERY_FILES = [
  "eefaf2794081f3ac82d6b58b3059865a_compress.jpg",
  "027c6e211513a9b85898bada34202b92_compress.jpg",
  "c9384283c5449a3654d3c6fc9eaffc74_compress.jpg",
  "0e3c6db1fe5a2de1bb1d48c2a5e28699_compress.jpg",
  "90dfef6d66df656c9b842b5ae4a88ac6_compress.jpg",
  "bcf6e16cbbb081d2a7719468df8559ea_compress.jpg",
  "c05ace7a3f127c15ea91cfcc7e551a01_compress.jpg",
  "e4b3db958e0ed623996899d4d7a52249_compress.jpg",
  "ec684778c10e9c6dcec5c248d738d611_compress.jpg",
  "f38de54da598dd34da3feb39593e1c20_compress.jpg",
  "f5343457c99139dc1e5ea90be17cdd36_compress.jpg",
];

const SCENERY = SCENERY_FILES.map((file) => `${ASSET_DIR}/${file}`);

/** 手机屏幕主图。文件名含中文，需编码后再交给浏览器。 */
const SCREEN_IMAGE = encodeURI(`${ASSET_DIR}/屏幕占位.jpg`);

/** 圆洞门取景图：本身就是一张月洞门实景，与页面母题呼应。 */
const GATE_IMAGE = SCENERY[0];

/** 并列缩略图只取色调一致的暖调湖景，避免与深绿古建混搭。 */
const THUMBNAILS = SCENERY.slice(0, 3);

const TITLE_CHARS = ["灵", "境", "奇", "旅"];

/**
 * 把指针位置写成 --px / --py（范围约 -0.5 ~ 0.5），交给 CSS 做视差。
 * 用 CSS 变量而非 React state，避免每帧触发重渲染。
 */
function usePointerParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element || prefersReducedMotion()) {
      return;
    }

    let frame = 0;

    const handleMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty("--px", (event.clientX / window.innerWidth - 0.5).toFixed(4));
        element.style.setProperty("--py", (event.clientY / window.innerHeight - 0.5).toFixed(4));
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}

/**
 * 圆心贴到视口边缘时，「入画」二字与月轮会被裁掉。
 * 收进中间 60% 的范围里，取景才稳。
 */
function clampToSafeBand(value: number, size: number) {
  return Math.min(Math.max(value, size * 0.2), size * 0.8);
}

export function EntrancePage() {
  const rootRef = usePointerParallax<HTMLElement>();
  const deviceRef = useRef<HTMLDivElement>(null);
  const closeGate = useUiStore((state) => state.closeGate);
  const departing = useUiStore((state) => state.gate.phase === "closing");

  /**
   * 「体验游客端」不直接跳转：先让墨色从手机屏幕中心合拢（穿门入境过场），
   * 再由 GateTransition 切到 /home，避免一眨眼就换了个界面的生硬感。
   *
   * 新标签页 / 减弱动效两种情况交还给 <Link> 的默认行为。
   */
  const handleEnterClient = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    if (prefersReducedMotion()) {
      return;
    }

    event.preventDefault();

    const rect = deviceRef.current?.getBoundingClientRect();

    closeGate(
      "/home",
      rect === undefined
        ? null
        : {
            x: clampToSafeBand(rect.left + rect.width / 2, window.innerWidth),
            y: clampToSafeBand(rect.top + rect.height / 2, window.innerHeight),
          },
    );
  };

  return (
    <main className={`entrance${departing ? " is-departing" : ""}`} ref={rootRef}>
      {/* —— 背景层：晚霞大气 → 远山 → 颗粒 → 暗角 —— */}
      <div className="entrance__sky" aria-hidden="true" />

      <svg className="entrance__ridge" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        <path
          className="entrance__ridge-far"
          d="M0 148 116 118 232 140 356 92 470 130 586 104 712 138 840 96 968 132 1092 108 1216 142 1330 116 1440 146 1440 220 0 220Z"
        />
        <path
          className="entrance__ridge-near"
          d="M0 182 96 164 214 186 330 152 452 180 570 158 700 188 826 160 950 184 1078 162 1200 190 1320 168 1440 186 1440 220 0 220Z"
        />
      </svg>

      <div className="entrance__grain" aria-hidden="true" />
      <div className="entrance__vignette" aria-hidden="true" />

      {/* 全屏光影追随层：铺满页面，不拦截鼠标事件，位于内容之下 */}
      <div className="entrance__trail" aria-hidden="true">
        <ImageTrail items={SCENERY} variant={2} />
      </div>

      <section className="entrance__intro" aria-labelledby="entrance-title">
        <p className="entrance__eyebrow">
          <span className="entrance__eyebrow-rule" aria-hidden="true" />
          数字景区 · Web Demo
        </p>

        <h1 id="entrance-title" className="entrance__title">
          <span className="entrance__title-mask">
            {TITLE_CHARS.map((char, index) => (
              <span
                key={char}
                className="entrance__title-char"
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>

        <div className="entrance__byline">
          <span className="entrance__seal" aria-hidden="true">
            灵境
          </span>
          <span className="entrance__latin">LINGJING JOURNEY</span>
          <span className="entrance__byline-rule" aria-hidden="true" />
        </div>

        <p className="entrance__lede">
          让每一处风景，都成为故事。
          <br className="entrance__break" />
          进入一个可游、可玩、可变化的数字景区，游客在第三人称 3D 世界中探索。
        </p>

        <div className="entrance__actions" aria-label="入口选择">
          <Link
            className="entrance__button entrance__button--primary"
            onClick={handleEnterClient}
            to="/home"
          >
            体验游客端
            <span className="entrance__button-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          {/* 管理端单独静态构建进 dist/admin/，用 base-aware 路径保证 GitHub Pages 子路径下也能直达 */}
          <a
            className="entrance__button entrance__button--secondary"
            href={assetUrl("/admin/")}
            aria-label="进入管理端"
          >
            进入管理端
          </a>
        </div>

        <div className="entrance__scenes">
          <ul className="entrance__thumbs">
            {THUMBNAILS.map((source) => (
              <li className="entrance__thumb" key={source}>
                <img src={source} alt="" loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
          <span className="entrance__scenes-label">实景取景 · 西湖</span>
        </div>
      </section>

      <section className="entrance__stage" aria-label="产品界面预览">
        {/* 月洞门：呼应实景中的圆洞门取景，作为手机的背景开口 */}
        <div className="entrance__gate" aria-hidden="true">
          <div className="entrance__gate-photo" style={{ backgroundImage: `url("${GATE_IMAGE}")` }} />
          <div className="entrance__gate-ring" />
        </div>

        <div className="entrance__device-wrap">
          <div className="entrance__device" ref={deviceRef}>
            <div className="entrance__device-screen">
              <img className="entrance__screen" src={SCREEN_IMAGE} alt="游客端界面预览" />
              <div className="entrance__screen-scrim" aria-hidden="true" />
            </div>
            <div className="entrance__device-island" aria-hidden="true" />
            <div className="entrance__device-glare" aria-hidden="true" />
          </div>
        </div>

        <p className="entrance__hint">移动鼠标 · 光影随行</p>
      </section>

      <p className="entrance__footer">LINGJING JOURNEY · DIGITAL SCENIC EXPERIENCE</p>
    </main>
  );
}
