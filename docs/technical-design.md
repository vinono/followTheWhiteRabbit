# Find the White Rabbit — 技术设计（开发前）

> 状态：设计与开发路径已确认；尚未初始化项目、安装依赖或编写代码。

## 技术基线

| 层级 | 选择 | 原因 |
| --- | --- | --- |
| 应用 | Next.js App Router + TypeScript | 图片优化、部署与单页体验均成熟。 |
| 包管理 | pnpm | 可复现、依赖清晰。 |
| 动画 | Motion for React | 用一套声明式动画控制照片、兔子和 Dock。 |
| 样式 | CSS Modules + CSS custom properties | 视觉 token 集中、无需引入 UI 组件库。 |
| 图片 | 本地静态资源 + `next/image` | 不依赖 Instagram 链接，尺寸与预加载可控。 |
| 状态 | React reducer 有限状态机 | MVP 状态数量有限，避免过度架构。 |

首版不引入 CMS、数据库、登录、分析 SDK、音频、3D 或多场展览。

## 资产规则

Instagram 官方导出的图片可以作为 MVP 正式素材，但应保留导出包的原文件，不从 Instagram 页面、嵌入代码或截图再次保存。

```text
assets/source/                 # 归档原件，不直接被网页引用
public/artworks/               # 优化后的展示与缩略图
content/artworks.ts            # 顺序、展签、尺寸、alt、兔子安全边缘
```

每件作品要有：展示图、缩略图、精确宽高、标题、地点、年份、简述、真实 alt、允许兔子出现的边缘。

当前方形黑白通道照片可暂定为第一件 **Approach / 靠近**：背影与人流有天然“跟随”方向，顶部结构线将目光导向深处；保留胶片边缘和完整方形比例，不裁切。最终顺序在全部照片并排策展后确认。

## 计划文件边界

```text
app/page.tsx                   # 唯一展览入口
components/ExhibitionShell     # 状态与布局总控
components/ArtworkFrame        # 画框与作品切换
components/ExhibitionLabel     # 展签
components/WhiteRabbit         # 兔子
components/Dock                # 圆点与缩略轨道
components/SideNavigation      # Home / About
components/AboutOverlay        # 策展说明
lib/exhibition-reducer         # 状态转换与计时清理
lib/rabbit-placement           # 安全边缘与随机规则
lib/motion-tokens              # 时长与弹簧参数
```

这只是未来的实现边界，当前不创建代码文件。

## 实现策略

所有跳转（兔子、Dock、Home、Restart、键盘下一件）进入唯一的作品切换入口。状态机负责当前作品、切换中、兔子、Dock 和 About；每次切换都清理旧计时器。

作品淡入结束后才开始 6 秒驻足计时；再取 2–4 秒随机延迟显示兔子。Dock、About、页面失焦与减少动态效果会暂停或清理兔子会话。最后一件不创建兔子计时器。

## 阶段与质量门槛

| 阶段 | 交付 | 门槛 |
| --- | --- | --- |
| 0 | 照片、顺序、展签、About 文案 | 每张有尺寸、来源和公开确认。 |
| 1 | 静态展墙 | 先在真实浏览器确认“像展览”。 |
| 2 | 状态机、兔子、切换、结尾 | 无重复跳转、无旧计时器。 |
| 3 | Dock、About、键盘、reduced motion | 不等兔子也能完整浏览。 |
| 4 | 性能、真实设备录屏 | 达到 PRD 验收标准。 |
| 5 | 预览部署和正式发布 | 摄影师确认视觉与内容。 |

每一阶段都用真实浏览器截图/录屏审阅，不用“代码正确”替代视觉验收。调试顺序固定为：照片尺度 → 排版 → 时间节奏 → 微动画。

## 开始编码前还需确认

1. 全部可用照片（建议 8–20 张）及是否可公开。
2. 摄影师显示名、地点、年份和是否展示器材。
3. 展签/About 是否中英双语。
4. 首件与末件的策展顺序。
5. 发布目标：预览链接或正式域名。

