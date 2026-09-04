# Find the White Rabbit — 已确认实施规格

> 状态：需求已确认，待实施。本文是可发布到 issue tracker 的规格正文；以本文为准的决策覆盖早期 PRD 和技术设计中的冲突表述。

## Problem Statement

作为摄影展的创作者，我需要把当前的 14 件原创 JPG 摄影作品呈现为一次有节奏、有明确结尾的单一线上展览，而不是可任意翻页的作品集。现有实现会跳过末件、在普通动效模式中常驻显示 Next 并支持方向键跳转，且 Dock/About 与白兔计时、焦点和层级互相干扰；这破坏了“等待并跟随白兔”的核心叙事，也使 reduced-motion 的替代路径不完整。

## Solution

交付一个以 **Exhibition** 为唯一入口的、策展顺序固定的线上摄影展。普通动效下，观众在每件非末件作品完整淡入后观看 6 秒，随后等待随机 2–4 秒，再通过出现的 **White Rabbit** 自主进入下一件；不存在常驻 Next 或左右方向键直达。最后一件始终先完整展示，观众主动选择“结束展览”后才进入结尾页。

**Dock**、Home 与 About 是不破坏默认叙事的主动浏览入口。**Reduced-motion mode** 不显示随机白兔，并始终给出清晰的下一件入口。公开内容仅展示序号、标题（如有）、简短中英展览文字与准确 alt；不展示摄影师、地点、年份或器材。首发以 14 件用户拥有版权的 JPG 衍生图验收，并先以 link-only preview 发布。

## User Stories

1. As a visitor, I want to enter directly on the first artwork, so that the site feels like entering an exhibition rather than a marketing landing page.
2. As a visitor, I want each artwork to preserve its original aspect ratio in a calm exhibition frame, so that no photographic subject is cropped for layout convenience.
3. As a visitor in White Rabbit mode, I want an artwork to finish entering before its viewing time begins, so that I receive the intended minimum six seconds with the work.
4. As a visitor in White Rabbit mode, I want the White Rabbit to appear only after a further random two-to-four-second wait, so that the rhythm feels discovered rather than like a timer-driven gallery.
5. As a visitor, I want the White Rabbit to be the only normal forward cue, so that following it remains the exhibition's narrative action.
6. As a visitor, I want no persistent Next control in White Rabbit mode, so that I am not invited to bypass the intended pause.
7. As a keyboard visitor in White Rabbit mode, I want no left/right-arrow artwork skipping, so that keyboard input does not bypass the White Rabbit narrative.
8. As a keyboard visitor, I want a visible White Rabbit to be reachable by Tab and activatable by Enter or Space, so that I can follow it without a pointer.
9. As a screen-reader visitor, I want a concise announcement when the White Rabbit becomes available, so that its appearance is not purely visual.
10. As a visitor, I want the White Rabbit to avoid protected artwork, label, Dock, and navigation areas, so that the photograph remains the focus.
11. As a visitor, I want consecutive rabbits to avoid using the same permitted edge when alternatives exist, so that the cue retains a sense of discovery.
12. As a visitor, I want to select an artwork from the Dock, so that I can intentionally revisit or enter a work without turning the exhibition into a conventional grid gallery.
13. As a touch visitor, I want the Dock rail to support horizontal touch scrolling and usable targets, so that direct browsing works on phones.
14. As a visitor, I want Dock opening to pause an unfinished rabbit session, so that I do not miss a cue while browsing.
15. As a visitor, I want an already visible rabbit to disappear when Dock or About opens, so that no cue appears behind or above an overlay.
16. As a visitor, I want closing Dock or About after a visible rabbit to restart from the random-wait phase, so that the cue is not silently preserved behind a layer.
17. As a visitor, I want Escape, the Dock trigger, and a Dock blank-area action to close the Dock, so that the rail is easy to dismiss.
18. As a visitor, I want About to behave as a modal layer with focus contained and restored to its opener on close, so that keyboard context remains predictable.
19. As a visitor, I want Home and Dock selection to use the same controlled artwork transition, so that no stale rabbit or timer appears on a different artwork.
20. As a visitor viewing the final artwork, I want to see the complete final work before any ending message, so that the curated sequence has a real conclusion.
21. As a visitor viewing the final artwork, I want no White Rabbit, so that the rabbit's departure is meaningful.
22. As a visitor viewing the final artwork, I want an explicit “结束展览” action, so that I decide when to leave the concluding work for the ending screen.
23. As a visitor on the ending screen, I want a Restart control, so that I can begin the exhibition again from the first artwork.
24. As a visitor who prefers reduced motion, I want no randomly appearing or moving White Rabbit, so that the exhibition respects my system preference.
25. As a visitor who prefers reduced motion, I want a clear next-artwork control, so that I can still complete the curated sequence without waiting for a hidden cue.
26. As a visitor, I want the reduced-motion behavior to be driven by application logic rather than only visual CSS hiding, so that hidden timers and inaccessible state do not remain active.
27. As a visitor, I want Chinese and English exhibition text presented together in distinct sections, so that both languages are available without a language switcher or route change.
28. As a visitor, I want public artwork metadata limited to sequence, title where supplied, exhibition text, and accurate alt text, so that the exhibition remains intentionally minimal.
29. As the exhibition creator, I want photographer name, location, year, and equipment omitted from public display, so that the release respects the approved curatorial boundary.
30. As the exhibition creator, I want only web-ready JPG derivatives served publicly, so that source originals remain private.
31. As the exhibition creator, I want image delivery to work locally and through a configured CDN media base URL, so that preview and production use the same artwork keys.
32. As the exhibition creator, I want the current and next artwork to load efficiently without layout shift, so that the photograph appears promptly and stably.
33. As the exhibition creator, I want every launch artwork manually reviewed for identifiable or sensitive people before release, so that a concerning image can be removed or made non-identifying.
34. As the exhibition creator, I want a link-only preview before public indexing or formal domain binding, so that visual and content approval happens before broader release.
35. As the exhibition creator, I want desktop and mobile browser recordings of the critical flow, so that visual acceptance reflects the actual exhibition rather than only source review.

