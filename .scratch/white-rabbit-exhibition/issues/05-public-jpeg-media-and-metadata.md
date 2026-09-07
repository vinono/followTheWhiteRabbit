# 05: 完成 Public artwork metadata 与 JPG 媒体交付

**What to build:** 访客获得稳定、快速且不裁切的 14 件 Exhibition media，并只看到批准的双语展览信息；创作者的原始照片及被排除的元数据不被公开。

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] 所有 14 件公开资产使用优化的 JPG 衍生图，保留真实宽高比例，并按当前/下一件与缩略图需求加载。
- [ ] 访客只看见序号、可选标题、简短中英展览文字和准确 alt；摄影师、地点、年份和器材均不渲染。
- [ ] 验证本地与配置的媒体基址均使用同一 Artwork key，且源原件没有进入公开构建或仓库。
