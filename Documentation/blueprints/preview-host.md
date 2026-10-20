---
title: Preview host
description: Render the effective application - shell, navigation, a module's first feature, a feature or a slice dialog - from an in-memory Scene document with sample data and a dry-run invoker, through the same composition Stage runs.
---

The preview host in `@cratis/scene.blueprint.default` is the one host a design tool mounts to let an author click around the application as an end user would, and the one place the composition of an application lives. `ScenePreviewHost` renders from an in-memory document - unsaved edits included - with no build and no deploy. Stage composes and hosts its screens through the same functions, so a behaviour that differs between a preview and a running application is a bug, not a second implementation.

```tsx
import { ScenePreviewHost } from '@cratis/scene.blueprint.default';
import '@cratis/scene.blueprint.default/styles.css';

<ScenePreviewHost
    document={document}              // layouts, screen templates, screens, profiles - what a designer edits
    structure={structure}            // modules, features and slices (ApplicationStructure)
    navigation={navigation}          // the application and module navigation regions
    target={{ module: 'sales' }}     // or { module, feature } or { slice }
    sampleData={{ packs, sessionActivePack }}
    registry={registry}              // the components to draw with
    onProblems={showInTheStrip}
    onBreadcrumbChange={setBreadcrumb}
    onExit={exitPreview} />
```

## Targets

| Target | Renders |
| --- | --- |
| `{ application }` | the application itself (`true`, or its name): the shell with the application's navigation, started on `initialDestination`, else the first destination of the application's navigation, else the document's first screen. Use it for an application with no authored structure - a blueprint's gallery (`galleryApplication()` with `galleryComposition`) |
| `{ module }` | the application shell with the module's **effective navigation** and its first feature |
| `{ module, feature }` | that feature in the shell, with navigation |
| `{ slice }`, State Change | the slice's task dialog over the screen the slice owns - a minimal host page when it owns none |
| `{ slice }`, State View | the slice's data fragment: the outermost components bound to its read model, in the minimal host page |

### A slice preview loads only that slice

A `Screen` names the slice that declared it in `owner` - the qualified id of the slice, `sales.orders.PlaceOrder`. Whoever composes the document sets it (Stage does, from the slice a screen is written in); nothing is ever matched by name. A slice preview then loads exactly the screens the slice owns and the screens no slice owns (`screensForSlice`): the application's own, a blueprint's or a hand-authored screen has no `owner` and belongs to every preview. The layouts, screen templates and the profile's root template stay in the document, so the shell and the templates the slice's screen is built from still draw. A screen another slice owns is neither composed nor routable. A slice that owns no screen is drawn over a minimal host page and reported as a `sliceScreenMissing` warning. A module or a feature preview loads the whole document as before.

Ids are the qualified ids of the application structure (`sales`, `sales.orders`, `sales.orders.PlaceOrder`); a feature may be given relative to its module. An automation slice has nothing to show and is reported as a problem. `resolvePreviewPlan` resolves a target without rendering.

## Read-only, and a problem list instead of a blank screen

The preview has no design affordances and edits nothing. A toolbar button without a slice shows no warning badge here; it is reported as a problem instead. `diagnosePreview` judges the model with the engine's own validators - nothing is judged that the engine does not already judge - and returns `PreviewProblem` entries with a `code`, a `severity`, a `message` and the `nodeId` to link to:

- **errors** stop the preview, and the host shows them (`PreviewProblemsView`) instead of a blank screen: `targetNotFound`, `moduleWithoutFeatures`, `sliceNotPreviewable`, `screenMissing`, `layoutMissing`, `templateMissing`, `templateUnplaced`;
- **warnings** are reported and the preview renders: `structureInvalid`, `navigationInvalid` (`diagnoseNavigationRegions`), `toolbarInvalid` (`validateToolbarButtons`), `sampleDataInvalid` (`validateSampleDataSelection`), `sliceFragmentMissing`, `sliceScreenMissing`.

`onProblems` receives every problem, blocking or not, whenever they change; `onSelectProblem` is called when the author follows one to its node.

