---
title: UI profile designer contract
description: What a host - Studio, Stage, a CLI or an agent - may rely on when it designs, previews or runs an application's UI profile - the shell, its options, the navigation rules N1 to N9 and which function answers each question.
---

A UI profile is the application's **shell and its look**: the root template, the options it exposes, the appearance and the defaults that
new screens start from. A *designer* for it - Studio's UI profile page is one - is a thin surface: a structure tree, a live canvas and a
properties panel. It owns **no rule**. Every question it asks has one answer in Scene, shared by Stage and generated React, so what the
designer shows is what runs.

The reference design for how a designer behaves - the interactive prototype, its walkthrough and a screenshot of every state - is in [the UI profile designer prototype](ui-profile-designer-prototype/index.md).

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
| Which regions does the shell expose, and where is one drawn? (N9) | `describeRegions` (`ProfileRegions.Describe`), fixtures `shell-regions-fixtures.json`; `onRegionHover`, `onRegionActivate`, `regions.regionRect` of the preview host | `@cratis/scene.engine`, `@cratis/scene.blueprint.default` |
| What are the application's name and logo, and what is drawn? | `resolveProfileIdentity` (`ProfileIdentityResolver`), fixtures `profile-identity-fixtures.json` | `@cratis/scene.engine` |
| What do the colour scheme, accent, corners and font resolve to? | `resolveAppearance` (`AppearanceResolver`), `fontCatalog`, fixtures `profile-appearance-fixtures.json` | `@cratis/scene.engine` |
| Which menu modes and menu themes are there, what does each do, what is the mode after choosing a shell? | `navigationModes`, `describeMenuBehavior`, `menuModeAfterShellSwitch` (`ShellOptions`), fixtures `shell-options-fixtures.json` | `@cratis/scene.engine` |
| What is wrong with the profile, how bad is it and what fixes it? | `findProfileProblems` and `applyProfileFix` (`ProfileBlockers.FindProblems`, `ApplyFix`), `contrastAgainstWhite`, fixtures `profile-blockers-fixtures.json` | `@cratis/scene.engine` |
| What is in the package list, what can be added, what happens on a move or a remove? | `describePackageList`, `addPackage`, `removePackage`, `movePackage`, `chooseBlueprint`, `chooseTheme`, fixtures `package-list-fixtures.json` | `@cratis/scene.engine` |
| What do the pickers show - shells, themes, version rule, my own shell? | `describeShellCards`, `describeThemeCards`, `switchColorScheme`, `describeVersionRule`, `describeOwnShellValue`, fixtures `profile-pickers-fixtures.json`; `menuModeCards` | `@cratis/scene.engine`, `@cratis/scene.blueprint.default` |
| What is a sample data pack, and how is a status drawn? | `describeSampleDataCatalog`, `classifySampleStatus`, fixtures `sample-data-resolution-fixtures.json` | `@cratis/scene.engine` |

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
| **N9** Regions | The shell marks five regions in the DOM with `data-scene-region`: `identity` (the logo and name wherever drawn), `shell` (the top bar), `menu` (the sidebar, or the items in the top bar in Horizontal), `content` (the content card) and `accent` (the primary action). An element carries at most one; a region drawn twice (identity in the top bar and in an open menu panel) reports the same id, and the host picks the drawn one. `onRegionHover(region \| null)` and `onRegionActivate(region)` report the pointer; a click on a navigation item still navigates (N1) **and** reports `menu`; neither navigates in `select` mode or on Alt-click. `regions.regionRect(id)` gives the box in the preview's own unscaled pixels, so it stays right when the host scales or scrolls the preview, and nothing when the region is not drawn (the engine's `describeRegions` names the one to use instead - a closed Overlay or Drawer menu falls back to `shell`). The hamburger is not a region. Each drawn region is one tab stop; Enter selects it. The other blueprints (CRM, administration, approvals ...) do not yet mark regions: only the default blueprint's shells do. |

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

Hover, click and measurement for the regions of rule N9:

```tsx
const regions = useRef<PreviewRegionHandle>(null);
<ScenePreviewHost {...props} viewportWidth={390} regions={regions}
    onRegionHover={region => highlight(region && regions.current?.regionRect(region))}
    onRegionActivate={region => scrollInspectorTo(describeRegions(mode, touch, open).find(r => r.id === region)!.section)} />
```

`activation` is `{ request: { source, id, label, destination, item }, mode, resolves, navigated }`; `source` is `region`, `menu`,
`breadcrumb`, `logo` or `userMenu`.

## Authoring rules for a profile

- Write `root` (never only `layout`); pin blueprint templates with a range; keep `options` to the shell's own names.
- Let `resolveEffectiveShell` decide fallbacks and show its diagnostics as they are; do not repair a profile silently.
- Do not store a session-only override (a selected viewport, a peeked destination) in the profile.
- Everything a designer edits is a member of `UiProfile`, so it round-trips through the canonical JSON and the Screenplay `ui profile` block.

## Decisions and open questions

The walkthrough of [the prototype](ui-profile-designer-prototype/index.md) left these open. They are recorded here so a change is a visible change.

| Question | State |
| --- | --- |
| Does a blueprint **own** the menu mode, or only **suggest** a default? | **Decided: it suggests.** Choosing a shell sets the mode (`menuModeAfterShellSwitch`) and the author may change it afterwards. Revisit if shells appear whose chrome cannot work in every mode. |
| Is a problem **advisory or blocking**? | **Decided by severity.** `blocker` stops applying the profile; `warning` and `info` never do. Every problem carries its fix. |
| What does removing a package do to the theme that needed it? | **Decided: nothing.** The profile stays as chosen and `themeNeedsPackage` is raised. |
| Which of the eight modes does a touch screen get? | **Decided: a drawer with a scrim**, whatever the mode; `revealNeedsHover` says so for Reveal. |
| Light, dark and mark-only **variants of the logo** | **Open.** One logo per profile today; the image is shown on both schemes. |
| **Favicon and app icon** derived from the logo | **Open.** Not generated. |
| Where do the **design system and fonts** live when an application has several themes? | **Open.** The font is one choice of the profile, applied to every theme. |
| The `Screenplay` `ui profile` block | **Open, outside this epic.** Identity, corners, font and menu options are members of `UiProfile`; the block's grammar follows in Cratis/Screenplay. |
