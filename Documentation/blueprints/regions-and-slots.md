---
title: Regions and slots
description: Every region the default blueprint's four layouts expose, what fills it, and what happens to it at each size class.
---

The default blueprint exposes nine regions across four layouts. A screen fills them by slot name; the shell
components read the same names.

Three of the layouts are the application shell: `AppShell`, `DashboardShell` and `MinimalShell` share the
same slots and arrangement. The fourth, `FullPage`, has no chrome.

## The AppShell layout

| Slot | Region | Filled with | Rendered when |
| --- | --- | --- | --- |
| `topbar` | the fixed strip across the top | `topbar` | it has content |
| `sidebar` | the sidebar's own chrome, inside the panel the shell positions | `sidebar` | it or `menu` has content |
| `menu` | the navigation itself | one or more `menu` | it or `sidebar` has content |
| `breadcrumb` | the trail above the content | `breadcrumb` | it has content |
| `content` | the screen | a screen template's content | always |
| `footer` | the strip below the content | `footer` | it has content |
| `rightPanel` | the inspector column down the right edge | `rightPanel` | it has content |
| `configPanel` | the floating configurator | `configPanel` | it has content |

## The DashboardShell and MinimalShell layouts

`dashboardShellLayout` and `minimalShellLayout` are the `AppShell` layout under another name. They have the
same slots, the same size-class arrangement and the same navigation outlets, so everything in the table above
holds for them too. What differs is their metadata: the display name a designer shows for each, and the
[menu mode](./layout-modes.md#the-typed-options-and-the-touch-regime) choosing it sets.

| Layout | Export | Display name | Menu mode it starts in |
| --- | --- | --- | --- |
| `AppShell` | `appShellLayout` | Cratis Default | `static` |
| `DashboardShell` | `dashboardShellLayout` | Dashboard | `horizontal` |
| `MinimalShell` | `minimalShellLayout` | Minimal | `slim` |

A screen written for `AppShell` fills `DashboardShell` and `MinimalShell` by the same slot names. Choosing one
only sets the starting mode; the author can change the mode afterwards.

## The FullPage layout

| Slot | Region | Filled with |
| --- | --- | --- |
| `aside` | the branding half of the split | any content |
| `content` | the form, message or hero | any content |
| `configPanel` | the floating configurator | `configPanel` |

## Why a separate full-page layout

Sign-in, register, forgotten password, new password, verification, lock, error, access-denied, not-found
and landing screens have no navigation state, no sidebar to remember and no breadcrumb to place. Hanging
them off the application shell would mean every one of the [eight layout modes](./layout-modes.md) needs an
answer for a page that has no menu.

The split is structural in every PrimeTek template for the same reason. What survives into the full-page
layout is the configurator, because a sign-in page still has to honor the chosen theme - it is very often
the first page anyone sees.

## Where the regions come from

Sakai, PrimeTek's free template, establishes topbar, sidebar, menu, content and footer. The premium line -
Diamond, Atlantis, Freya, Apollo, Ultima, Avalon, Verona - adds the breadcrumb and a right panel. Both sets
are exposed here, because a blueprint covering only the free template's regions forces a fork on anyone who
wants the others.

`aside` is not from that line; it is the branding half of the split every premium sign-in page uses, made a
slot rather than something a screen paints inside `content`.

## What the size class does to them

The `AppShell` arrangement declares three overrides, and `evaluateFlowArrangement` picks the most specific
match.

| Size class | Regions in the flow |
| --- | --- |
| Regular width, regular height | all eight |
| Compact width | topbar, breadcrumb, content, footer, configPanel |
| Compact height | topbar, sidebar, menu, content, rightPanel, configPanel |
| Compact width **and** height | topbar, content, configPanel |

At a compact width the sidebar leaves the *flow* - it is still rendered, off-canvas, over the content,
behind the mask, but it no longer occupies anything. That is a fact about the arrangement, not about CSS.

The `FullPage` arrangement has one override: at a compact width the branding aside drops out entirely
rather than stacking above the form. A sign-in form pushed below the fold by decoration is the worst
possible first screen.

## One vocabulary, three consumers

`SlotName` is a single enum used by the layout definitions, the screen templates and the shell components.
That is deliberate: a slot filled under a name the shell never reads renders nothing *and reports nothing*.
Sharing the enum makes that a compile error where it can be, and the blueprint's specs cover the rest -
every gallery screen is checked against the slots its layout actually declares.

## Nested slot names

A screen template declares slots of its own, from a separate vocabulary (`TemplateSlotName`): `header`,
`body`, `sidePanel`, `toolbar`, `actions`, `stats`, `primary`, `secondary`.

They never collide with the layout's names, because a template's `fitsSlot` is resolved against its direct
parent rather than globally - see [composing screens from templates](./composing-screens.md).