## Implementation Decisions

- The product remains a single **Exhibition**, not a portfolio, CMS, account system, multi-exhibition platform, or landing page.
- The curated sequence contains 14 **Artwork** entries in the existing approved order. **Final artwork** is a distinct stateful concept: it is visible and interactive before the ending screen, rather than a trigger that immediately renders the ending.
- All exhibition progression is centralized in one finite-state transition model. It must distinguish entering, viewing, random rabbit wait, rabbit visible, rabbit exit/transition, final-artwork viewing, and ending states. At most one transition request and one relevant timer set may be active at once.
- A normal non-final artwork follows this behavior: visual entry completes → six-second viewing → random two-to-four-second wait → White Rabbit visible → visitor activation → rabbit exit → next artwork visual entry. The final artwork never creates a rabbit session.
- Dock and About are overlay states around an artwork state. They freeze remaining unfinished viewing/wait time; if they interrupt a visible rabbit, dismiss it. After their close, an interrupted visible rabbit restarts at random wait, rather than being restored as visible. Artwork changes and overlay changes clean up obsolete timers.
- **White Rabbit mode** is selected when reduced motion is not requested. It has no persistent next control and does not map ArrowLeft/ArrowRight to previous or next artwork. Direct navigation is confined to explicit Dock and Home actions.
- **Reduced-motion mode** is a logical branch of the exhibition model, not merely a CSS rule. It suppresses random rabbit scheduling and supplies an explicit accessible next control. The final-artwork and ending rules remain unchanged.
- The White Rabbit is a named native button that becomes keyboard focusable only when available, does not steal focus on appearance, and produces a short non-disruptive accessibility announcement. Its permitted placement comes from each Artwork's safe-edge configuration and avoids consecutive duplicate edges where another permitted edge exists.
- The Dock remains a bottom-triggered, horizontal scroll-snap thumbnail rail. It is not a grid. It supports keyboard, pointer, touch, click-to-select, and the agreed closing actions.
- About is an accessible modal dialog: focus enters a meaningful control, remains within the dialog while open, Escape/backdrop/close dismiss it, and focus returns to the control that opened it.
- Public **Artwork ownership** is recorded as creator-owned for all 14 MVP works. The content model and visitor UI expose only **Public artwork metadata**: order, optional title, accurate alt, and brief **Bilingual presentation** text. Photographer, location, year, and equipment fields are neither required nor rendered for launch.
- Public **Exhibition media** consists of optimized JPG derivatives. Private source originals do not enter version control or public storage. Production media delivery uses the configured public media base URL while local development continues through the existing media route.
- Image rendering uses an optimization-aware image component/loader with known intrinsic dimensions, current/next work preloading, and deferred thumbnail loading. The implementation must preserve the art's real aspect ratio and avoid content layout shift.
- Motion uses one centralized set of motion tokens and a single animation system for artwork transition, White Rabbit, and Dock. Existing visual intent remains: restrained fades, no exaggerated loops or bounces; reduced motion removes non-essential movement.
- Documentation describing the application as uninitialized must be corrected to match the existing Next.js implementation, and earlier requirements that conflict with these approved rules must be marked superseded.

