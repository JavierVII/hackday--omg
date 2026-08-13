import { useRef, useState } from "react";
import { Camera, Check, FileVideo, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AssetHeader } from "../../components/assets/AssetHeader";
import { AssetStepper } from "../../components/assets/AssetStepper";
import { Button, Card } from "../../components/ui";
import { assetService } from "../../services/assets/assetService";
import { useToast } from "../../store/ToastProvider";

export function NewAssetPage() {
  const navigate = useNavigate(); const { showToast } = useToast(); const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState(""); const [name, setName] = useState(""); const [spot, setSpot] = useState(""); const [description, setDescription] = useState(""); const [submitting, setSubmitting] = useState(false);
  const chooseDemo = () => { setFileName("west-lake-scenic-video.mp4"); showToast("已选择模拟景区视频"); };
  const start = async () => {
    if (!fileName) return showToast("请先选择景区视频", "info"); if (!name.trim() || !spot.trim()) return showToast("请填写资产名称和所属景点", "info");
    setSubmitting(true); try { const asset = await assetService.create({ name: name.trim(), scenicSpotName: spot.trim(), description: description.trim() || `${name.trim()}西湖数字景点资产`, fileName }); await assetService.startReconstruction(asset.id); showToast("AI 重建任务已创建"); navigate(`/assets/${asset.id}/build`); } finally { setSubmitting(false); }
  };
  return <div className="page detail-page"><AssetHeader title="新建 3D 资产"/><AssetStepper current={1}/>
    <Card className={`upload-zone ${fileName ? "selected" : ""}`} onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept="video/*" hidden onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}/>
      <span className="upload-icon">{fileName ? <Check/> : <FileVideo/>}</span><h2>{fileName ? "视频已准备" : "上传景区视频"}</h2><p>{fileName || "环境景点拍摄一段视频，AI 将自动重建为高保真 3D 游览资产"}</p><Button type="button">选择视频文件</Button><small>支持 MP4 / MOV · Demo 阶段仅记录文件名</small>
    </Card>
    <div className="or-divider"><span>或</span></div><Button className="secondary-button full-button" onClick={chooseDemo}><Camera size={18}/>现场拍摄视频（模拟）</Button>
    <div className="form-section"><label>资产名称<input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：雷峰塔数字景观"/></label><label>所属景点<input value={spot} onChange={(e) => setSpot(e.target.value)} placeholder="例如：雷峰夕照"/></label><label>资产描述<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述该景点及展示重点" rows={3}/></label></div>
    <section className="shoot-guide"><h2>拍摄指南（效果最佳）</h2>{["环境景点缓慢移动，保持主体在画面中央", "覆盖正面、侧面、背面等不同角度", "光线充足，避免逆光和强阴影"].map((text) => <p key={text}><Check size={14}/>{text}</p>)}</section>
    <Button className="full-button sticky-action" disabled={submitting} onClick={start}>{submitting ? <><UploadCloud size={18}/>正在创建…</> : "开始 AI 重建"}</Button>
  </div>;
}
