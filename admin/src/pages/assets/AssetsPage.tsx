import { useEffect, useState } from "react";
import type { Asset3D, Asset3DStatus } from "@hackday/contracts";
import { Box, ChevronRight, Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card, EmptyState, Loading, StatusBadge } from "../../components/ui";
import { assetService } from "../../services/assets/assetService";

const statusMap: Record<Asset3DStatus, { label: string; tone: "success" | "warning" | "neutral" }> = {
  draft: { label: "草稿", tone: "neutral" }, reconstructing: { label: "AI重建中", tone: "warning" }, pending_review: { label: "待审核", tone: "warning" }, published: { label: "已上线", tone: "success" }, failed: { label: "失败", tone: "neutral" },
};
const destination = (asset: Asset3D) => asset.status === "reconstructing" ? `/assets/${asset.id}/build` : asset.status === "pending_review" || asset.status === "published" ? `/assets/${asset.id}/review` : `/assets/${asset.id}`;

export function AssetsPage() {
  const navigate = useNavigate(); const [assets, setAssets] = useState<Asset3D[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { assetService.list().then(setAssets).finally(() => setLoading(false)); }, []);
  return <div className="page assets-page"><div className="page-heading-row"><div><p>杭州西湖景区</p><h1>3D景点资产</h1></div><Button onClick={() => navigate("/assets/new")}><Plus size={16}/>新建</Button></div>
    {loading ? <Loading label="加载资产"/> : assets.length === 0 ? <EmptyState title="暂无 3D 资产" description="创建首个西湖景点数字资产"/> : <div className="asset-list">
      {assets.map((asset) => <Card className="asset-card" key={asset.id} onClick={() => navigate(destination(asset))} role="button" tabIndex={0}>
        <div className="asset-thumb" style={{ "--thumb-accent": asset.coverImage?.url ?? "#398466" } as React.CSSProperties}><Box size={25}/><span>WEST LAKE</span></div>
        <div className="asset-card-body"><div><strong>{asset.name}</strong><StatusBadge tone={statusMap[asset.status].tone}>{statusMap[asset.status].label}</StatusBadge></div><p>{asset.scenicSpotName}</p><small><Eye size={12}/>{asset.viewCount.toLocaleString()} 次浏览 · {new Date(asset.updatedAt).toLocaleDateString("zh-CN")} 更新</small></div><ChevronRight size={17}/>
      </Card>)}
    </div>}
  </div>;
}
