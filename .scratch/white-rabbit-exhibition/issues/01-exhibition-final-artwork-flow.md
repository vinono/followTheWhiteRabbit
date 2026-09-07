# 01: 修复 Exhibition 主流程与末件状态

**What to build:** 访客能够从第一件作品进入策展顺序，经历受控的作品切换，在 Final artwork 完整观看后自主选择结束展览，并从结束页重新开始；任何旧的等待或切换都不能作用到新作品。

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Final artwork 在进入结尾页前始终可见，并提供明确的“结束展览”动作。
- [ ] Restart 返回第一件作品；重复触发或陈旧事件不会跳过作品或产生重复切换。
- [ ] 通过 Exhibition 主接缝验证首件、末件、结束页与 Restart 的可见行为。
