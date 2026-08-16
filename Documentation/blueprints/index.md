# Blueprints

A blueprint is a package that ships the shape of an application: its layouts, the screen and dialog templates
built on them, and the components that fill their slots.

An application selects **one** blueprint. That is the point — a blueprint is a coherent set, designed
together, rather than a layout from one place and templates from another that happen not to clash. In the
application's settings you pick a blueprint, and everything it holds becomes available.

A blueprint declares the component libraries it is built from, like any other package:

```csharp
new ScenePackage(
    Name: "Cratis.Blueprint.Default",
    Version: "1.0.0",
    Kind: PackageKind.Blueprint,
    Dependencies: [new PackageDependency("PrimeReact"), new PackageDependency("Cratis.Components")],
    Components: ["appShell", "topbar", "sidebar", /* ... */],
    Layouts: ["AppShell", "FullPage"],
    ScreenTemplates: ["ModuleWorkspace", "FeatureList", /* ... */],
    DialogTemplates: ["Confirm", /* ... */],
    Themes: ["Daylight", "Midnight"]);
```

Because those dependencies are declared, "which blueprints can I use" is answerable from the packages a
profile already has, rather than being something you find out by trying one.

## Layout, template, screen

These three are easy to run together and mean different things.

A **[layout](layouts.md)** is the application's base navigational look — the shell, with its top bar,
navigation and content region. An application has one.

A **[screen template](screen-templates.md)** is a reusable shape that goes *inside* that shell, at module,
feature or slice level. An application has many. Each declares which of its parent's slots it fills, so a
module's template fits the layout, a feature's template fits the module's, and a slice's fits the feature's —
the same rule at every level, nesting arbitrarily deep without a second mechanism.

A **dialog template** is the same idea for content that opens *over* the application. It declares no parent
slot, because it occupies none: a dialog is summoned, not placed.

A **screen** is an instance. It names the structure it fills and supplies the content.

Layouts and screen templates are structurally alike on purpose — both are slots plus an arrangement,
evaluated by the same engine. They differ in role, and a screen template additionally says where it belongs.

## What a blueprint is not

A blueprint is a **packaged artifact, not a language construct**. It never appears in a `.play` file. A
`ui profile` lists it by name in `packages` like anything else; the layouts and templates it provides are
then resolvable by name, exactly as its components are.

## The default blueprint

`@cratis/scene.blueprint.default` is the one you get for free: two layouts, eight menu modes, twenty-three
screen templates, three dialog templates and two themes.

- **[Use the default blueprint](getting-started.md)** — render a screen, switch its mode, switch its theme.
- **[Understanding blueprints](understanding-blueprints.md)** — how a blueprint differs from a component
  library, and when it is the wrong fit.
- **[Composing screens from templates](composing-screens.md)** — how a nested template chain is placed, and
  what the size class does to an arrangement.
- **[Regions and slots](regions-and-slots.md)** — every region the two layouts expose.
- **[Layout modes](layout-modes.md)** — all eight modes, and the mobile regime nobody chooses.
- **[The template set](template-set.md)** — every screen and dialog template it ships.
- **[Theme tokens](theme-tokens.md)** — the thirteen shared tokens, and every theme's attribution.
- **[Ship your own blueprint](ship-your-own-blueprint.md)** — when the default is not your look.
