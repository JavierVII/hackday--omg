# Client 开发交接：杭州西湖数字景区

## 1. 项目边界与目录# 灵境奇旅｜MVP 开发需求文档

可参考原型入口：[81998c9c77044812965d3e791c79664a.bj5.agentos-app.net](https://81998c9c77044812965d3e791c79664a.bj5.agentos-app.net)

## 1. 一句话目标

完成一个可在 3–5 分钟内演示的数字景区 Demo：游客在第三人称 3D 西湖中探索、切换中秋主题、完成猜灯谜并获得纪念卡；管理人员发布主题或互动点配置后，游客端展示同步变化。

## 2. 产品形态与本次实现

| 项目       | 产品真实形态              | 比赛 MVP 实现                             |
| ---------- | ------------------------- | ----------------------------------------- |
| 游客端     | 移动 App                  | Web 中的手机尺寸页面                      |
| 管理端     | 桌面 Web 平台             | Web 桌面页面                              |
| 角色移动   | 游客定位与真实步行驱动    | 预设定位轨迹模拟                          |
| 3D 场景    | Aholo 生成/承载的数字景区 | 至少接入 1 个核心场景，其余场景允许轻量化 |
| 数据与发布 | 后端配置服务              | 本地 JSON/共享前端状态                    |

游客端默认不展示[移动轮盘]。轮盘或键盘只可作为定位失败、调试或备用演示手段。

## 3. P0 执行口径

- 产品：灵境奇旅；
- 景区：西湖景区；故宫博物馆（界面展示）、黄龙山景区（界面展示）
- 场景：P0 至少 2 个，开发占位使用 `断桥残雪`、`雷峰塔`；后续可替换具体景点，第三个场景配置预留；
- 主题：默认西湖、中秋雅集；国庆主题；
- 小游戏：猜灯谜；简单拼图作为后续可替换玩法；
- 奖励：开发占位使用中秋限定纪念卡 `月映断桥`，后续只替换内容资产、不修改流程；（模型生成或者拍摄）
- 助手：一个场景内小型搭档角色，负责跟随、领路和提示。（支持简单选择，模型可以快速生成）

## 4. 必须走通的演示主线

1. 从 Web Demo 入口进入游客端；
2. 查看西湖介绍并进入 3D 场景；
3. 加载场景和模拟定位，显示游客角色与助手；
4. 播放定位轨迹，角色与助手在第三人称视角中移动；
5. 走近景点热点，打开景点故事；
6. 切换中秋主题，当前位置和任务进度不重置；
7. 进入灯谜互动点，答题成功并获得纪念卡；
8. 进入管理端，修改主题或互动点并发布；
9. 返回游客端，看到发布后的配置结果。

## 5. 游客端需求

### 5.1 页面与模块

| 页面/模块 | P0 必须实现                                              | 核心结果                   |
| --------- | -------------------------------------------------------- | -------------------------- |
| 景区详情  | 西湖介绍、场景/主题/互动提示、进入按钮                   | 进入场景加载页             |
| 场景加载  | 场景名、加载进度、定位状态、失败重试                     | 完成场景与角色初始化       |
| 3D 探索   | 第三人称相机、游客角色、助手、罗盘、任务、热点、主题入口 | 定位轨迹可驱动角色移动     |
| 景点故事  | 名称、简介、图片、关闭                                   | 关闭后回到原位置           |
| 主题切换  | 默认/中秋预览、应用、加载及成功反馈                      | 场景氛围明显变化且状态保留 |
| 猜灯谜    | 题目、选项、提交、失败重试、成功                         | 进入奖励结果               |
| 奖励结果  | 纪念卡、成功文案、继续游览                               | 奖励写入游客进度           |

### 5.2 第三人称探索规则

- 镜头位于游客角色后上方，游客角色保持在画面中下部；
- 助手默认位于游客侧前方，能跟随、短距离领路并面向目标；
- 角色和助手不能穿过主要建筑、水面或场景边界；
- 手机非控件区域滑动观察镜头；桌面 Demo 支持鼠标观察；
- Web Demo 提供仅供演示者使用的轨迹“播放、暂停、重置”；
- 定位状态至少包括：校准中、同步中、精度不足、未授权、模拟定位。

### 5.3 热点规则

热点支持三类：景点、游戏、场景传送。

| 状态       | 表现                         |
| ---------- | ---------------------------- |
| 远距离     | 不显示或仅显示弱方向提示     |
| 感知范围   | 显示名称和距离               |
| 可交互范围 | 点选后高亮，并显示主操作按钮 |

主操作文案分别为：`了解这里`、`开始挑战`、`进入场景`。同一时刻只允许一个热点成为主焦点。

## 6. 管理端需求

| 页面/模块  | P0 必须实现                                     | 核心操作                   |
| ---------- | ----------------------------------------------- | -------------------------- |
| 工作台     | 当前景区、主题、场景和互动点概览                | 进入配置模块               |
| 景区资产   | 场景、景点和主题资产列表                        | 查看资产与启用状态         |
| 主题配置   | 默认/中秋主题卡、游客端预览(游客端可以进行选择) | 选择主题，形成未发布修改   |
| 互动点配置 | 场景、热点类型、游戏、奖励、启用状态            | 启用/停用互动点            |
| 预览并发布 | 修改摘要、游客端预览、发布确认                  | 更新共享配置并显示成功结果 |

管理端无需实现真实登录、权限、文件上传和复杂编辑器。保存、发布及版本号均可由本地状态模拟，但必须有“已保存、未发布、发布成功”三种清晰状态。

## 7. 双端联动与最小数据

游客端与管理端必须读取同一份配置，不允许做两套互不关联的静态页面。

```text
ScenicArea: id, name, activeThemeId
Scene: id, scenicAreaId, name, sceneAsset, spawnPoint
Theme: id, name, thumbnail, environmentConfig
Spot: id, sceneId, name, description, position
InteractionPoint: id, sceneId, type, position, gameId, enabled
MiniGame: id, type, title, content, successRule, rewardId
Reward: id, type, name, image, description
UserProgress: completedInteractionIds, unlockedRewardIds
```

必须联动的字段：

- `activeThemeId`：管理端发布后改变游客端当前主题；
- `InteractionPoint.enabled`：管理端启停后决定游客端热点是否出现；
- `UserProgress`：小游戏完成后写入任务和奖励状态；
- 主题切换与发布不得清空游客位置、任务和奖励。

## 8. Aholo、前端与 Mock 边界

### Aholo/3D 层

- 场景加载与渲染；
- 第三人称相机、游客角色和助手角色；
- 场景坐标、碰撞边界、出生点和热点位置；
- 主题环境或场景版本切换；
- 向业务层回传加载、坐标、朝向和热点状态。

### 前端业务层

- 页面导航、HUD、浮层、按钮和状态反馈；
- 定位 Provider、坐标映射及模拟轨迹控制；
- 景点、游戏、奖励和游客进度；
- 管理端配置、共享状态及发布联动；
- 错误提示与 Demo 降级入口。

### 允许 Mock（虚假数据）

- Web Demo 的游客定位轨迹；
- 景区内容、账号、游客进度、管理端保存与发布；
- 语音讲解、版本号和统计数字；
- 非核心的第二/第三场景表现。

## 9. 不开发范围

真实账号与权限、支付票务、电商、社交评论、AI 问答、完整 AR 导航、高精度室内定位、真实数据库、复杂审核、3D 扫描生产工具。

## 10. 异常与降级

| 异常                | 必须反馈           | Demo 降级                    |
| ------------------- | ------------------ | ---------------------------- |
| 场景加载失败        | 重试、返回         | 静态场景或备用视频           |
| 定位未授权/精度不足 | 说明原因与重新授权 | 明确标记为模拟定位并播放轨迹 |
| 助手寻路失败        | 助手暂时回收       | 回到安全跟随点，不阻塞主线   |
| 热点无法触发        | 显示手动入口       | 一键进入热点范围             |
| 主题切换失败        | 保持原主题并提示   | 切换预设场景版本             |
| 游戏状态丢失        | 恢复到开始前       | 使用固定本地进度             |

## 11. P0 验收标准

- [ ] 3–5 分钟内完整走通第 4 节主线；
- [ ] 核心场景同时显示游客角色和助手，默认无移动轮盘；
- [ ] 模拟定位能平滑驱动游客角色，助手稳定跟随；
- [ ] 至少一个热点具备远距离、感知、可交互三段状态；
- [ ] 景点故事打开和关闭后能回到原场景位置；
- [ ] 默认与中秋主题差异明显，切换后位置和进度保留；
- [ ] 灯谜具备开始、选择、提交、失败/成功和奖励结果；
- [ ] 管理端发布主题或互动点后，游客端展示同步变化；
- [ ] 页面无死链、空白页和无法返回的状态；
- [ ] 加载、定位、主题和发布异常均有可执行降级路径。

## 12. 建议开发顺序

1. 建立路由、页面壳、统一 JSON 和共享状态；
2. 接入 Aholo 场景，完成游客/助手角色、相机及模拟定位轨迹；
3. 完成热点、景点故事和场景返回；
4. 完成默认/中秋主题切换；
5. 完成猜灯谜、奖励及游客进度；
6. 完成管理工作台、主题/互动点配置和发布联动；
7. 补齐加载、错误、降级与目标设备走查。


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

## 8. STEP 4 主题开放范围

`ScenicExperienceConfig.availableThemeIds` 表示运营方允许游客自主选择的主题 ID。Client 的主题选择器只能展示该数组内的主题；`activeThemeId` 仍表示游客首次进入时的默认主题。两者均属于公共配置，只有发布后 Client 才能读取到变化，且不得因此重置 `UserProgress` 或运行时位置。
