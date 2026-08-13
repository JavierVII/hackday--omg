import { useEffect, useState } from "react";
import type { Asset3D } from "@hackday/contracts";
import { Box } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AssetHeader } from "../../components/assets/AssetHeader";
import { Button, Card, Loading, StatusBadge } from "../../components/ui";
import { assetService } from "../../services/assets/assetService";

export function AssetDetailPage() {
  const { id = "" } = useParams(); const navigate = useNavigate(); const [asset, setAsset] = useState<Asset3D>();
  useEffect(() => { assetService.get(id).then(setAsset).catch(() => navigate("/assets", { replace: true })); }, [id, navigate]);
  if (!asset) return <div className="page detail-page"><AssetHeader title="资产详情"/><Loading/></div>;
  return <div className="page detail-page"><AssetHeader title="资产详情"/><Card className="simple-detail"><div className="asset-thumb large" style={{ "--thumb-accent": asset.coverImage?.url ?? "#398466" } as React.CSSProperties}><BoxIcon/></div><h2>{asset.name}</h2><StatusBadge tone={asset.status === "failed" ? "neutral" : "warning"}>{asset.status === "failed" ? "重建失败" : "草稿"}</StatusBadge><p>{asset.description}</p><Button onClick={() => navigate("/assets/new")}>{asset.status === "failed" ? "重新创建资产" : "继续完善资产"}</Button></Card></div>;
}
function BoxIcon() { return <Box size={42}/>; }