## Navigation

Navigation keeps to an in-memory history (`createMemorySceneHistory`), so a preview never touches the address of the page that hosts it. Clicking an item resolves its target and renders it in the item's slot; going to another module swaps the shell's effective navigation, with inherit, extend and override applied by `effectiveNavigation` - the host does not re-implement it. An item the host's `isVisible` hides is hidden, not disabled.

**Every navigating control goes through the navigation context** (spec N1): the region items of the topbar and sidebar, `menuItem`, the `breadcrumb` crumbs, the `logo` and the entries of the `userMenu`. A click renders the target in its slot and records it in the history; the control that leads to the screen on the page is the current one (`aria-current="page"`), derived from the history location - not from a property the document has to keep in step. Outside a host (a Storybook story, a static render) the same controls stay ordinary hash links and `isActive` states what is current.

**The breadcrumb follows the location** (N4): a `breadcrumb` with no authored `items` shows the module and the features down to the screen on the page, worked out from the structure (`locationTrail`); the default application chrome uses one. Authored `items` still win, and `followLocation: false` switches the derivation off.

**An entry with nowhere to go is marked** (N8): a control whose target is not a screen the host renders, or an item with no target at all, is drawn with `data-nav-problem="navTargetMissing"` (a warning glyph) and does nothing when clicked.

### Selecting versus navigating

A design host does not always want a click to leave the page. Two props decide:

- `navigationMode`: `'navigate'` (default) or `'select'`, or a function `(request) => mode` deciding per control. In `select` mode a click only reports the activation. **Alt-click selects in any mode.**
- `viewportWidth`: the width the preview is laid out for when it is not the window's - a device preview. At or below the mobile width the menu is a drawer with a scrim, whatever the mode.
- `onRegionHover(region | null)`, `onRegionActivate(region)`: the pointer over, and a click or Enter on, one of the five regions (`identity`, `shell`, `menu`, `content`, `accent`) the shell marks with `data-scene-region` (rule N9 of [the designer contract](ui-profile-designer-contract.md)). A click on a navigation item still navigates and also reports `menu`.
- `regions`: a ref filled with `{ regionRect(region) }`, the box of a drawn region in the preview's own unscaled pixels measured from its top left corner - correct when the host scales the preview - and `undefined` when it is not drawn.

The preview reads the profile in the document: `identity` draws the name and logo, `appearance` sets the corner, accent and font tokens on the host element, and `root.options.navigationMode` and `menuTheme` set the menu mode and tint, following changes without remounting.
- `onActivate(activation)`: called for every activation - `{ request: { source, id, label, destination, item }, mode, resolves, navigated }` - so the host selects the item for editing, and `onNavigate(destination)`: called whenever the preview moves to another screen or dialog, whatever caused it.

These are the `NavigationActivationProvider` / `useNavigationActivation` of `@cratis/scene.react`; `ApplicationHost` takes the same policy as `navigationPolicy`, so Stage and the preview host share it.

### The *Showing* picker

`listDestinations(document)` lists every place the host can show - **Pages**, **States** (screens whose template is a standard state) and **Dialogs** - as `ListedDestination` entries with a `destination` that is valid input to `initialDestination` and to `useSceneNavigation().navigate`. `initialDestination` (`{ screen }` or `{ dialog }`) starts the preview there; one the document cannot render is reported as a `navigationInvalid` warning and ignored. The listing of the gallery is pinned by the fixture `preview-host/for_listDestinations/gallery-destinations.fixture.json`.

## Dialogs and the dry-run invoker

A toolbar button opens its slice as a task dialog. Submitting goes through the `SliceInvoker` in scope: by default a **dry run** (`createDryRunInvoker`) - validation runs, nothing is sent to Chronicle or Arc, and a toast says "Command would be sent" with the payload in an expandable detail. `onInvoked` receives what would have been sent. Pass `invoker` to submit through something else; the toast is then not shown. `fieldsFor` tells the dialog a command's fields; their starting values come from the sample data.

## Sample data

