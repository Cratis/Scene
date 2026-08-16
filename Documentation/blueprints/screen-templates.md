---
title: Screen and dialog templates
description: The reusable shapes that go inside a layout - how fitsSlot composes them into a tree, and how a screen instantiates one.
---

A [layout](layouts.md) is the shell. A screen template is a reusable shape that goes *inside* it.

```csharp
public record ScreenTemplate(
    string Name,
    string? FitsSlot,
    IReadOnlyList<Slot> Slots,
    Arrangement? Arrangement = null,
    IReadOnlyDictionary<string, IReadOnlyList<SceneElement>>? Content = null,
    string? DisplayName = null,
    string? Description = null);
```

An application has one layout and many screen templates — typically one per module, feature or slice that
needs a shape of its own.

## `FitsSlot` is what makes them nest

A template states where it belongs. It is not told by whatever happens to host it:

```text
AppShell (layout)
  slots: topbar, sidebar, content, footer
        │
        └── ModuleWorkspace (screen template)
              fitsSlot: "content"
              slots: moduleNav, moduleContent
                    │
                    └── FeatureList (screen template)
                          fitsSlot: "moduleContent"
                          slots: list, details
                                │
                                └── SliceDetail (screen template)
                                      fitsSlot: "details"
```

A module's template fits a slot on the application layout. A feature's template fits a slot the module's
template declares. A slice's fits one the feature's declares. **The same rule at every level** — there is no
separate mechanism for "module-level" versus "feature-level" nesting, and no depth limit falls out of the
design.

`FitsSlot` is nullable for a template placed explicitly rather than by declaration.

## Qualifying a slot when the name is not enough

`body` is a good name for a slot at every level of a chain, so several templates legitimately declare one.
A bare `body` then has no single answer, and resolution reports it as unplaced with the candidates rather
than guessing — putting a template in the wrong parent renders content in the wrong region, which is far
harder to diagnose than being told the name is ambiguous.

Qualify it with the container to settle it:

```csharp
new ScreenTemplate("FeatureSection", "ModuleWorkspace.body", [new Slot("body")]);
new ScreenTemplate("SliceSection", "FeatureSection.body", []);
```

This is the same rule component names use: a bare name searches, a qualified one goes straight to what it
names. Everything before the last `.` is the container, everything after is the slot. A qualifier naming a
container that does not declare that slot is unplaced too — it is never quietly downgraded to a search.

Note that a bare name only becomes ambiguous once *more than one other* container declares it. A template
never competes with itself, so a two-level chain where both levels declare `body` still resolves.

## Slots and content

`Slots` are what this template offers to whatever it contains — the next level down. `Content` is what the
template brings with it: the chrome that is part of the template rather than part of any screen based on it.
A template with an empty `Content` is purely structural.

That split is what makes a template reusable. Two features can share `FeatureList` and get the same
structure, header and toolbar, while each supplies its own list and detail content.

## Screens

A screen is the instance:

```csharp
public record Screen(
    string Name,
    string Layout,
    IReadOnlyDictionary<string, IReadOnlyList<SceneElement>> SlotContent,
    IReadOnlyList<Form> Forms,
    IReadOnlyList<Contribution> Contributions,
    string? ScreenTemplate = null);
```

`Layout` names the application shell the screen ultimately renders inside. `ScreenTemplate` names the
template it fills, or is null when the screen fills the layout's slots directly. The template's `FitsSlot` is
what decides *where* it lands — so a screen never has to state its own position, and moving a template moves
every screen based on it.

## Dialog templates

```csharp
public record DialogTemplate(
    string Name,
    IReadOnlyList<Slot> Slots,
    Arrangement? Arrangement = null,
    IReadOnlyDictionary<string, IReadOnlyList<SceneElement>>? Content = null,
    string? DisplayName = null,
    string? Description = null);
```

Identical, minus `FitsSlot`. A dialog occupies no slot: it opens over the application, summoned by something,
rather than being placed by a containing layout.

Everything else is the same on purpose. A confirmation dialog and a detail screen are both "slots with an
arrangement, filled with content", and there is no reason for an author to learn that twice.
