import { useEffect, useState } from "react";
import type { Asset3D } from "@hackday/contracts";
import { Check, Circle, Cpu, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AssetHeader } from "../../components/assets/AssetHeader";
import { AssetStepper } from "../../components/assets/AssetStepper";
import { Button, Card, Loading } from "../../components/ui";
import type { ReconstructionJob } from "../../services/aholo";
import { assetService } from "../../services/assets/assetService";
import { useToast } from "../../store/ToastProvider";

const stages = [{ key: "uploaded", label: "视频上传完成", at: 0 }, { key: "analyzing", label: "空间特征分析", at: 20 }, { key: "geometry", label: "几何重建", at: 45 }, { key: "texture", label: "纹理生成", at: 70 }, { key: "optimizing", label: "模型优化", at: 90 }, { key: "completed", label: "完成", at: 100 }];

export function AssetBuildPage() {
  const { id = "" } = useParams(); const navigate = useNavigate(); const { showToast } = useToast();
  const [asset, setAsset] = useState<Asset3D>(); const [job, setJob] = useState<ReconstructionJob>(); const [error, setError] = useState("");
  useEffect(() => {
    let active = true; let timer: number | undefined;
    const poll = async () => { try { const result = await assetService.syncReconstruction(id); if (!active) return; setAsset(result.asset); setJob(result.job); if (result.job.progress < 100) timer = window.setTimeout(poll, 850); else showToast("AI 重建已完成"); } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "重建任务加载失败"); } };
    poll(); return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, [id, showToast]);
  if (error) return <div className="page detail-page"><AssetHeader title="AI 重建"/><Card className="error-card">{error}</Card></div>;
  if (!asset || !job) return <div className="page detail-page"><AssetHeader title="AI 重建"/><Loading label="正在读取重建任务"/></div>;
  return <div className="page detail-page"><AssetHeader title="AI 重建"/><AssetStepper current={2}/>
    <Card className="build-hero"><div className="ai-orbit"><Cpu size={34}/><span/></div><p>AHOLO AI RECONSTRUCTION</p><h2>{asset.name}</h2><strong>{job.progress}%</strong><div className="progress-track"><i style={{ width: `${job.progress}%` }}/></div><span>{job.message}</span></Card>
    <section className="build-stages">{stages.map((stage) => { const done = job.progress >= stage.at && stage.at !== 100 || job.progress === 100; const current = stage.key === job.stage; return <div className={`${done ? "done" : ""} ${current ? "current" : ""}`} key={stage.key}><span>{done ? <Check size={14}/> : <Circle size={10}/>}</span><div><strong>{stage.label}</strong>{current && <small>{stage.key === "completed" ? "处理完成" : "正在处理"}</small>}</div></div>; })}</section>
    {job.progress === 100 && <Button className="full-button sticky-action" onClick={() => navigate(`/assets/${id}/review`)}><Sparkles size={18}/>查看重建结果</Button>}
  </div>;
}
