---
title: Layout modes
description: All eight menu modes the default blueprint implements, the classes they map to, when to choose each, and the mobile regime nobody chooses.
---

The application shell has eight menu modes. Each is a `LayoutMode` value, each maps to one wrapper class,
and the class vocabulary is PrimeTek's - unchanged, so anyone who has themed a PrimeReact application
recognizes it.

## The modes

| Mode | `LayoutMode` | Wrapper class | Sidebar width | Choose it when |
| --- | --- | --- | --- | --- |
| Static | `Static` | `layout-static` | 18rem | Navigation is used constantly and screens are wide. The default. |
| Overlay | `Overlay` | `layout-overlay` | 18rem, off-canvas | Content needs the full width and navigation is occasional. |
| Slim | `Slim` | `layout-slim` | 5rem | The icons are learnable and every pixel of width matters. |
| Slim+ | `SlimPlus` | `layout-slim-plus` | 7rem | Same, but the icons are not self-explanatory enough to go unlabeled. |
| Compact | `Compact` | `layout-compact` | 5rem | The slim rail, with square buttons and a topbar shifted by the rail. |
| Horizontal | `Horizontal` | `layout-horizontal` | none | Few top-level areas, and vertical space is the scarce one. |
| Reveal | `Reveal` | `layout-reveal` | 4.25rem strip → 18rem | Full labels on demand without permanently paying for them. |
| Drawer | `Drawer` | `layout-drawer` | 5.25rem → 18rem | Same as reveal, but the content should never be covered mid-hover. |

## What each one actually does

**Static** docks the sidebar and gives the content a matching `margin-left`. The topbar toggle slides the
sidebar out and drops the margin. Content is pushed, never covered.

**Overlay** parks the sidebar off-canvas. Opening it floats it over the content at a high z-index with a
`.layout-mask` scrim behind it; clicking the scrim closes it.

**Slim** collapses the sidebar to an icon-only rail with root items as circular buttons. Submenus pop out
as a floating panel anchored at the rail's width.

**Slim+** is the same idea at 7rem, with each icon's label stacked directly beneath it, and the submenu
popup anchored at 7rem.

**Compact** is the 5rem icon rail again with square rather than circular buttons, and it also shifts the
topbar by the rail width - so the brand sits beside the rail rather than over it.

**Horizontal** makes the sidebar `position: static` and flows it into the topbar strip as a nowrap row.
Submenus become absolute drop-downs, and the content margin goes to zero.

**Reveal** translates the full panel off-left, leaving a 4.25rem strip of icons. Hovering slides the whole
panel in *over* the content. The pin button anchors it open, which switches it from covering the content to
pushing it out to the full 18rem.

**Drawer** is the same interaction with a different mechanic: a collapsed 5.25rem rail that *animates its
width* to full on hover. Reveal slides; drawer grows. It pins the same way.

## State classes

Modes are not the only thing on the wrapper. `layoutWrapperClasses` also emits:

| Class | Present when |
| --- | --- |
| `layout-static-inactive` | static, and the sidebar has been toggled closed |
| `layout-overlay-active` | overlay, the sidebar is open, and the viewport is not mobile |
| `layout-sidebar-active` | reveal or drawer, and the sidebar is currently out |
| `layout-sidebar-anchored` | reveal or drawer, and the sidebar is pinned |
| `layout-mobile` | the viewport is at or below the breakpoint |
| `layout-mobile-active` | mobile, and the sidebar has been opened |
| `layout-menu-light` / `-dark` / `-primary` | the chosen menu tint |
| `layout-color-scheme-light` / `-dark` | the chosen color scheme |

The mode class always reflects the **effective** mode, so the off-canvas rules a phone needs come from the
same `layout-overlay` block a desktop overlay uses rather than a parallel mobile-only ruleset. The mode the
user actually chose is emitted separately as `data-layout-mode`, so a configurator can show it even while
the viewport overrides it.

## Mobile is not a mode

At or below **991px** every mode renders off-canvas. This is not user-selectable and never appears in the
picker as a ninth option.

```ts
export function effectiveLayoutMode(state: LayoutConfigState): LayoutMode {
    return state.isMobile ? LayoutMode.Overlay : state.mode;
}
```

Deriving it rather than overwriting `mode` is what lets the chosen mode come back untouched when the
viewport grows again. The mode picker disables its buttons and says so in a sentence rather than
disappearing - a control that vanishes reads as a bug; a disabled control with an explanation reads as a
decision.

The breakpoint is exported as `mobileBreakpoint`, and the media query as `mobileMediaQuery`, so the resize
listener and the stylesheet cannot disagree about where the boundary is.

## Choosing the mode at runtime

The mode lives in one place - `LayoutConfigState` - behind one provider and one hook.

```tsx
import { LayoutConfigProvider, LayoutMode, useLayoutConfig } from '@cratis/scene.blueprint.default';

function ModeButton() {
    const { config, setMode } = useLayoutConfig();
    return (
        <button type='button' aria-pressed={config.mode === LayoutMode.Drawer} onClick={() => setMode(LayoutMode.Drawer)}>
            Drawer
        </button>
    );
}
```

Wrapping the shell in `<LayoutConfigProvider>` is optional - the shell puts one around itself when a host
has not, because a gallery preview hands the renderer one `appShell` element and nothing else. Provide one
yourself when a control outside the shell needs to drive it.

## What is remembered

Mode, menu theme, color scheme, theme name and the pin persist to `localStorage` under
`cratis.scene.blueprint.default`.

Whether the sidebar happened to be open, whether the pointer was over it, and whether the viewport was
narrow are deliberately **not** persisted. Those are facts about a moment rather than preferences, and
restoring them produces a shell that opens in a state nobody chose.

Everything read back is validated against the enums rather than trusted. Storage is shared with every other
script on the origin and outlives the version of the package that wrote it, and an unrecognized mode left
in place would put a class on the wrapper that no rule matches - a shell with no sidebar at all, and no
error to explain it.

## Next

- [Regions and slots](./regions-and-slots.md) - what the modes are moving around.
- [Theme tokens](./theme-tokens.md) - how the modes get their colors.
