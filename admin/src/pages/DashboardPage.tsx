import { Box, Clock3, Eye, Gamepad2, Palette, Plus, Sparkles, TrendingUp, Upload, Users } from "lucide-react";
import { Button, Card, StatusBadge } from "../components/ui";
import { useToast } from "../store/ToastProvider";
import { useNavigate } from "react-router-dom";

const metrics = [
  { label: "今日云游人次", value: "2,847", trend: "+12.5%", icon: Users },
  { label: "3D 景点资产", value: "36", trend: "+3", icon: Box },
  { label: "平均停留时长", value: "14:32", trend: "+8%", icon: Clock3 },
  { label: "活动参与率", value: "68%", trend: "+5%", icon: Sparkles },
];

const actions = [
  { label: "上传视频", caption: "新建3D资产", icon: Upload, to: "/assets/new" },
  { label: "节日装扮", caption: "配置景区视觉", icon: Palette, to: "/themes" },
  { label: "活动管理", caption: "创建景区活动", icon: Sparkles, to: "/operations/activities" },
  { label: "小游戏", caption: "配置互动游戏", icon: Gamepad2, to: "/operations/games" },
];

export function DashboardPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  return <div className="page dashboard-page">
    <section className="hero-heading"><p>杭州西湖景区</p><h1>运营工作台</h1><span>实时掌握数字景区运营状态</span></section>
    <section className="metric-grid">
      {metrics.map(({ label, value, trend, icon: Icon }) => <Card className="metric-card" key={label}>
        <div className="metric-top"><Icon size={20}/><StatusBadge>{trend}</StatusBadge></div>
        <strong>{value}</strong><span>{label}</span>
      </Card>)}
    </section>
    <section className="dashboard-overview-grid">
      <Card className="trend-panel"><div className="panel-heading"><div><p>近 7 日趋势</p><h2>云游访问趋势</h2></div><StatusBadge>较上周 +18.4%</StatusBadge></div><div className="trend-chart"><div className="chart-grid-lines"/><svg viewBox="0 0 700 170" preserveAspectRatio="none" aria-label="访问趋势折线图"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".22"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 145 C70 130 90 112 150 120 S250 90 300 100 S400 55 455 72 S565 32 610 46 S675 18 700 26 L700 170 L0 170Z"/><path className="line" d="M0 145 C70 130 90 112 150 120 S250 90 300 100 S400 55 455 72 S565 32 610 46 S675 18 700 26"/></svg><div className="chart-labels"><span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>今日</span></div></div></Card>
      <Card className="live-config-panel"><div className="panel-heading"><div><p>线上配置</p><h2>当前发布状态</h2></div><span className="live-dot">LIVE</span></div><div className="theme-preview"><Sparkles size={28}/><div><small>当前主题</small><strong>默认西湖</strong><span>清雅自然 · 雾绿水色</span></div></div><dl><div><dt>配置版本</dt><dd>v3</dd></div><div><dt>启用互动点</dt><dd>2 / 3</dd></div><div><dt>最近发布</dt><dd>今天 12:18</dd></div></dl><Button className="secondary-button full-button" onClick={() => navigate("/operations/publish")}>查看线上配置</Button></Card>
    </section>
    <div className="dashboard-lower-grid"><div>
    <section className="section-block"><div className="section-title"><h2>快捷操作</h2></div>
      <div className="quick-grid">{actions.map(({ label, caption, icon: Icon, to }) => <button key={label} className="quick-action" onClick={() => navigate(to)}>
        <span className="quick-icon"><Icon size={21}/></span><strong>{label}</strong><small>{caption}</small>
      </button>)}</div>
    </section>
    <section className="section-block"><div className="section-title"><h2>3D 景点资产</h2><Button className="text-button" onClick={() => showToast("新建资产流程将在下一阶段开放", "info")}><Plus size={16}/>新建</Button></div>
      <Card className="asset-placeholder"><div className="asset-visual"><Box size={25}/></div><div><strong>西湖数字资产库</strong><p>已预留资产列表与状态展示区域</p></div><StatusBadge tone="neutral">骨架版</StatusBadge></Card>
    </section>
    </div><Card className="popular-panel"><div className="panel-heading"><div><p>实时热度</p><h2>热门景点</h2></div><TrendingUp size={19}/></div>{[["雷峰夕照","1,284"],["三潭印月","856"],["断桥残雪","692"]].map(([name,views],index)=><div className="popular-row" key={name}><span>{index+1}</span><div><strong>{name}</strong><small><Eye size={12}/>{views} 次浏览</small></div><i style={{width:`${88-index*18}%`}}/></div>)}</Card></div>
  </div>;
}
