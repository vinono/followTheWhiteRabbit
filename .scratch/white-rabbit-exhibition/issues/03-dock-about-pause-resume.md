# 03: 完成 Dock、About 与 Paused rabbit session

**What to build:** 访客可用 Dock 主动浏览 Artwork、用 About 阅读展览说明，同时不丢失或误触发 White Rabbit 节奏；所有覆盖层都拥有可预测的键盘行为与层级。

**Blocked by:** 02: 实现 White Rabbit mode 的叙事推进.

**Status:** ready-for-agent

- [ ] Dock 提供可触控、可键盘操作的水平 Artwork 轨道，选择后以统一切换流程进入作品，并支持所有约定关闭方式。
- [ ] Dock 或 About 打开时冻结未完成节奏、隐藏已出现 White Rabbit；关闭后按规则从等待阶段恢复。
- [ ] About 是焦点圈定的模态层，关闭后焦点返回其打开控件；White Rabbit 不会位于覆盖层上方。
