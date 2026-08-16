# Scene

Scene is the object model and runtime for describing a user interface without describing a platform.

A `.play` document says an application has an invoice list screen with a table of invoices and an action that
opens a form. It does not say whether that renders as PrimeReact on the web, SwiftUI on a phone, or something
that does not exist yet. Scene is where that description becomes a structure a renderer can execute — and
where the decisions that make it concrete (which component library, which visual theme, which application
shell) are made explicitly rather than assumed.

## The three halves

Scene is deliberately split so that nothing platform-specific can leak into the model:

| Part | Stack | Responsibility |
|---|---|---|
| `Cratis.Scene.Model` / `@cratis/scene.model` | C# (source of truth) + a TypeScript mirror | The object model. Records only — screens, layouts, templates, forms, contribution points, profiles, themes, packages. No React, no DOM, no CSS vocabulary anywhere. |
| `Cratis.Scene.Engine` / `@cratis/scene.engine` | C# + TypeScript | The algorithms over that model — package and component-name resolution, dependency ordering, layout evaluation, size classes, contribution aggregation, theme compatibility. Both implementations assert against a shared fixture corpus so they cannot drift. |
| `@cratis/scene.react` | TypeScript | One renderer. It implements the engine's renderer contract against real React and DOM, so `Scene.Native` and `Scene.Desktop` are sibling positions rather than special cases. |

Stage executes the model to ship an application. Studio edits it. Neither is part of Scene.

## Vocabulary

Four words carry most of the weight, and they are easy to confuse. They are not interchangeable:

- **[Layout](blueprints/layouts.md)** — an application's base navigational look: the shell with its top bar,
  navigation and content region. An application has **one**, and selects it.
- **[Screen template](blueprints/screen-templates.md)** — a reusable shape that goes *inside* that layout, at
  module, feature or slice level. An application has **many**. Each declares which of its parent's slots it
  fills, so templates nest arbitrarily deep by one rule rather than several.
- **Dialog template** — the same idea for content that opens *over* an application rather than sitting inside
  it. It fills no slot, because it occupies none.
- **Screen** — an instance. It names the structure it fills and provides the content that fills it.

## Packages

A `ui profile` lists packages by name and resolves component names against them in priority order. A
[package](packages/index.md) is the declaration behind such a name: what it contributes, and what else has to
be active for it to work.

- A **component library** declares component names — PrimeReact, Cratis Components, and the built-in `core`
  fallback.
- A **styling** package contributes a CSS system rather than components; component libraries depend on it to
  say what they are written against.
- A **blueprint** ships the shape of an application: its layouts, the screen and dialog templates built on
  them, and the components that fill their slots. An application selects one blueprint and gets a coherent
  set, rather than assembling parts from unrelated sources.

Dependencies between packages are declared, resolved and ordered, so "Cratis Components needs PrimeReact and
Tailwind" is a fact the tooling can check rather than a note in a README.
