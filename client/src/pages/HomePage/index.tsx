import "./styles.css";

const discoverySections = [
  {
    label: "推荐",
    icon: "↗",
    items: ["热门去处", "新展速递", "附近好玩"],
    tone: "jade",
  },
  {
    label: "专题",
    icon: "▦",
    items: ["文明探源", "艺术流派", "亲子研学"],
    tone: "amber",
  },
  {
    label: "社区",
    icon: "◎",
    items: ["精选个展", "达人游记", "测评分享"],
    tone: "rose",
  },
] as const;

const bottomNavigation = [
  { label: "个人空间", icon: "◇", active: false },
  { label: "首页", icon: "⌂", active: true },
  { label: "我的", icon: "○", active: false },
] as const;

export function HomePage() {
  return (
    <main className="app-home-stage">
      <section className="app-home" aria-label="灵境奇旅游客端首页">
        <header className="app-home__header">
          <div className="app-status" aria-label="当前时间 9 点 24 分">
            <time className="app-status__time">9:24</time>
            <div className="app-status__indicators" aria-hidden="true">
              <span className="app-status__signal">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="app-status__wifi">◔</span>
              <span className="app-status__battery" />
            </div>
          </div>

          <div className="app-brand-row">
            <p className="app-brand">灵境奇旅</p>
            <p className="app-brand__slogan">让每一处风景，都成为故事。</p>
          </div>

          <p className="app-location">
            <span className="app-location__pin" aria-hidden="true">⌖</span>
            杭州
            <span className="app-location__poem">湖光山色，醉美杭城。</span>
          </p>

          <label className="app-search">
            <span className="app-search__icon" aria-hidden="true" />
            <span className="sr-only">搜索景区、博物馆、展览或路线</span>
            <input type="search" placeholder="搜索景区、博物馆、展览、路线…" />
            <kbd>⌘ K</kbd>
          </label>
        </header>

        <div className="app-home__content">
          <section className="cloud-tour-card" aria-labelledby="cloud-tour-title">
            <div className="cloud-tour-card__copy">
              <p className="cloud-tour-card__eyebrow">今日云游</p>
              <h1 id="cloud-tour-title">水光山色，遇见西湖</h1>
              <p>走进可探索、可互动的数字风景，在故事里重新认识一座城。</p>
              <button type="button">立即云游 <span aria-hidden="true">→</span></button>
            </div>
            <div className="cloud-tour-card__art" aria-hidden="true">
              <span className="cloud-tour-card__sun" />
              <span className="cloud-tour-card__pagoda">塔</span>
              <span className="cloud-tour-card__hill cloud-tour-card__hill--back" />
              <span className="cloud-tour-card__hill cloud-tour-card__hill--front" />
              <span className="cloud-tour-card__water" />
            </div>
          </section>

          <section className="discovery-grid" aria-label="探索分类">
            {discoverySections.map((section) => (
              <button
                className={`discovery-card discovery-card--${section.tone}`}
                key={section.label}
                type="button"
              >
                <span className="discovery-card__heading">
                  <strong>{section.label}</strong>
                  <span aria-hidden="true">{section.icon}</span>
                </span>
                <span className="discovery-card__items">
                  {section.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </span>
                <span className="discovery-card__more">探索更多</span>
              </button>
            ))}
          </section>

          <button className="festival-banner" type="button">
            <span className="festival-banner__edition">夏日限定</span>
            <span className="festival-banner__copy">
              <strong>寻踪山水间</strong>
              <small>完成城市漫游，解锁限定数字纪念卡</small>
            </span>
            <span className="festival-banner__stamp" aria-hidden="true">游</span>
          </button>
        </div>

        <nav className="app-bottom-nav" aria-label="游客端主导航">
          {bottomNavigation.map((item) => (
            <button
              className={item.active ? "app-bottom-nav__item is-active" : "app-bottom-nav__item"}
              key={item.label}
              type="button"
              aria-current={item.active ? "page" : undefined}
            >
              <span className="app-bottom-nav__icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}
