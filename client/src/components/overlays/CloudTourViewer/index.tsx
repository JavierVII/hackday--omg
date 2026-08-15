import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import "./styles.css";

/* Aholo 线上 3D 云游观看器：全屏沉浸式嵌入，右上角退出。
   景区详情页与展馆详情页共用同一个浮层，只换 src 与文案，避免两份实现各自漂移。 */

interface CloudTourViewerProps {
  /** 左上角浮签文案，同时作为浮层的无障碍名称 */
  readonly label?: string;
  /** 加载层提示，按场景换成「正在进入数字展厅…」这类具体说法 */
  readonly loadingText?: string;
  readonly onClose: () => void;
  /** Aholo Viewer 的嵌入地址 */
  readonly src: string;
}

/** 兜底时长：个别环境 iframe 不触发 onLoad，到点也撤掉加载层，避免一直挡住画面 */
const LOADING_FALLBACK_MS = 8000;

export function CloudTourViewer({
  label = "线上 3D 云游",
  loadingText = "正在进入 3D 场景…",
  onClose,
  src,
}: CloudTourViewerProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    const fallback = window.setTimeout(() => setIsReady(true), LOADING_FALLBACK_MS);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(fallback);
    };
  }, [onClose]);

  return createPortal(
    <div className="cloud-tour-viewer" role="dialog" aria-modal="true" aria-label={label}>
      <iframe
        id="viewer"
        title="Aholo 3D Viewer"
        width="100%"
        height="100%"
        allow="fullscreen; xr-spatial-tracking"
        allowFullScreen
        style={{ border: 0 }}
        src={src}
        onLoad={() => setIsReady(true)}
      />
      {!isReady && (
        <div className="cloud-tour-viewer__loading" role="status">
          <span aria-hidden="true" />
          <p>{loadingText}</p>
        </div>
      )}
      <span className="cloud-tour-viewer__label" aria-hidden="true">{label}</span>
      <button className="cloud-tour-viewer__close" type="button" aria-label="退出 3D 云游" onClick={onClose} autoFocus>
        <X size={20} strokeWidth={1.9} />
      </button>
    </div>,
    document.body,
  );
}