## Testing Decisions

- The principal acceptance seam is the mounted **Exhibition** experience, exercised with controlled time, explicit media-query settings, and real user actions. Tests assert externally visible visitor behavior and accessible controls, not reducer internals, timer references, CSS class names, or implementation-specific animation details.
- At that seam, test first artwork entry; six-second dwell plus two-to-four-second rabbit wait; Rabbit activation; no persistent Next or ArrowLeft/ArrowRight shortcut in White Rabbit mode; keyboard activation and announcement; Dock/About interruption and resumption; Dock selection/Home cleanup; final-artwork viewing and explicit ending action; Restart; and reduced-motion direct-next behavior with no rabbit scheduling exposed to the visitor.
- Keep focused pure state-transition tests only for high-risk invariants that are difficult to observe exhaustively through the mounted experience: final work is not skipped, stale events cannot advance a newer artwork, and overlay interruption follows the agreed resumption rules. These tests specify transition outcomes, not private reducer structure.
- Use existing lint and production build as baseline static checks. Add the smallest appropriate React test setup only if no existing UI-test seam exists; prefer the single Exhibition seam over component-by-component mocks.
- Visual acceptance is separate and mandatory: record the critical flow in real desktop and mobile browsers, including standard motion, reduced motion, Dock, About, final artwork, ending, keyboard use, and touch use. Inspect image scale, protected areas, layer order, focus visibility, and responsive label layout.
- Media acceptance uses the optimized JPG derivatives for all 14 works. Confirm each public URL, intrinsic size/aspect preservation, alt text, and that no source original is bundled or publicly exposed.

## Out of Scope

- A general portfolio, grid-gallery redesign, public search/indexing, multiple exhibitions, accounts, CMS, database, analytics SDK, audio, 3D, or social integrations.
- Language switching, language-specific routes, photographer biography pages, map/location pages, EXIF/equipment display, or public date/year metadata.
- Publishing source originals, importing third-party Instagram embeds, or asserting an automated solution to sensitive-person review.
- Formal domain binding and broad public promotion; those follow satisfactory link-only preview and the creator's explicit authorization.
- Changing the approved 14-work curatorial order or adding new images without a new curatorial decision.

## Further Notes

- All current MVP works are JPGs and are creator-owned. Before any public release, complete **Content risk review** one work at a time; if a person is concerning or identifiable in a way the creator does not wish to publish, remove that work from the launch sequence or make it non-identifying.
- The current code has known gaps this specification resolves: it enters ENDING before the final work can be viewed; it leaves a visible rabbit over Dock; it displays Next in ordinary motion; it supports direct arrow-key jumps; and it does not yet provide complete modal focus behavior.
- The first public milestone is a non-indexed **Link-only preview**, not a formal-domain launch. Use real browser evidence to approve it before any external publication action.
