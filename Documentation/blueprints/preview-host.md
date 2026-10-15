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
| `{ module }` | the application shell with the module's **effective navigation** and its first feature |
| `{ module, feature }` | that feature in the shell, with navigation |
| `{ slice }`, State Change | the slice's task dialog over a minimal host page - the feature's own page when it has one |
| `{ slice }`, State View | the slice's data fragment: the outermost components bound to its read model, in the minimal host page |

Ids are the qualified ids of the application structure (`sales`, `sales.orders`, `sales.orders.PlaceOrder`); a feature may be given relative to its module. An automation slice has nothing to show and is reported as a problem. `resolvePreviewPlan` resolves a target without rendering.

## Read-only, and a problem list instead of a blank screen

The preview has no design affordances and edits nothing. A toolbar button without a slice shows no warning badge here; it is reported as a problem instead. `diagnosePreview` judges the model with the engine's own validators - nothing is judged that the engine does not already judge - and returns `PreviewProblem` entries with a `code`, a `severity`, a `message` and the `nodeId` to link to:

- **errors** stop the preview, and the host shows them (`PreviewProblemsView`) instead of a blank screen: `targetNotFound`, `moduleWithoutFeatures`, `sliceNotPreviewable`, `screenMissing`, `layoutMissing`, `templateMissing`, `templateUnplaced`;
- **warnings** are reported and the preview renders: `structureInvalid`, `navigationInvalid` (`diagnoseNavigationRegions`), `toolbarInvalid` (`validateToolbarButtons`), `sampleDataInvalid` (`validateSampleDataSelection`), `sliceFragmentMissing`.

`onProblems` receives every problem, blocking or not, whenever they change; `onSelectProblem` is called when the author follows one to its node.

## Navigation

Navigation keeps to an in-memory history (`createMemorySceneHistory`), so a preview never touches the address of the page that hosts it. Clicking an item resolves its target and renders it in the item's slot; going to another module swaps the shell's effective navigation, with inherit, extend and override applied by `effectiveNavigation` - the host does not re-implement it. An item the host's `isVisible` hides is hidden, not disabled.

## Dialogs and the dry-run invoker

A toolbar button opens its slice as a task dialog. Submitting goes through the `SliceInvoker` in scope: by default a **dry run** (`createDryRunInvoker`) - validation runs, nothing is sent to Chronicle or Arc, and a toast says "Command would be sent" with the payload in an expandable detail. `onInvoked` receives what would have been sent. Pass `invoker` to submit through something else; the toast is then not shown. `fieldsFor` tells the dialog a command's fields; their starting values come from the sample data.

## Sample data

Data comes from the active sample data pack. The pack is chosen once for the application in the UI profile (`sampleData.activePack`); `sampleData.sessionActivePack` is the preview strip's selector, a **session-only override** of that choice and not a second source of truth. `createPreviewSampleData` asks `resolveSampleData` - bound pack, active pack, the blueprint's default pack, then generated data typed by field kind - for the queries the document binds and the commands its slices accept. The same seed gives the same rows. A production host never builds one: sample data exists only at design and preview time.

## The strip is the host application's

The dark strip (`Previewing`, the breadcrumb, the sample data selector, `Exit preview · Esc`) belongs to the application that embeds the host - Studio. The host reports what is previewed through `onBreadcrumbChange` (`Sales › Orders`) and calls `onExit` on Escape when no dialog is open: Escape closes a dialog first.

## One composition for the preview and for Stage

`composeApplicationScreen(application, screen, options)` is the single function that composes a screen: the shell for the screen's layout, the chrome in its slots, the screen inside its **template chain** (each template holds the one inside it in the slot it fits, so every arrangement applies), names resolved against the profile, and the effective configuration of the templates' instance contributions. `composeOutletScreen` composes a screen as it appears in a nested outlet, `composeDialog` a dialog template.

`ApplicationHost` is what runs it: the shell for the screen on the page, nested outlets, the navigation model in scope for the topbar and sidebar regions, every destination routed, and the dialog a toolbar button or a dialog destination opened. A host decides only what is its own through `CompositionOptions` - the chrome, the form component, trailing content, a last pass over the tree (Stage binds its data sources there) and the packages names resolve against - and through `renderScreen`, with which Stage wraps a screen in its data and command scope.

The specs run the corpus application through both paths and compare what they render.
