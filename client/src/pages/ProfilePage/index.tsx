import {
  Bell,
  ChevronRight,
  CircleHelp,
  Footprints,
  Gem,
  Heart,
  Home,
  Map,
  MapPin,
  MessageCircleMore,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Link } from "react-router";

import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import { westLakePortraits } from "../../lib/assets";

import "./styles.css";

const avatarPhoto = westLakePortraits.heartMirrorGate;

const overviewItems = [
  { value: "3", label: "云游旅程" },
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

const bottomNavigation = [
  { label: "个人空间", icon: Sparkles, to: "/space" },
  { label: "首页", icon: Home, to: "/home" },
  { label: "我的", icon: User, to: "/profile" },
] as const;

export function ProfilePage() {
  return (
    <main className="app-home-stage demo-app-stage profile-stage">
      <section className="app-home profile-page" aria-label="我的">
        <header className="profile-hero">
          <MobileStatusBar className="profile-status" />

          <div className="profile-hero__heading">
            <div>
              <p>我的</p>
              <h1>旅途有迹，山水有情</h1>
            </div>
            <button type="button" aria-label="打开消息">
              <MessageCircleMore size={20} strokeWidth={1.8} />
              <span aria-hidden="true" />
            </button>
          </div>

          <section className="profile-card" aria-label="用户资料">
            <div className="profile-avatar">
              <img
                src={avatarPhoto.src}
                alt="头像：我心相印亭的月洞门"
                style={{ objectPosition: avatarPhoto.focus }}
              />
              <span className="profile-avatar__ring" aria-hidden="true" />
            </div>
            <div className="profile-card__identity">
              <h2>西湖漫游者</h2>
              <p><MapPin size={13} /> 杭州 · 灵境旅人</p>
              <span>旅人号 20260814</span>
            </div>
            <button className="profile-card__edit" type="button">编辑资料</button>
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
                  <span className="profile-feature__icon"><Icon size={21} strokeWidth={1.8} /></span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="profile-memory" aria-label="本月旅途回忆">
            <div className="profile-memory__mark"><Heart size={20} fill="currentColor" /></div>
            <div>
              <p>本月旅途回忆</p>
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

        <nav className="app-bottom-nav" aria-label="游客端主导航">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === "/profile";

            return (
              <Link
                className={isActive ? "app-bottom-nav__item is-active" : "app-bottom-nav__item"}
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="app-bottom-nav__icon" aria-hidden="true">
                  <Icon size={21} strokeWidth={isActive ? 2.1 : 1.8} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </section>
    </main>
  );
}
