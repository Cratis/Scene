---
title: UI profile designer contract
description: What a host - Studio, Stage, a CLI or an agent - may rely on when it designs, previews or runs an application's UI profile - the shell, its options, the navigation rules N1 to N8 and which function answers each question.
---

A UI profile is the application's **shell and its look**: the root template, the options it exposes, the appearance and the defaults that
new screens start from. A *designer* for it - Studio's UI profile page is one - is a thin surface: a structure tree, a live canvas and a
properties panel. It owns **no rule**. Every question it asks has one answer in Scene, shared by Stage and generated React, so what the
designer shows is what runs.

## Who answers what

| Question | Answered by | Package |
| --- | --- | --- |
| What shell does this application have? | `resolveEffectiveShell` (`ShellResolver.Resolve` in C#) | `@cratis/scene.engine` |
| Which templates can be the shell / a new screen? | `applicableTemplates` at the `Application` or screen scope | `@cratis/scene.engine` |
| Is the pin satisfied, is there a content slot, is the theme compatible? | `diagnostics` of the effective shell (codes in [the root template](root-template.md#diagnostics)) | `@cratis/scene.engine` |
| What is a profile's canonical text? | `parseUiProfile` / `serializeUiProfile` (`UiProfileJson` in C#), fixtures `ui-profile-fixtures.json` | `@cratis/scene.engine` |
| What navigation does the module on the page have? | `effectiveNavigation` (inherit / extend / override) | `@cratis/scene.engine` |
| Where can the preview go? | `listDestinations(document)` - pages, states, dialogs | `@cratis/scene.blueprint.default` |
| How does the shell render and navigate? | `ScenePreviewHost` / `ApplicationHost` | `@cratis/scene.blueprint.default` |
| How does a click behave in a design host? | `NavigationActivationProvider` (`navigationMode`, `onActivate`, `onNavigate`) | `@cratis/scene.react` |

A host that needs a rule not in this table asks for it in Scene; it does not write it down in its own code (REN2). Both engines are
asserted against the shared JSON fixtures named in each reference page (REN1).

## Navigation rules

The shell's menu, topbar, sidebar, breadcrumb, logo and user menu are real controls. These rules hold in `ScenePreviewHost`, `ApplicationHost`
(Stage) and anything built on `SceneNavigationHost`.

| Rule | Behaviour |
| --- | --- |
| **N1** Navigate | A click on an item resolves its target and renders it in the item's slot; the item becomes active (`aria-current="page"`) and the breadcrumb follows. Going to another module swaps the effective navigation. History is in memory (`createMemorySceneHistory`): the address of the page that hosts the preview is **never written**. |
| **N2** Select vs navigate | A design host sets `navigationMode="select"` (or a function per control) so a click only reports the item through `onActivate`; **Alt-click selects without navigating in any mode**. `navigate` is the default, which is what an end user and Stage get. |
| **N3** Showing | `listDestinations(document)` returns the groups **Pages**, **States** and **Dialogs**. A `destination` from it is valid for `initialDestination`, for `navigate(...)` and for a *Showing* picker. |
| **N4** Derived state | Active state and the breadcrumb come from the history location, not from an `isActive` prop (kept for Storybook and static renders). A `breadcrumb` with no `items` shows the module and features of the screen on the page (`followLocation: false` opts out); authored `items` win. |
| **N5** Gallery | A blueprint with no authored structure still navigates: `galleryApplication()` + `galleryComposition` make every gallery menu entry a screen of a document. Use `target={{ application }}` to preview it. |
| **N6** Shell around the screen | A host draws the effective shell around the screen being edited by composing the screen through `composeApplicationScreen` and hosting it in `ApplicationHost`; the screen sits in the shell's primary outlet. |
| **N7** Keyboard | One roving tab stop per region; arrows move between items; Enter activates (navigates, or selects in `select` mode). |
| **N8** Dead targets | An item whose target does not resolve - a missing target, or a screen the host does not render - carries `data-nav-problem="navTargetMissing"` (a warning glyph) and does nothing when activated. The engine reports the same condition as `navTargetMissing`. |

### Host hooks

```tsx
<ScenePreviewHost
    document={document} structure={structure} navigation={navigation} registry={registry}
    target={{ application: 'Contoso' }}            // or { module, feature } / { slice }
    initialDestination={{ screen: 'sales.orders' }} // or { dialog: 'ConfirmDialog' }
    navigationMode='select'                         // design host: a click selects
    onActivate={activation => select(activation.request.id)}
    onNavigate={destination => showInPicker(destination)} />
```

`activation` is `{ request: { source, id, label, destination, item }, mode, resolves, navigated }`; `source` is `region`, `menu`,
`breadcrumb`, `logo` or `userMenu`.

## Authoring rules for a profile

- Write `root` (never only `layout`); pin blueprint templates with a range; keep `options` to the shell's own names.
- Let `resolveEffectiveShell` decide fallbacks and show its diagnostics as they are; do not repair a profile silently.
- Do not store a session-only override (a selected viewport, a peeked destination) in the profile.
- Everything a designer edits is a member of `UiProfile`, so it round-trips through the canonical JSON and the Screenplay `ui profile` block.
