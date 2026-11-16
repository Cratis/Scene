---
title: The design system starter
description: The design system a product or application starts from when it has none - Scene's default design system as Screenplay, with its theme, shell, page patterns and profile - and how a host takes it.
---

A product with no design system of its own still has to look like something. `Cratis.Scene.Design.DesignSystemStarter` is what it starts from: **Scene's default
design system written as Screenplay**, so the product looks like the default on the first screen and becomes its own as the design system is changed. It lives in Scene once, so
every host that offers "start from a design system" gives the same one.

## What it gives

| Piece | What it is |
| --- | --- |
| **Design system** | `{name}Design`, in a light and a dark mode: the 22 token roles of the default design system (`color.primary`, `color.surface`, `radius.content`, `shadow.focus-ring`, `font.sans` ...), the twelve shell and foundation components that read them through anatomy (Shell, Page, Topbar, Sidebar, Menu, Popover, Footer, Text, Card, Button, Input, StatusChip), and the rule that text on its background keeps a contrast of at least 4.5. |
| **Theme** | `{name}`, the default theme of the design system: the palette of the default theme - a neutral grey ramp with an indigo accent - in a light and a dark mode, compatible with `Cratis.Components`. Every role has a value in both modes. |
| **Shell** | The `AppShell` layout, with a topbar, a sidebar, the content and a footer. |
| **Page patterns** | `Sheet`, `MasterDetail`, `SettingsPage` and `EmptyState` screen templates, in a `Workspaces` module, and a `Dialog` template with a body and actions. |
| **Profile** | `Desktop`: web, regular size, rooted in `AppShell`, new screens from `Sheet`, drawing from `Cratis.Components`, with the theme. |

The roles, the anatomy and the palette are those of `defaultBlueprintDesignSystem` in `@cratis/scene.blueprint.default`. `default-design-system-fixture.json` records them; the TypeScript
package asserts the fixture against the default it ships and the C# package asserts the starter against the fixture, so the starter cannot drift from the default.

## Taking it

```csharp
using Cratis.Scene.Design;

// The whole starter: shell, page patterns, profile, design system and theme.
string screenplay = DesignSystemStarter.Create("Acme Shop");

// Only the design system and its theme, for a host that works on the design system alone.
string designSystem = DesignSystemStarter.CreateDesignSystem("Acme Shop");

// The same for the default name, "Product".
string starter = DesignSystemStarter.Screenplay;
string designSystemOnly = DesignSystemStarter.DesignSystemScreenplay;
```

The name is the product's or application's. The design system is `{name}Design` and the theme is `{name}`; the name is made an identifier - anything that is not a letter or a digit is
dropped and the next letter is capitalized, so `Acme Shop` gives `AcmeShopDesign` and `AcmeShop`. A name with nothing left, or one that starts with a digit, is prefixed with `Product`. `DesignSystemName` and `ThemeName` give the names a host should expect to find in the Screenplay it takes.

## What a host does with it

The starter is Screenplay *text*. A host that has no design system for a product puts the text where it keeps the product's Screenplay, or hands it to the design-system draft and works from there:
the design system turn of [Design with AI](ai.md) reads it, a person changes it in the design system editor, and Scene resolves it like any other.

It is a starting point: the host does not edit the starter, it edits the Screenplay the starter produced. The starter is guaranteed to compile with `Cratis.Screenplay` without a diagnostic and to resolve without
a design problem - every token has a value in every mode of its theme, every part uses a role that exists, and the contrast rule is met - and the specs of `Cratis.Scene.Design` assert both.
