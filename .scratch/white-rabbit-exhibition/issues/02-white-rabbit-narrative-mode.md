# 02: 实现 White Rabbit mode 的叙事推进

**What to build:** 在普通动效设置下，访客在每件非末件 Artwork 前完整驻足，再选择跟随 White Rabbit 进入下一件；不存在绕过该叙事的常驻 Next 或左右方向键翻页。

**Blocked by:** 01: 修复 Exhibition 主流程与末件状态.

**Status:** ready-for-agent

- [ ] 非末件在进入完成后观看 6 秒、随机等待 2–4 秒，再显示遵守安全边缘规则的 White Rabbit。
- [ ] White Rabbit 可通过 Tab、Enter 和 Space 操作，出现时有简短无障碍提示且不抢焦点。
- [ ] 普通模式不显示 Next，ArrowLeft/ArrowRight 不会直接改变 Artwork。
