---
title: Rendering the design system
description: How Scene draws an application from a design system - the resolved model, how a design-system component links to a Scene component, the CSS custom properties the React renderer emits, the default design system, and the attribution of every theme the default blueprint ships.
---

A design system says how an application looks: the token roles it names, the components it is made of, and the values
each theme gives them in each mode. Scene draws an application *from* it. **Components are the contract** between a
design system and the component packages: a component reads its look from anatomy - "my `primary` variant's
`background` in `hover`" - and never from a token name. Products name tokens freely; a package never has to know them.

This replaces the fixed vocabulary of twenty-one `--scene-*` tokens every package used to style from. Nothing reads
that vocabulary any more.

## The resolved design system

`@cratis/scene.model` and `Cratis.Scene.Model` carry the same `DesignSystem`, with the same members, asserted by
`scene-model-shape.json`. It is the *resolved* form: every reference and palette is already followed, so a renderer
never evaluates anything. It is also platform-neutral - a token has a value, a component has parts, and nothing in the
model says what a part becomes in CSS or in a native style.

| Member | What it is |
| --- | --- |
| `modes` | The modes the design system is drawn in (`light`, `dark`, ...). Every theme implements every mode. |
| `tokens` | The token **roles**: a `category` (`color`, `space`, `size`, `radius`, `border`, `shadow`, `font`, `type`, `motion`, `opacity`, `z`), a `name` and what it is for. A role is addressed as `<category>.<name>`. |
| `components` | The components, each with its `parts`, its `variants` (each assigning a role to its parts) and the `states` a variant overrides (`hover`, `focus`, `active`, `disabled`, `selected`). |
| `themes` | The themes that implement it, one flagged `isDefault`. Each has, per mode, the value of every role and - optionally - the components already resolved to values. |
| `words` | The words the product speaks with: voice and naming. |
| `contrastRules`, `contrastFindings` | The contrast every theme must satisfy and what was measured for every theme, mode, component, variant and state. |
| `appearance` | Which roles a profile's accent, focus ring, corners and font replace. A design system owns this because it alone knows which token is its accent. |

The Screenplay-to-Scene conversion fills it from Screenplay's `DesignSystemResolver`; `UiProfile.designSystem` and
`ScenePackage.designSystems` reference it. A profile that names none is drawn from the default design system.

### Resolving it for a profile

