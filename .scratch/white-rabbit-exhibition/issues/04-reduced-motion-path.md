# 04: 完成 Reduced-motion mode 替代路径

**What to build:** 选择减少动态效果的访客无需等待或看见随机 White Rabbit，也能以清晰、可访问的直接入口完成策展顺序、观看 Final artwork 并 Restart。

**Blocked by:** 01: 修复 Exhibition 主流程与末件状态.

**Status:** done

- [x] Reduced-motion mode 不调度 White Rabbit，而非仅以 CSS 隐藏；随机白兔流程从应用行为中移除。
- [x] 非末件有明确的下一件入口；末件、结束与 Restart 的规则保持一致。
- [x] 通过受控媒体偏好下的 Exhibition 主接缝验证该完整路径。

## Implementation note

Implemented `usePrefersReducedMotion` using `useSyncExternalStore` against `window.matchMedia("(prefers-reduced-motion: reduce)")` with prop override support for testing. When reduced motion is preferred, `useExhibitionFSM` completely stops scheduling any dwell or random timers, resets and hides any active rabbit, and renders an accessible direct Next button (`button.reducedMotionNext`) for non-final artworks. On the final artwork, the Next button is omitted and the standard "结束展览" button is displayed, leading to the EndScreen with Restart capability. Mounted Exhibition tests verify that no rabbit is scheduled or announced in reduced motion mode, the direct Next button advances through the curated sequence, and the final artwork ending and restart rules remain identical.
