---
title: The application hierarchy and toolbars
description: How a screen records the modules and features it was declared in, how navigation items carry that hierarchy, and how toolbar items execute destinations and honour their presentation.
---

An application is a hierarchy - modules containing features containing slices - and a host that draws navigation
should draw that hierarchy, not a flat list of screen names.

## Where a screen sits

`Screen.path` (`Screen.Path` in .NET) holds the modules and features, outermost first, the screen was declared in:

```json
{ "name": "WorkItemList", "path": ["Workspaces", "Tracking"] }
```

It is the structural identity a destination's `module` and `feature` resolve against, and it lets a host group a
screen under its place in the hierarchy even when no navigation entry lists it. A screen outside any module has an
empty or absent `path`.

## Navigation items carry their hierarchy

A `Navigation` contribution's `NavigationItem` records the same thing in `hierarchy` - the modules and features it
was declared in. A contribution may sit on a module, on a feature at any depth, or inside a screen. `extractNavigationItem`
reads the full authored item: `id`, `label`, `icon`, `presentation`, `targetScreen`, `destination`, `order`, `group`
and `hierarchy`.

## Toolbars

The `core` package renders `core:toolbar` and its `core:toolbarItem` elements, so a toolbar a document authors is
a toolbar on the screen rather than a placeholder.

| Property | Meaning |
| --- | --- |
| `name`, `label`, `icon` | The item's identity, text and icon |
| `kind` | `Action` announces the command in `target` with `cratis.scene.command`; `Navigate` and `Dialog` execute a destination |
| `target` | The command, screen or dialog template |
| `parameters` | Bindings resolved when the item is activated - command arguments or route parameters |
| `destination` | Where the item opens; when absent a `Navigate` item opens the screen `target` and a `Dialog` item the dialog `target` |
| `presentation` | Hints by name. `mode` is `icon`, `text` or `both` (the default); every hint is also exposed as `data-scene-presentation-<name>` |

A destination executes through the enclosing navigation host - a screen in an outlet, or a dialog - and is announced with
the host-neutral `cratis.scene.navigate` event (carrying `targetScreen`, `dialog` and `destination`) outside one. An
icon-only item keeps its label as its accessible name.
