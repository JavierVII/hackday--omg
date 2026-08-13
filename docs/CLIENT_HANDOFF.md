# Client 开发交接：杭州西湖数字景区

## 1. 项目边界与目录

```text
admin/       景区运营管理端，Client 禁止依赖或修改
backend/     Demo 公共配置服务，Route → Service → Repository
contracts/   Admin、Backend、Client 唯一共享的数据协议与固定 ID
docs/        协作说明
client/      Client 队友自己的应用目录（当前仓库尚未创建）
```

Client 可以依赖 `@hackday/contracts`、调用 `GET /api/client/config`、使用自己目录中的组件和状态。Client 禁止 import 或修改 `admin/` 的页面、组件、store、service、CSS；禁止读取 `/api/admin/*`；禁止把用户进度写入公共配置。

## 2. 公共配置协议

`ScenicExperienceConfig` 是 Client 可见的完整公共景区快照：

```ts
interface ScenicExperienceConfig {
  scenicArea: ScenicArea
  scenes: Scene[]
  themes: Theme[]
  spots: Spot[]
  interactionPoints: InteractionPoint[]
  miniGames: MiniGame[]
  rewards: Reward[]
  activeThemeId: string
  version: number
  updatedAt: string
}
```

核心实体含义：`ScenicArea` 是景区；`Scene` 是可进入的 3D 场景；`Theme` 是跨场景视觉配置；`Spot` 是景点；`InteractionPoint` 是故事、小游戏或传送热点；`MiniGame` 是轻量玩法配置；`Reward` 是可解锁奖励。

## 3. 固定 ID

所有 ID 由 `contracts/src/index.ts` 中的 `WEST_LAKE_IDS` 统一提供，不允许 Client 重新命名。

| 类型 | 名称 | ID |
|---|---|---|
| ScenicArea | 杭州西湖 | `hangzhou-west-lake` |
| Scene | 断桥残雪 | `scene-broken-bridge` |
| Scene | 雷峰塔 | `scene-leifeng-pagoda` |
| Scene | 第三场景预留 | `scene-west-lake-reserved` |
| Theme | 默认西湖 | `theme-default-west-lake` |
| Theme | 中秋雅集 | `theme-mid-autumn-gathering` |
| Theme | 国庆主题 | `theme-national-day` |
| Spot | 断桥 | `spot-broken-bridge` |
| Spot | 雷峰塔 | `spot-leifeng-pagoda` |
| Interaction | 断桥故事 | `interaction-broken-bridge-story` |
| Interaction | 中秋猜灯谜 | `interaction-mid-autumn-riddle` |
| Interaction | 场景传送 | `interaction-scene-teleport` |
| MiniGame | 猜灯谜 | `minigame-lantern-riddle` |
| Reward | 月映断桥 | `reward-moonlit-broken-bridge` |

## 4. 获取配置与轮询

启动 Backend 后请求：

```ts
const response = await fetch("http://127.0.0.1:8787/api/client/config")
const config: ScenicExperienceConfig = await response.json()
```

Client 约每 2 秒轮询一次。只在远端 `version !== current.version` 时替换公共配置，避免重复渲染。不要轮询 Admin API。

```ts
let config: ScenicExperienceConfig
let userProgress: UserProgress = loadUserProgress()

async function loadConfig() {
  config = await fetch("http://127.0.0.1:8787/api/client/config").then(r => r.json())
  applyTheme(config)
  renderInteractionPoints(config)
}

async function pollVersion() {
  const next = await fetch("http://127.0.0.1:8787/api/client/config").then(r => r.json())
  if (next.version !== config.version) {
    config = next
    applyTheme(config)
    renderInteractionPoints(config)
  }
  setTimeout(pollVersion, 2000)
}

function applyTheme(config: ScenicExperienceConfig) {
  const theme = config.themes.find(item => item.id === config.activeThemeId)
  sceneRenderer.applyTheme(theme)
}

function renderInteractionPoints(config: ScenicExperienceConfig) {
  hotspotLayer.render(config.interactionPoints.filter(point => point.enabled))
}
```

联动示例：Admin 把 Draft 从 `theme-default-west-lake` 改为 `theme-mid-autumn-gathering` 时，Client 不变化；Admin 发布后 version 增加，Client 下一次轮询应用中秋雅集。互动点同理：`interaction-mid-autumn-riddle.enabled=false` 只有发布后才从 Client 热点层消失。

## 5. UserProgress 必须独立

`UserProgress` 只包含游客自己的 `completedInteractionIds` 和 `unlockedRewardIds`，应由 Client 独立持久化。角色位置、任务状态和奖励也属于用户状态。公共配置更新时只能替换 `ScenicExperienceConfig`，不得重建或清空用户 store，否则主题发布会错误重置游客体验。

## 6. 启动命令

PowerShell 执行策略可能拦截 `npm.ps1`，可使用：

```powershell
cmd /c npm install
cmd /c npm run backend:dev
cmd /c npm run dev
```

Backend 默认 `http://127.0.0.1:8787`，Admin 默认 Vite 端口；Admin 环境变量示例位于 `admin/.env.example`。

## 7. Client 开发建议与尚未实现

建议 Client 在自己的目录中封装 `ClientConfigService`，用 Context 或轻量 store 分别维护公共 config 和 user progress；启动时先获取一次配置，再开始 2 秒轮询；根据 ID 建立渲染适配层，不把后端字段写死进组件。

当前尚未实现：Client 应用、真实 3D 场景、正式小游戏、用户账号、云端数据库、WebSocket、真实 aHolo、生产鉴权和部署。Backend 是 HackDay 本地 Demo 服务，不应直接用于生产。
