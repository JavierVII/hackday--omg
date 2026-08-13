const steps = ["上传视频", "AI 重建", "审核上线"];
export function AssetStepper({ current }: { current: 1 | 2 | 3 }) {
  return <div className="asset-stepper">{steps.map((label, index) => { const step = index + 1; const active = step <= current; return <div className={`step ${active ? "active" : ""}`} key={label}><div className="step-track"><span>{step}</span>{step < 3 && <i/>}</div><small>{label}</small></div>; })}</div>;
}
