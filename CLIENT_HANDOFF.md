# 杭州西湖数字景区 Client 交接文档

> 本文是当前唯一有效的 Client 交接说明，以 `contracts/`、`backend/src/seed/westLakeSeed.ts` 和 Backend 路由实现为准。请勿以本机运行时 JSON 状态作为仓库默认数据：`backend/data/config.json` 被 Git 忽略，fresh clone 第一次启动时始终由 Seed 初始化。

## 当前项目状态

已完成的 Admin 能力：PC 运营后台、3D 资产创建至审核上线的 Demo 流程、主题 Draft 与自定义主题、`availableThemeIds`、互动点配置、玩法库（中秋猜灯谜 / Reward）、Draft / Published 分离、预览并发布页面，以及 Demo Config Backend。

`client/` 的游客端尚未开始实现，或由 Client 成员独立负责。本阶段的 Admin 视觉预览只是运营侧模拟预览，不是 Client 页面，也不是可复用的真实 Client Preview。

## 仓库职责边界

| 目录 | 职责 |
| --- | --- |
| `admin/` | 景区运营管理端。Client 不导入、不修改其中的页面、组件、服务或样式。 |
| `client/` | 游客端应用；由 Client 成员独立开发。 |
| `backend/` | 双端共用的 HackDay Demo Config Server。 |
| `contracts/` | Admin、Client、Backend 唯一共享的数据协议和固定 ID。 |
| `docs/` | 协作文档。 |

Client 禁止自行定义另一套 `Theme`、`Scene`、`InteractionPoint`、`MiniGame` 或 `Reward` 模型；请从 `@hackday/contracts` 导入类型和 `WEST_LAKE_IDS`。

## 启动方式

在仓库根目录执行（PowerShell 如拦截 `npm.ps1`，使用 `cmd /c`）：

```powershell
cmd /c npm install
cmd /c npm run backend:dev
cmd /c npm run dev
```

- Backend 默认地址：`http://127.0.0.1:8787`
- Admin 开发地址：以 Vite 实际输出端口为准。
- Client 可在自己的端口独立运行，只需请求本地 Backend。

## Client 唯一公共配置入口

```http
GET /api/client/config
```

Client **只调用这个 Published Config 接口**，不调用任何 `/api/admin/*` 接口。响应是 `ScenicExperienceConfig`，核心内容包括：

- `scenicArea`、`scenes`、`spots`
- `themes`、`activeThemeId`、`availableThemeIds`
- `interactionPoints`、`miniGames`、`rewards`
- `version`、`updatedAt`

`activeThemeId` 是游客首次进入时应用的默认主题；主题选择器只能展示 `availableThemeIds` 中的主题。Client 不应读取 Draft，因此运营人员尚未发布的修改不会提前影响游客端。

## 当前固定 ID

来自 `contracts/src/index.ts` 的 `WEST_LAKE_IDS`：

| 类型 | 名称 | ID |
| --- | --- | --- |
| 景区 | 杭州西湖风景名胜区 | `hangzhou-west-lake` |
| 场景 | 断桥残雪 | `scene-broken-bridge` |
| 场景 | 雷峰塔 | `scene-leifeng-pagoda` |
| 主题 | 默认西湖 | `theme-default-west-lake` |
| 主题 | 中秋雅集 | `theme-mid-autumn-gathering` |
| 主题 | 国庆主题 | `theme-national-day` |
| 互动点 | 断桥故事 | `interaction-broken-bridge-story` |
| 互动点 | 中秋猜灯谜 | `interaction-mid-autumn-riddle` |
| 互动点 | 场景传送 | `interaction-scene-teleport` |
| 玩法 | 中秋猜灯谜 | `minigame-lantern-riddle` |
| 奖励 | 月映断桥 | `reward-moonlit-broken-bridge` |

补充：Seed 还提供第三场景预留 ID `scene-west-lake-reserved`、景点 ID `spot-broken-bridge` 与 `spot-leifeng-pagoda`。玩法库中的拼图复原、西湖寻宝、诗词挑战目前是 Admin 占位玩法，不是 Client P0。

## 双端联动机制

