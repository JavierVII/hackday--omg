export function Loading({ label = "加载中" }: { label?: string }) {
  return <div className="loading" role="status"><span className="spinner"/><span>{label}</span></div>;
}
