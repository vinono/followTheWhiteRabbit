# Follow the white rabbit

一个关于地铁、陌生人与短暂相遇的线上摄影展。14 张照片串成一段观看旅程：停下来，等待白兔出现，跟着它走向下一张。

页面从一幅序言画框开始，介绍展览并邀请观众进入。没有常驻导航栏，也没有向前翻页按钮；白兔是第一次观看时的向导。

## 观看方式

1. 在序言画框点击「开始观看」。
2. 照片加载并入场后，稍作停留，白兔在画框边缘出现。点击白兔进入下一张。
3. 看完第 14 张并点击白兔后，进入手写 **END** 画框。
4. 底部解锁一个轻微浮动、循环发光的小圆点。点击展开环形画廊，自由回看照片。

画廊支持水平拖动、手机滑动与键盘左右方向键，照片首尾循环。点击照片进入观看，点击底部光点、关闭按钮、外部遮罩或按 Esc 收起画廊。底部没有分页点、数字计数或操作提示。

完成状态只保存在当前标签页的 `sessionStorage` 中。刷新后回到序言，已解锁的画廊仍可使用；独立的新访问从头开始。回看照片时，图片加载后白兔立即出现。

## 本地运行

需要 Node.js 20.9 或更高版本，以及 pnpm 10.20.0。

```bash
pnpm install
pnpm dev
```

打开 <http://localhost:3000>。

**照片不包含在 Git 仓库中。** 将用于展示的图片放入 `media/`，目录与文件名需对应 [`content/artworks.ts`](content/artworks.ts) 中的 `file` 字段。本地不设置 `NEXT_PUBLIC_MEDIA_BASE_URL`，图片通过 `/api/artwork/<key>` 读取。缺少对应图片时，无法完整体验观展流程。

如需使用已有图片 CDN，在 `.env.local` 中配置真实地址；不要直接使用 `.env.example` 里的示例域名：

```dotenv
NEXT_PUBLIC_MEDIA_BASE_URL=https://your-image-domain.example
```

## 内容与代码

| 路径 | 用途 |
| --- | --- |
| `content/artworks.ts` | 展览标题、序言、作品顺序、图片路径、尺寸、替代文字与兔子安全边 |
| `components/Exhibition.tsx` | 序言、观展、END 与画廊入口 |
| `lib/exhibition-fsm.ts` | 图片加载、观看节奏、白兔交互与完成状态 |
| `components/WhiteRabbit.tsx` | 白兔四边姿态与交互 |
| `components/GalleryDock.tsx` | 环形照片画廊、拖动与键盘浏览 |
| `app/globals.css` | 页面、画框与呼吸光点样式 |
| `public/rabbit/` | 白兔图片素材 |

技术栈为 Next.js App Router、React、TypeScript 和 CSS；使用 Vitest 与 Testing Library 验证交互。项目不依赖账号、数据库、CMS 或分析服务。

## 检查与构建

```bash
pnpm test                 # 自动测试
pnpm lint                 # ESLint
pnpm exec tsc --noEmit    # 类型检查
pnpm build               # 生产构建
pnpm start               # 启动生产服务
```

自动检查不能替代桌面和手机上的视觉、触控验收。当前验收记录见[预览检查清单](docs/preview-readiness.md)。

## 部署

使用支持 Next.js 的托管平台或 Node.js 服务环境：

1. 将作品清单中的展示衍生图上传到对象存储或 CDN，保持原有对象键。
2. 在部署环境设置 `NEXT_PUBLIC_MEDIA_BASE_URL`，然后执行生产构建。此变量会参与客户端构建，修改后需重新构建。
3. 使用 `pnpm build` 构建，使用平台的 Next.js 运行时或 `pnpm start` 提供服务。
4. 实际检查图片加载、14 张完整流程、END 解锁与画廊回看。

向 GitHub 推送代码不会同时上传照片，也不等同于网站已经部署。只上传用于展览的衍生图；原始照片保持私有。详细说明见[照片存储策略](docs/media-storage.md)。

## 项目文档

- [已确认实施规格](docs/approved-exhibition-spec.md)：当前交互与产品行为的依据。
- [开发记录](docs/exhibition-redesign-2026-09-19.md)：设计调整、实施与验证记录。
- [预览检查清单](docs/preview-readiness.md)：发布前的检查项与已知限制。
- [领域说明](CONTEXT.md)：代码与文档中的术语。

早期 PRD 与技术设计保留作历史参考；与当前行为冲突时，以已确认实施规格为准。
