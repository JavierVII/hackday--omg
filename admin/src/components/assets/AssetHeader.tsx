import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
export function AssetHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  const navigate = useNavigate();
  return <header className="asset-header"><button onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={20}/></button><h1>{title}</h1><div>{action}</div></header>;
}
