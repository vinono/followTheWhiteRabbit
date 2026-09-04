# Find the White Rabbit — 产品需求文档

## 概要

- **类型**：单一主题的在线数字摄影展，而非普通摄影作品集。
- **首发系列**：黑白城市通勤/地铁纪实摄影。
- **叙事**：观众在一件作品前驻足；随机出现的白兔引导其进入下一件作品。
- **核心句**：*Follow the White Rabbit.*

## 愿景与原则

将关于城市、等待、低头、凝视和梦游感的照片，做成一次安静的线上观展。观众不是点击“下一张”，而是在发现白兔后选择跟随。

1. 照片永远是主角；动画只服务观看。
2. 白色展墙、留白和克制的展签优先于传统网页 UI。
3. 节奏优先于效率：白兔不会立即出现，也不自动翻页。
4. 随机必须有规则：不遮挡主体、不连续重复同一边缘、不让用户失去控制。
5. 任何等待、hover 和动画都必须有触控、键盘和减少动态效果的等价路径。

## 视觉方向

以 Roban Wang 式的白色展墙、居中作品和低干扰导航为骨架；借 Photo Reason 的大图态度和克制排版，但不复制其机构型导航或全屏宣传首页。

- 背景：`#FFFFFF`；正文近黑：`#222222`；边线：`#EAEAEA`。
- 画框：白色装裱留边、约 2px 浅灰边线、极轻阴影；不使用木框。
- 照片：完整保留真实比例，优先 `contain`，不为适配页面裁主体。
- 展签：桌面端位于右侧，宽度不超过约 280px；标题 Serif，正文 Sans。
- 左侧：默认隐藏，仅在边缘 hover/聚焦时显示 `Home` 与 `About`。
- 底部：只有一个小圆点；点击后从上方展开横向缩略图轨道。

## 信息架构

```text
Exhibition / Home
├── Artwork Frame
├── Exhibition Label
├── White Rabbit
├── Dock Trigger + Gallery Dock
├── Side Navigation (Home / About)
└── End of Exhibition
```

About 作为展厅说明层，不做常规简历页或普通弹窗。

## 核心流程

1. 首屏直接进入第一件作品，不设 Landing Page。
2. 照片完成淡入后进入观看状态。
3. 最短驻足时间默认 6 秒；之后随机等待 2–4 秒。
4. 白兔从左、右、上、下某一边缘探出，观众点击后它先离场，再切换下一件。
5. 新照片淡入后重新开始计时。
6. 最后一件不出现兔子，显示：*The rabbit has gone deeper. Will you start again?* 与 Restart。

Dock、Home 或 Restart 的任意跳转都会隐藏兔子、取消旧计时器，并走统一的作品切换流程。

## 白兔规则

- 使用原创极简白色兔子剪影或耳朵；不使用 Emoji 或卡通形象。
- 仅露出部分身体，像从浏览器边缘窥探。
- 不能挡住照片主体、展签、Dock 或导航；每件作品可配置允许边缘。
- 不连续两次选择同一边缘；首件可用较易发现的位置。
- 出场 350–500ms；等待时每 4–6 秒有一次极轻微 idle；点击离场 250–350ms。
- 兔子是有名称的 button；减少动态效果开启时不做随机探出，提供明确的“下一件作品”入口。

## Dock 规则

- 闭合态是底部居中的小圆点，带可见焦点和“Browse artworks”标签。
- 展开态为横向、可拖动/触控滑动、CSS scroll-snap 的缩略图轨道；不做瀑布流或普通网格图库。
- 点击卡片进入对应作品并收起 Dock；`Escape`、点击圆点或空白处关闭。
- Dock 打开时暂停兔子计时，避免两个引导同时竞争。

## 关于页文案

> **Find the White Rabbit**
>
> Inspired by *The Matrix* and *Alice’s Adventures in Wonderland*, this exhibition follows quiet encounters in transit. Faces lower toward screens, eyes drift toward windows, and time pauses between stations.
>
> Each photograph is an entrance. You are not browsing images. You are following a trace.

## 状态机

```text
BOOT → ENTERING_ARTWORK → VIEWING → WAITING_FOR_RABBIT → RABBIT_VISIBLE
                                                     └→ RABBIT_EXITING → TRANSITIONING → ENTERING_ARTWORK
VIEWING ↔ DOCK_OPEN
VIEWING ↔ ABOUT_OPEN
VIEWING → ENDING → TRANSITIONING (Restart)
```

同一时刻只能有一个作品切换请求生效。状态进入/退出统一创建和清理计时器，避免旧照片的兔子在新照片上出现。

## 动画规格

| 动作 | 建议 |
| --- | --- |
| 作品淡入 | 700–900ms，柔和 ease-out，位移不超过 8px |
| 作品切换 | 600–750ms cross-fade，无闪白 |
| 兔子探出 | 350–500ms，移动 8–16px |
| Dock 展开 | Spring；建议 `stiffness 260 / damping 26 / mass .75` |
| 卡片 hover | 160–220ms，scale 不超过 1.03 |

动画应有呼吸感，不使用夸张 bounce、持续旋转或高频循环。所有参数集中配置，最终以真实浏览器录屏审阅为准。

## 技术建议

- Next.js App Router + TypeScript + pnpm。
- Motion for React 负责出入场、布局与 Dock 动画。
- `next/image` 管理本地图片；当前与下一张预加载，缩略图按需加载。
- MVP 用 React reducer 管理有限状态机；不引入全局状态库、CMS、数据库、账户系统或 3D。
- 内容存为静态 `artworks` 数据：图片宽高、标题、地点、年份、描述、alt、兔子安全边缘。

## 可访问性与性能

- 键盘可访问导航、Dock、卡片、下一件和 Restart；层打开时正确处理焦点，`Escape` 关闭。
- 触控目标至少约 44×44 CSS px；hover 不是唯一触发方式。
- 支持 `prefers-reduced-motion`，并停止不必要的移动动画。
- 图片提供真实尺寸、准确 alt、AVIF/WebP 与 JPEG 回退；避免布局跳动。
- 目标：LCP ≤ 2.5s、CLS ≤ 0.1、INP ≤ 200ms（以真实设备和网络条件复验）。

## MVP 与验收

MVP 必须包含：首件直达、画框与展签、随机白兔、顺序切换、末件 Restart、隐藏式 Home/About、Dock、响应式布局、键盘/触控/减少动态效果和图片优化。

验收以真实桌面与手机浏览器录屏为准：首屏、兔子探出、点击切换、Dock、About、末件与减少动态效果均需可用且视觉克制。不得以仅代码审查或单元测试替代视觉验收。

