import {
  Bell,
  ChevronRight,
  CircleHelp,
  Footprints,
  Gem,
  Images,
  Map,
  MapPin,
  MessageCircleMore,
  QrCode,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { AppBottomNav } from "../../components/common/AppBottomNav";
import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import { westLakePortraits } from "../../lib/assets";

import "./styles.css";

const avatarPhoto = westLakePortraits.leifengSunset;

const overviewItems = [
  { value: "2,680", label: "旅行积分" },
  { value: "12", label: "到访景点" },
  { value: "4", label: "数字藏品" },
] as const;

const featureItems = [
  { label: "我的旅程", description: "回看云游记录", icon: Map, tone: "ink" },
  { label: "数字收藏", description: "珍藏旅途故事", icon: Gem, tone: "gold" },
  { label: "足迹地图", description: "点亮到访城市", icon: Footprints, tone: "mist" },
] as const;

const settingItems = [
  { label: "消息通知", icon: Bell, detail: "" },
  { label: "隐私与安全", icon: ShieldCheck, detail: "" },
  { label: "通用设置", icon: Settings, detail: "" },
  { label: "帮助与反馈", icon: CircleHelp, detail: "" },
  { label: "关于灵境奇旅", icon: Sparkles, detail: "v1.0 Demo" },
] as const;

export function ProfilePage() {
  return (
    <main className="app-home-stage demo-app-stage profile-stage">
      <section className="app-home profile-page" aria-label="我的">
        <header className="profile-hero">
          <MobileStatusBar className="profile-status" />

          <section className="profile-card" aria-label="用户资料">
            <div className="profile-avatar">
              <img
                src={avatarPhoto.src}
                alt={`头像：${avatarPhoto.alt}`}
                style={{ objectPosition: avatarPhoto.focus }}
              />
              <span className="profile-avatar__ring" aria-hidden="true" />
            </div>
            <div className="profile-card__identity">
              <h2>湖畔听风</h2>
              <p><MapPin size={13} /> 杭州 · 灵境旅人</p>
              <span>旅人号 20260814</span>
            </div>
            <div className="profile-hero__actions" aria-label="快捷操作">
              <button type="button" aria-label="扫码">
                <QrCode size={20} strokeWidth={1.8} />
              </button>
              <button className="profile-message-button" type="button" aria-label="打开消息">
                <MessageCircleMore size={20} strokeWidth={1.8} />
                <span aria-hidden="true" />
              </button>
            </div>
          </section>
        </header>

        <div className="profile-content">
          <section className="profile-overview" aria-label="旅程数据">
            {overviewItems.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </section>

          <section className="profile-section" aria-labelledby="profile-feature-title">
            <div className="profile-section__heading">
              <h2 id="profile-feature-title">我的旅途</h2>
              <button type="button">查看全部 <ChevronRight size={15} /></button>
            </div>
            <div className="profile-feature-grid">
              {featureItems.map(({ label, description, icon: Icon, tone }) => (
                <button className={`profile-feature profile-feature--${tone}`} key={label} type="button">
                  <span className="profile-feature__icon" aria-hidden="true">
                    <Icon size={29} strokeWidth={1.6} />
                  </span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="profile-memory" aria-label="本月旅途回忆">
            <div className="profile-memory__mark"><Images size={22} strokeWidth={1.6} /></div>
            <div>
              <p>西湖影集 · 本月</p>
              <strong>你在西湖留下了 8 个瞬间</strong>
            </div>
            <ChevronRight size={18} aria-hidden="true" />
          </section>

          <section className="profile-section" aria-labelledby="profile-service-title">
            <div className="profile-section__heading">
              <h2 id="profile-service-title">更多服务</h2>
            </div>
            <div className="profile-settings">
              {settingItems.map(({ label, icon: Icon, detail }) => (
                <button key={label} type="button">
                  <span className="profile-settings__icon"><Icon size={19} strokeWidth={1.75} /></span>
                  <span>{label}</span>
                  {detail && <small>{detail}</small>}
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <AppBottomNav activePath="/profile" />
      </section>
    </main>
  );
}
