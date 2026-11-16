---
title: Component anatomy for package authors
description: Declare the parts, variants and states your Scene component supports, read them from CSS custom properties, and see every mismatch reported.
---

A design system does not tell your component which token to use. It declares **anatomy** for the component - the parts it is
made of, the variants it comes in and the states it reacts to - and your component reads that. This is the contract between a
design system and the component packages, and it is what lets any design system restyle any package that declares the same
anatomy. See [Rendering the design system](blueprints/design-system.md) for the model and the renderer.

## Declare the anatomy

Every component descriptor can declare a `ComponentAnatomy`:

```ts
interface ComponentAnatomy {
    parts: string[];            // text, background, border, radius, height, padding, shadow, font
    variants: string[];         // primary, secondary, ... - empty for a single look
    states: string[];           // hover, focus, active, disabled, selected
    variantProperty?: string;   // the property that chooses the variant; default variant, else emphasis
}
```

`describeComponents` takes a table of anatomy keyed by the bare component name, next to the metadata table, so a package declares it
in one place:

```ts
import { componentAnatomy, describeComponents } from '@cratis/scene.react';

export const myAnatomy = {
    button: componentAnatomy(['background', 'text', 'border', 'radius', 'shadow'], ['primary'], ['hover', 'focus', 'active'], 'severity'),
    card: componentAnatomy(['background', 'text', 'border', 'radius'], ['default']),
};

export const myDescriptors = describeComponents('My.Package', described, metadata, myAnatomy);
```

Declare only what the component really draws. A part, variant or state you declare is a promise that it is rendered; one you leave
out is reported to the host when a design system asks for it, so the gap is visible rather than approximated.

Shell and chrome are components like any other: `Page`, `Shell`, `Topbar`, `Sidebar`, `Menu`, `Popover`, `Footer`, `Card`, `Text`,
`Button`, `Input` and `StatusChip` are the ones the default design system declares. A package that draws one of them declares the same
parts, variants and states.

## How a design-system component finds yours

1. **By name** - through the profile's packages, the last package winning, compared without regard to case or separators:
   a design-system `StatusChip` finds your `statusChip`.
2. **By `maps to`** - when the design system names your component explicitly (`maps to Cratis.Blueprint.Default.appShell`).

The chosen variant reaches your component through its **`variant`** property, else **`emphasis`** - whichever your descriptor declares.
If your property has another name, say so in `variantProperty`. The design system may also state the property and the value each of its
variants takes (`variantProperty`, `variantValues`) when its variant names differ from yours.

## Read the anatomy as CSS

The React renderer writes each part as a custom property on the themed element:

```
--ds-<component>-<variant>-<part>             --ds-button-primary-background
--ds-<component>-<variant>-<part>-<state>     --ds-button-primary-background-hover
```

A state's property carries the variant's whole look with the state's overrides, so you can read it without repeating the default.
Alias the properties you use into locals of your own exactly once - as `@cratis/scene.blueprint.default` does with `--layout-*` and
`@cratis/scene.primereact` does with `--p-*` - and keep a fallback so an unstyled component is legible:

```css
.my-button {
    --my-button-background: var(--ds-button-primary-background, #4f46e5);
    --my-button-text: var(--ds-button-primary-text, #ffffff);
    --my-button-radius: var(--ds-button-primary-radius, 0.5rem);

    background: var(--my-button-background);
    color: var(--my-button-text);
    border-radius: var(--my-button-radius);
}

.my-button:hover {
    --my-button-background: var(--ds-button-primary-background-hover, var(--ds-button-primary-background, #4338ca));
}
```

Never read a token role (`--ds-token-*`) from a package component. Roles are for blueprints, which are authored against one design
system; a package that read a role name would only work with the design systems that happen to name it.

To scope a bridge to the themed element, match `[data-scene-theme-root]` (or `[data-scene-theme]`), never `:root`: the properties do
not exist at the document root, and a `:root` rule would resolve every mapping to nothing.

## See what is reported

`resolvePackageHost` returns `designDiagnostics` for the profile - every component nobody renders, every component without anatomy, and
every part, variant or state your component does not support. `linkDesignSystem` gives the same as structured diagnostics
(`componentUnbound`, `componentWithoutAnatomy`, `partUnsupported`, `variantUnsupported`, `stateUnsupported`, `variantPropertyMissing`).
The C# engine has the same linker, `DesignLinker`, and both are asserted against one shared corpus.

`validatePackageBundle` checks the manifest's `designSystems` against the bundle's, so a package that ships a design system declares it.
