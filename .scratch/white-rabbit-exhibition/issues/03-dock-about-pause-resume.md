# 03: 完成 Dock、About 与 Paused rabbit session

**What to build:** 访客可用 Dock 主动浏览 Artwork、用 About 阅读展览说明，同时不丢失或误触发 White Rabbit 节奏；所有覆盖层都拥有可预测的键盘行为与层级。

**Blocked by:** 02: 实现 White Rabbit mode 的叙事推进.

**Status:** done

- [x] Dock 提供可触控、可键盘操作的水平 Artwork 轨道，选择后以统一切换流程进入作品，并支持所有约定关闭方式。
- [x] Dock 或 About 打开时冻结未完成节奏、隐藏已出现 White Rabbit；关闭后按规则从等待阶段恢复。
- [x] About 是焦点圈定的模态层，关闭后焦点返回其打开控件；White Rabbit 不会位于覆盖层上方。

## Implementation note

The horizontal scroll-snap Dock provides full keyboard and touch navigation with `aria-current` on the active artwork. Closing is supported via card selection, Escape, clicking the dock trigger, or clicking the empty backdrop/outside. When Dock or About opens, any ongoing dwell time is frozen, visible rabbits are hidden and reset to the waiting phase via `PAUSE_TO_WAITING`, and closing the overlay resumes the remaining dwell or waiting phase without jumping directly to an active rabbit. The About overlay traps focus within its dialog and restores focus to the invoking About trigger upon close. Overlays and their backdrops are positioned with higher z-indexes than the White Rabbit, and White Rabbit rendering is conditionally suppressed when overlays are open. Unit and integration tests verify dwell timer pausing, rabbit hiding/resuming, focus trapping, and all closing paths.