Data comes from the active sample data pack. The pack is chosen once for the application in the UI profile (`sampleData.activePack`); `sampleData.sessionActivePack` is the preview strip's selector, a **session-only override** of that choice and not a second source of truth. `createPreviewSampleData` asks `resolveSampleData` - bound pack, active pack, the blueprint's default pack, then generated data typed by field kind - for the queries the document binds and the commands its slices accept. The same seed gives the same rows. A production host never builds one: sample data exists only at design and preview time.

## The strip is the host application's

The dark strip (`Previewing`, the breadcrumb, the sample data selector, `Exit preview · Esc`) belongs to the application that embeds the host - Studio. The host reports what is previewed through `onBreadcrumbChange` (`Sales › Orders`) and calls `onExit` on Escape when no dialog is open: Escape closes a dialog first.

## One composition for the preview and for Stage

`composeApplicationScreen(application, screen, options)` is the single function that composes a screen: the shell for the screen's layout, the chrome in its slots, the screen inside its **template chain** (each template holds the one inside it in the slot it fits, so every arrangement applies), names resolved against the profile, and the effective configuration of the templates' instance contributions. `composeOutletScreen` composes a screen as it appears in a nested outlet, `composeDialog` a dialog template.

Authored slot content replaces that slot's seeded template content rather than appending to it. An absent slot keeps its seed; an explicitly empty slot clears it. This also applies when an inner template fills a parent slot, or the host fills a root template's outlet or chrome slot. Nested outlet screens use the same rule. Hosted forms still append after the resulting forms-slot content.

**A slot the shell declares can hold a screen.** A navigation item authored with `slot <name>` renders its target into that outlet. When the outlet is declared by a screen (`core:outlet`) the target is nested in it; when no screen declares it but the shell (the layout or root template) does - `side` in `layout AppShell ... side` - the host owns it: `ApplicationHost` puts a closable `core:outlet` in that slot (`CompositionOptions.hostedOutlets`), the default `AppShell` draws any slot beyond its own regions as a side pane (`.layout-side`), and `placeInOutlet` keeps the primary screen and places the target beside it. Both items are active (`aria-current`), the pane has a `Close` button (`closeOutlet(name)` on the navigation context, one history entry, so back reopens it), the pane survives navigation of the primary region, and a reload restores both from the history state. A shell without that slot opens the target in the primary outlet as before.

`ApplicationHost` is what runs it: the shell for the screen on the page, nested outlets, the navigation model in scope for the topbar and sidebar regions, every destination routed, and the dialog a toolbar button or a dialog destination opened. A host decides only what is its own through `CompositionOptions` - the chrome, the form component, trailing content, a last pass over the tree (Stage binds its data sources there) and the packages names resolve against - and through `renderScreen`, with which Stage wraps a screen in its data and command scope.

The specs run the corpus application through both paths and compare what they render.

## The shell comes from the root template

`composeApplicationScreen` (which Stage and the preview host both compose through) no longer decides the shell itself. It asks the
engine's `resolveEffectiveShell` - through `effectiveShellOf(application, screen, options)` - and draws what comes back:

- With a [root template](root-template.md) on the profile, that template is the shell of **every** screen, so a screen cannot end up
  in a different shell by naming another layout. The one exception is the chrome-less `FullPage` layout, which a screen may still name
  to opt out of the chrome (a sign-in page).
- A root that is a layout draws that layout's component; a root that is a screen template with the root role is drawn by the
  template component with its own arrangement and content, and the screen goes in its primary outlet.
- Without a root the screen's own layout is the shell, exactly as before; a layout name no package provides stays an unresolved
  component in the tree on purpose, rather than being silently replaced.
- The templates a chain is placed into, and the outlet the screen lands in, are the resolved shell's outlets and primary outlet.

`CompositionOptions.templateLibrary` lets a host hand over the installed blueprints; absent, the document's own templates and the
default blueprint's are used. The shell's problems (`rootTemplateUnknown`, drifted pins, a missing content outlet, ...) are on
`effectiveShellOf(...).diagnostics`.
