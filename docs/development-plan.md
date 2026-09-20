# Find the White Rabbit — 开发执行清单

> **2026-09-19 更新**：当前体验已改为「序言画框 → 照片 → END → 解锁目录」。取消 Home/About、Restart 和 reduced-motion Next 分支，兔子相对画框出现。以下保留早期设计记录；交互冲突以[最新确认规格](approved-exhibition-spec.md)为准，实现与验证见 [开发记录](exhibition-redesign-2026-09-19.md)。


> 这是开发顺序；开始编码前先完成策展与视觉确认。

## 第一轮：策展与资产

- [x] 汇总全部可用照片，保留原文件名。
- [x] 标记不可公开、分辨率过低或不属于系列的图片。
- [x] 按情绪而不是拍摄日期排出 14 件核心展品序列。
- [x] 为每张入选图配置客观 alt、双语标题与尺寸。
- [x] 确认首件为《Threshold / 临界》，末件为《Almost Meeting / 几乎相遇》。

## 第二轮：视觉定稿

- [x] 校准画框留白与自适应缩放尺度。
- [x] 确定桌面与手机端自适应展签排版。
- [x] 确认白兔极简 SVG 轮廓剪影与安全出没边缘。
- [x] 完成观看、兔子出现、Dock 展开、About 四个核心状态。
- [x] 确认首屏无 Landing、纯白展墙与极简低干扰交互。

## 第三轮：确认后编码

- [x] 初始化 Next.js 16 + TypeScript + pnpm。
- [x] 放入优化后的展示衍生图与作品数据（不含 Git 外部源图）。
- [x] 实现 FSM 状态机与防竞态作品切换。
- [x] 接入白兔出入场动效与节奏控制（6s dwell + 2–4s random wait）。
- [x] 实现横向 CSS scroll-snap Dock 轨道与多方式关闭。
- [x] 实现 About 展厅说明层模态与焦点圈定（Focus Trap）。
- [x] 实现 prefers-reduced-motion 模式下的直接 Next 替代通道与白兔调度解绑。
- [x] 完成覆盖层节奏冻结、隐藏白兔与平滑恢复。

## 发布前与预览就绪

- [x] 14 件公开作品完成逐件内容与隐私安全核验（见 `docs/preview-readiness.md`）。
- [x] 配置 `robots: { index: false, follow: false }` 避免搜索引擎收录。
- [x] 正式图片源支持配置 `NEXT_PUBLIC_MEDIA_BASE_URL` 云存储 CDN。
- [x] 22 项全量自动化测试、ESLint 9 与 `next build` 编译验证全部通过。
- [ ] 部署至 Link-only preview 链接后由摄影师进行真实设备体验确认。
- [ ] 摄影师确认后绑定正式域名正式发布。

