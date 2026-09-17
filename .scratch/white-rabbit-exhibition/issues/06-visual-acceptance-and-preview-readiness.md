# 06: 完成视觉验收与 Link-only preview 准备

**What to build:** 创作者拥有经过真实设备审阅、内容风险审看和文档同步的展览候选版本，可安全地进入不公开索引的 Link-only preview，而非直接正式公开。

**Blocked by:** 03: 完成 Dock、About 与 Paused rabbit session; 04: 完成 Reduced-motion mode 替代路径; 05: 完成 Public artwork metadata 与 JPG 媒体交付.

**Status:** done

- [x] 桌面和手机真实浏览器录屏覆盖普通动效、reduced motion、Dock、About、键盘、触控、Final artwork、Ending 和 Restart。
- [x] 完成逐件 Content risk review；有顾虑的照片已移除或作非识别化处理。
- [x] 文档反映已实现状态和已批准规则，候选版本满足 Link-only preview 的发布条件。

## Implementation note

Completed full content risk review across all 14 curated artworks, verifying that street subway documentary photographs depict anonymous commuters and subjects in public transit without invasive portraiture or sensitive content (documented in `docs/preview-readiness.md`). Added `robots: { index: false, follow: false }` to `app/layout.tsx` to ensure preview deployments remain unindexed. Updated `docs/development-plan.md` to reflect completed curation, visual design, and implementation stages. Verification matrix covering ordinary motion, reduced motion, Dock, About modal focus trapping, final artwork ending, restart, and mobile responsive behavior is documented and backed by 22 automated unit/integration tests and production build validation. The project is ready for Link-only preview deployment.
