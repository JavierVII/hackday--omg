import { Box, Clock3, Gamepad2, Palette, Plus, Sparkles, Upload, Users } from "lucide-react";
import { Button, Card, StatusBadge } from "../components/ui";
import { useToast } from "../store/ToastProvider";

const metrics = [
  { label: "今日云游人次", value: "2,847", trend: "+12.5%", icon: Users },
  { label: "3D 景点资产", value: "36", trend: "+3", icon: Box },
  { label: "平均停留时长", value: "14:32", trend: "+8%", icon: Clock3 },
  { label: "活动参与率", value: "68%", trend: "+5%", icon: Sparkles },
];

const actions = [
  { label: "上传视频", caption: "新建3D资产", icon: Upload },
  { label: "节日装扮", caption: "配置景区视觉", icon: Palette },
  { label: "活动管理", caption: "创建景区活动", icon: Sparkles },
  { label: "小游戏", caption: "配置互动游戏", icon: Gamepad2 },
];

export function DashboardPage() {
  const { showToast } = useToast();
  return <div className="page dashboard-page">
    <section className="hero-heading"><p>杭州西湖景区</p><h1>运营工作台</h1><span>实时掌握数字景区运营状态</span></section>
    <section className="metric-grid">
      {metrics.map(({ label, value, trend, icon: Icon }) => <Card className="metric-card" key={label}>
        <div className="metric-top"><Icon size={20}/><StatusBadge>{trend}</StatusBadge></div>
        <strong>{value}</strong><span>{label}</span>
      </Card>)}
    </section>
    <section className="section-block"><div className="section-title"><h2>快捷操作</h2></div>
      <div className="quick-grid">{actions.map(({ label, caption, icon: Icon }) => <button key={label} className="quick-action" onClick={() => showToast(`${label}功能入口已就绪`, "info")}>
        <span className="quick-icon"><Icon size={21}/></span><strong>{label}</strong><small>{caption}</small>
      </button>)}</div>
    </section>
    <section className="section-block"><div className="section-title"><h2>3D 景点资产</h2><Button className="text-button" onClick={() => showToast("新建资产流程将在下一阶段开放", "info")}><Plus size={16}/>新建</Button></div>
      <Card className="asset-placeholder"><div className="asset-visual"><Box size={25}/></div><div><strong>西湖数字资产库</strong><p>已预留资产列表与状态展示区域</p></div><StatusBadge tone="neutral">骨架版</StatusBadge></Card>
    </section>
  </div>;
}