`resolveDesign` (TypeScript) and `DesignResolver.Resolve` (C#) decide which theme and mode a profile gets, and apply the
profile's accent, corners and font through the design system's `appearance` bindings. They are the same function,
asserted against `design-resolution-fixtures.json`, so Studio's preview, Stage and generated React cannot disagree.

- The **mode** follows the colour scheme; `System` follows the system. A scheme the design system does not declare as a
  mode uses its first mode and says so.
- The **theme** is the profile's `theme` - one of the design system's own, else one an active package ships (a flat map of
  role values, drawn in the mode it declares) - or the default theme when the name is unknown, with a diagnostic.
- Every part of every variant and state is **evaluated** against the resulting token values; a part whose role has no value
  is reported (`tokenUnresolved`), never guessed. A theme a package ships covers only the roles it knows, so for it the
  package's own fallback applies without a problem.

## Linking: components are the contract

A design-system component finds the Scene component that renders it:

1. **By name**, through the profile's packages, the last package winning - compared without regard to case or separators, so
   `StatusChip` finds `statusChip`.
2. **By `maps to`**, when the design system states one (`mapping.mapsTo`, for example `Cratis.Blueprint.Default.appShell`).

Its variant reaches the Scene component through the **well-known property** - `variant`, else `emphasis`, whichever the component
declares - or through the property and per-variant values the design system states (`mapping.variantProperty`,
`mapping.variantValues`), or the `variantProperty` the component's own anatomy names.

`linkDesignSystem` (C#: `DesignLinker.Link`, asserted against `design-link-fixtures.json`) checks every declared part, variant and
state against the component's anatomy. Mismatches are diagnostics, never silent:

| Code | Meaning |
| --- | --- |
| `componentUnbound` | No active package declares the component (by name or `maps to`). |
| `componentWithoutAnatomy` | The component is found but declares no anatomy. |
| `partUnsupported` | The design system declares a part the component does not draw. |
| `variantUnsupported` | The design system declares a variant the component does not render. |
| `stateUnsupported` | The design system declares a state the component does not react to. |
| `variantPropertyMissing` | There are several variants and no property to choose one by. |

`resolvePackageHost` runs the linking and the design resolution for the approved package set and returns the diagnostics as
`designDiagnostics`, next to the resolved `design`. A host shows them - this is how anything a package cannot render is reported
(invariant I6 in [Layering and seams](../architecture/layering.md)) - and still renders, as well as it can.

## Emitting it: custom properties per mode

The React renderer's theme layer (`@cratis/scene.react`) writes the resolved design onto a wrapping element:

| Custom property | Holds |
| --- | --- |
| `--ds-<component>-<variant>-<part>` | A part of a component's variant, such as `--ds-button-primary-background`. |
| `--ds-<component>-<variant>-<part>-<state>` | The part in a state, such as `--ds-button-primary-background-hover`. It carries the variant's whole look with the state's overrides, so a state never needs the default repeated. |
| `--ds-token-<category>-<name>` | A raw token role, such as `--ds-token-color-text-muted` - for blueprints, which are authored against a design system's vocabulary. A package component reads anatomy instead. |

Each segment is kebab-cased, so `StatusChip` becomes `status-chip`. The rule lives in one place, `designAnatomyProperty` and
`designTokenProperty`; a non-DOM renderer makes its own.

The wrapping element also carries `data-scene-theme`, `data-scene-mode` and `data-scene-color-scheme`, so CSS can key off any of
them. `designStyleSheet` writes a style sheet that carries every mode, selected by `data-scene-mode`, for a host that wants to
switch mode by changing an attribute alone.

`SceneThemeProvider` takes a resolved `design`, or a `theme` (resolved against `designSystem`, the default one when absent). Switching
is live re-resolution rather than a reload: the new values are written onto the element that is already there, so nothing below it
remounts and no state is lost.

```tsx
import { resolveDesign } from '@cratis/scene.engine';
import { SceneThemeProvider } from '@cratis/scene.react';

const design = resolveDesign({ designSystem, theme: 'Daylight', appearance: { colorScheme: ColorScheme.Dark } });

<SceneThemeProvider design={design}>{/* the application */}</SceneThemeProvider>;
```

## The default design system

`blueprint.default` ships a default design system, **Scene Default**, so an application that names none looks exactly as it always
did. The twenty-one tokens (and the font) are recast as the roles of a design system - the *what*, `color.primary`, `radius.content`,
`shadow.focus-ring` - and the shell and foundation components read them through anatomy. The twelve components:

| Component | Parts | Variants | States |
| --- | --- | --- | --- |
| `Shell` | `background`, `text`, `font` | `default` | |
| `Page` | `background`, `text`, `font` | `default` | |
| `Topbar` | `background`, `text`, `border` | `default` | |
| `Sidebar` | `background`, `text`, `border` | `default`, `primary` (the `menuTheme` option) | |
| `Menu` | `background`, `text`, `border`, `radius` | `default` | `hover`, `selected` |
| `Popover` | `background`, `text`, `border`, `radius` | `default` | `hover`, `selected` |
| `Footer` | `background`, `text` | `default` | |
| `Text` | `text`, `font` | `default`, `muted` | |
| `Card` | `background`, `text`, `border`, `radius` | `default` | |
| `Button` | `background`, `text`, `border`, `radius`, `shadow` | `primary` | `focus` |
| `Input` | `background`, `text`, `border`, `radius`, `shadow` | `default` | `focus` |
| `StatusChip` | `text`, `background` | `success`, `warning`, `danger`, `info` | |

| Role | Used for |
| --- | --- |
| `color.primary` | brand accent, active states, primary buttons |
| `color.on-primary` | text and icons on the primary color |
| `color.background` | the page canvas behind everything |
| `color.surface` | topbar, sidebar, cards, panels |
| `color.border` | every divider and outline |
| `color.hover` | hover states on menu items and buttons |
| `color.overlay` | floating submenus and popups |
| `color.text` | body text |
| `color.text-muted` | secondary text, footer, section titles |
| `color.highlight`, `color.on-highlight` | the current menu item's background and text |
| `color.success`, `color.success-surface` | a good outcome: a positive trend, an approved step, a success chip |
| `color.warning`, `color.warning-surface` | something needing attention: a partial load, a pending approval |
| `color.danger`, `color.danger-surface` | a problem: an error, a negative trend, a rejection |
| `color.info`, `color.info-surface` | neutral information |
| `radius.content` | every rounded corner |
| `shadow.focus-ring` | the keyboard focus indicator |
| `font.sans` | the font of the whole application; set by the profile's `appearance.font`, otherwise the theme's own |

Each status pair is a text color and its tinted background, chosen to keep WCAG AA contrast against its partner in both shipped
themes - the Chromium audit of the foundation components asserts that, and `contrastFindings` carries the measured evidence. A status
is never told by color alone: every chip also carries an icon and its text.

The design system binds the profile's appearance through `appearance`: the accent replaces `color.primary` (and derives
`shadow.focus-ring`), the corner style `radius.content`, the font `font.sans`. A design system that does not bind one ignores the
choice and says so (`appearanceNotBound`).

### Two forms of the same palette

The themes the blueprint ships exist in two forms with **one definition**: as the two flat `Theme`s *Scene Default Light* and *Scene
Default Dark* (values keyed by role, for the packages and profiles that name a theme), and as the two modes of the design system's own
theme *Scene Default*. A palette cannot drift between them.

## The bridge

The blueprint's stylesheet aliases the anatomy into `--layout-*` locals exactly once, at the top, and no rule below references a
`--ds-*` name:

```css
.layout-wrapper,
.layout-full-page {
    --layout-primary: var(--ds-button-primary-background, #4f46e5);
    --layout-primary-contrast: var(--ds-button-primary-text, #ffffff);
    --layout-background: var(--ds-shell-default-background, #f4f5f7);
    --layout-card: var(--ds-card-default-background, #ffffff);
    --layout-border: var(--ds-card-default-border, #e2e5e9);
    --layout-hover: var(--ds-menu-default-background-hover, #eceef1);
    --layout-overlay: var(--ds-popover-default-background, #ffffff);
    --layout-text: var(--ds-text-default-text, #1f2430);
    --layout-text-muted: var(--ds-text-muted-text, #6b7280);
    --layout-highlight: var(--ds-menu-default-background-selected, #eef2ff);
    --layout-highlight-text: var(--ds-menu-default-text-selected, #3730a3);
    --layout-radius: var(--ds-card-default-radius, 0.5rem);
    --layout-focus-ring: var(--ds-button-primary-shadow-focus, 0 0 0 2px rgb(79 70 229 / 0.4));
}
```

That single seam is what makes the shell design-system-agnostic. Swap the theme and every mode restyles; take over the look by
overriding anatomy rather than editing a rule. The fallbacks are the default design system's light values so an unstyled shell is
legible rather than invisible - they are a safety net, not a palette.

`@cratis/scene.components` and `@cratis/scene.primereact` each keep their own bridge, from the same anatomy to their own variables
(`--cratis-*` and `--p-*`); see their theming pages.

## Applying a theme

`LayoutThemeProvider` resolves whichever theme the shell's configuration currently names and hands it to `SceneThemeProvider`:

```tsx
import { LayoutConfigProvider, LayoutThemeProvider } from '@cratis/scene.blueprint.default';

<LayoutConfigProvider>
    <LayoutThemeProvider>{/* the shell */}</LayoutThemeProvider>
</LayoutConfigProvider>;
```

Pass your own `themes` to offer brand palettes instead of the shipped two. The configurator only ever records a *name*, so
substituting the theme set changes nothing about the switcher.

## Theme attribution

The `Theme` record carries `author`, `authorUrl` and `license` for exactly this purpose, and a blueprint must fill them in.

| Theme | Author | Link | License |
| --- | --- | --- | --- |
| Scene Default Light | Cratis | <https://cratis.io> | MIT |
| Scene Default Dark | Cratis | <https://cratis.io> | MIT |

Both palettes are original to Cratis - a neutral grey ramp with an indigo accent - rather than adopted from an existing preset, which
is why `author` says so rather than being left blank. A theme with empty attribution reads as "nobody has checked", and once a palette
is lifted from somewhere else without its credit, nobody can tell afterwards which of the two it was.

:::important
If you adopt a palette from an existing free theme, fill `author`, `authorUrl` and `license` from the source package's own LICENSE file.
Verify it rather than assuming - "it's free" and "it's MIT" are not the same claim.
:::

## Compatibility is declared, not assumed

A theme lists every package it is known to work with:

```ts
export const blueprintThemeCompatibility: string[] = ['core', defaultBlueprintName, 'PrimeReact', 'Cratis.Components', 'Tailwind'];
```

`core` is on that list on purpose. `incompatiblePackages` has **no implicit exemption** for it, so a theme omitting it is reported
incompatible for `core` with every profile that lists it - which is every profile, since `core` is the fallback vocabulary. The
exemption was left out of the engine deliberately, so that "compatible with everything active" has to be stated rather than assumed.

An incompatible pairing is a warning rather than an error: the theme might still work by coincidence, but the gap has to be visible.

## Both modes define the same roles

Deliberately the same roles in both, and nothing more. A dark theme that introduced extra roles would work only for the parts of the
shell written after it existed. The roles are the contract, and both modes filling them identically is what makes switching a swap
rather than a re-render with holes in it.

## See also

- [Component anatomy for package authors](../component-anatomy.md) - declaring the parts, variants and states a component supports.
- [Layering and seams](../architecture/layering.md) - invariant I6: nothing is dropped silently.