```text
Admin 修改配置
  → 保存为 Draft
  → hasUnpublishedChanges = true
  → /operations/publish 确认
  → POST /api/admin/publish
  → Published Config 更新，version + 1
  → Client 获取 GET /api/client/config
  → 仅在 version 变化时更新公共展示
```

Client 第一阶段建议约每 2 秒请求一次公共配置；只有 `next.version !== current.version` 时替换公共配置、应用主题和刷新热点。不要轮询 Admin API。

```ts
import type { ScenicExperienceConfig } from "@hackday/contracts";

let config: ScenicExperienceConfig;

async function fetchConfig() {
  return fetch("http://127.0.0.1:8787/api/client/config").then((response) => response.json());
}

async function refreshIfVersionChanged() {
  const next = await fetchConfig();
  if (!config || next.version !== config.version) {
    config = next;
    applyTheme(config.themes.find((theme) => theme.id === config.activeThemeId));
    renderHotspots(config.interactionPoints.filter((point) => point.enabled));
  }
}

setInterval(refreshIfVersionChanged, 2000);
```

## Client 必须实现的行为

1. 建立 `ClientConfigService`，只封装公共配置接口。
2. 建立 Config Provider / Store，并与用户运行状态分开管理。
3. 首次加载 `GET /api/client/config`，然后开始 version polling。
4. 根据 `activeThemeId` 应用默认主题；选择器只显示 `availableThemeIds`。
5. 仅渲染 `enabled === true` 的 `InteractionPoint`。
6. 用 `miniGameId` 在 `miniGames` 中查找“玩什么”；用 `rewardId` 在 `rewards` 中查找“完成获得什么”。不要把玩法、投放点和奖励混为一个对象。
7. 独立维护 `UserProgress`。

## UserProgress 边界

`UserProgress` 不得写入景区 Published Config。Client 自己持久化：

- `completedInteractionIds`
- `unlockedRewardIds`
- 当前角色位置
- 当前 Scene
- 当前任务状态

Admin 发布新主题、互动点、玩法或奖励配置时，只更新公共景区内容；上述游客状态**不得被重置**。

## 当前 Demo 联动示例

### 主题

默认 Published：`activeThemeId = theme-default-west-lake`。

Admin 将 Draft 改为 `theme-mid-autumn-gathering` 后，Client 仍显示默认西湖。只有运营人员在发布页确认发布后，`version` 才会增加；Client 下次轮询读取新 Config，应用中秋雅集，但角色位置与 `UserProgress` 保持不变。

### 互动点

Admin 关闭 `interaction-mid-autumn-riddle`（中秋猜灯谜）并保存时，Client 暂时不变化。发布后 Client 下一次读取到新版本 Config，因该点 `enabled=false`，断桥区域对应热点消失；已完成记录和已领取的“月映断桥”奖励不受影响。

## Client P0 开发主线

按《开发需求文档v1.md》的 P0 主线实现：

```text
景区详情 → 场景加载 → 3D 探索 → 游客角色 + 助手 → 模拟定位轨迹
→ 景点热点 → 景点故事 → 默认 / 中秋主题 → 猜灯谜 → 月映断桥奖励
→ Admin 发布配置 → Client 同步变化
```

Admin 当前额外的 ToB 能力（自定义主题、运营洞察、玩法占位等）不是 Client P0 的额外页面需求；Client 只需正确消费已发布的协议。

## aHolo 边界

真实 aHolo 尚未接入；当前 3D 资产和 aHolo 重建能力均为 Demo / Mock。未来调用链应为：

```text
Client / Admin → Backend → aHolo
```

API Key 绝不能进入 Client、Admin 或 `contracts/`。

## 尚未完成

- Client 正式页面与 3D 体验实现
- 真实 Client Preview 嵌入 Admin
- aHolo 正式接入
- 最终双端联调
- 最终 Demo polish

## Fresh clone 默认状态

第一次启动 Backend 时，Seed 默认：

```text
version = 1
activeThemeId = theme-default-west-lake
availableThemeIds = [theme-default-west-lake]
```

不要将任何开发者本机已经发布到 v2 或更高版本的运行时状态视为仓库初始状态。
