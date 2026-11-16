---
title: Host seams
description: Everything the Scene editor asks its host for - the model it is lent, the commands it calls, the words it shows, the assets and the page styling - and what happens when a host gives none of it.
---

`@cratis/scene.editor` is the deterministic part of designing an application: it edits a Scene document and nothing else. It
has no router, no persistence, no authorization, no Arc client and no dependency on any application that embeds it. Every
fact that is not in the document reaches it through one of the seams on this page, and every effect it cannot perform itself
leaves it through one.

The rule for every seam is the same. **A seam that is not filled is not offered**: the editor hides the control or says why it
is unavailable, and never does the thing silently or against a guess.

## What the host lends

| Seam | Contract | What it carries |
|---|---|---|
| The model | `ScreenEditorEnvironment`, built with `createScreenEditorEnvironment` | The runtime (the packages the profile selects), the queries a screen may bind, the state changes it may submit, the destinations of navigation items and buttons, the application's own templates, the template scope, the application's navigation, the screen's location and the outlets modules and features refine |
| What to open | `ScreenEditorSubject` | The saved document (text, checked on open, or an object), its window size, the template being authored or used, the screen to open, what is selected on opening, whether it opens over a page |
| What comes back | `ScreenEditorResult` | The document, the level outlets, the prototype projection for older readers, the window size, the surface layout and whether anything changed |
| The look | `ScreenEditorAppearance`, `screenEditorRuntimeForProfile` | A host theme that replaces the profile's for what the editor draws and plays |

`ScreenEditorEnvironment` members the host may leave out: `registerDesignTimeCommands` (lends design-time commands to the host's
form registry while the editor is open), `richText` (the Quill loader; the default is Scene's own and `false` leaves rich text
out), `fileUpload` (the host's own upload effect and the origins an authored upload address may name), `propertyEditors`
(slices of the whole model, template slots, theme colour tokens, what a `reference` editor can point at, and editors a
blueprint or plugin adds), `ownTemplates`, `selectableTemplates`, `templateScope`, `navigation`, `location` (with a `move`
the host performs and answers with its refusal) and `levelOutlets`.

## What the host performs

The editor never stores, sends or navigates. It calls the host and acts on the answer.

| Seam | Contract | The host's part |
|---|---|---|
| Saving a screen | `onBeforeClose(result)` of `ScreenEditorOverlay`, `onChange(result)` of `ScreenEditorWorkspace` | Store the document. Resolve with a message to refuse the save: the editor stays open with its draft and shows it |
| Previewing | `onPreview(document, fitsDialog)` | Show the application with the unsaved screen in it, as the host's page, and clear `previewing` when it is dismissed |
| Moving a screen | `ScreenEditorLocation.move(featureId)` | Move the slice the screen belongs to and answer with the reason it refused, if it did |
| Saving the UI profile | `onSave(profile)` of `ProfileEditorWindow` / `useProfileDesigner` (the designer) or `onApply` and `onApplySampleData` of `UiProfileWorkspaceInput` (the apply-and-review workspace) | Store the profile and resolve to an `AutosaveOutcome` (or `ApplyUiProfileResult`). Rejecting keeps the edit and offers a retry |
| The default size class | `UiProfileSettings.sizeClass` | A host that stores it apart from the profile document reads it from the settings and keeps it as its own fact |
| The shell | `ShellHost` | `browser` (the template browser's assets and words), `screens`, `onEditShell`, `onCreateShell`, `onRemapSlots`. Without `onRemapSlots` a switch that needs it says so |
| Templates | `TemplateBrowserActions`, `TemplatePickerHandlers` | `onChoose`, `onNew`, `onEdit`, `onRename`, `onDuplicate`, `onRemove`, `onCopyToMine`, `onAddBlueprint`, `onImport`, `onExport`. Each is offered only when it is given |
| Sample data | `SampleDataPickerHandlers`, `ProfileSampleDataInput` (`packs`, `readModels`, `onSavePack`, `onRemovePack`) | Choose, import, create and delete packs, and keep them. Without it the choice is among what Scene and the blueprints ship, and generated data |
| Reporting a crash | `CrashReporterProvider`, `configureCrashReportLinks` | File a report. With a reporter the panel stays inside the box it guards and the host's dialog opens with the detail filled in. Without one the panel covers the page and opens a prefilled issue form in a new tab, at the address `configureCrashReportLinks` sets (the default address is `crashReportIssuesUrl`) |
| Uploads | `ScreenEditorFileUpload` | `handler` and `allowedOrigins`. Without a handler the control posts the files itself to the address its author configured, and only when someone presses upload |
| AI drafting | `SceneScreenDraftAgent` (`draftAgent` of the overlay) | Prepare a reviewable draft for an ordinary writable screen. Absent, no drafting is offered |

## What the host says

Every word the editor shows comes from a strings object the host passes in, so no resource system is imported. English
defaults ship for the screen editor (`defaultScreenEditorStrings`, `defaultLayoutLabels`, `defaultLayoutIcons`,
`defaultPaletteIcons`, `defaultPaletteSources`, `defaultStructuredEditorStrings`) and for the level-template surface and the
crash panel; the rest are the host's to write:

`UiProfileDesignerStrings`, `UiProfileStrings`, `PreviewStrings`, `LensStrings`, `TemplateBrowserStrings`,
`TemplatePickerLabels`, `BlueprintGalleryStrings`, `SampleDataPickerLabels`, `IconPropertyFieldStrings`, `DesignModeStrings`,
`OutletStrings`, `PlacementStrings`, `PropertyEditorStrings`, `SceneScreenDraftStrings`, `CrashStrings` and
`LevelTemplateSurfaceStrings`. Where one string object is built from another's (the template browser reuses the gallery's
update notice and preview words) the host says so in one place.

## What the host ships

- **Blueprint assets.** `BlueprintGalleryAssets` turns a file inside a blueprint package into something usable: `thumbnailUrl`
  and `loadPacks`. How a file in an npm package becomes a URL is the bundler's business. A Vite host finds them with
  `import.meta.glob` over `node_modules/@cratis/scene.blueprint.*` and loads a pack only when a preview asks;
  `noBlueprintGalleryAssets` is the host that has none, and the cards then say so.
- **Blueprint bundles.** `domainBlueprints` and `blueprintPreviewBundles` (in `BlueprintPreview`) list the blueprint packages
  the editor knows. Adding a blueprint to Scene means adding its package here and its application to `blueprintApplications`.
- **Providers.** `CratisComponentsProvider` and PrimeReact's `PrimeReactProvider` with the component styles
  (`ScreenEditorPrimeReactProvider`), and the PrimeUI license key if the host has one.
- **Stylesheets.** The packages the editor draws with each have their own stylesheet: `@cratis/scene.blueprint.default/styles.css`,
  `@cratis/scene.primereact/primeReactTheme.css` and `@cratis/scene.components/styles`. The editor's own `.css` files are
  imported by the modules that use them, so a bundler that handles CSS needs nothing more.

## What the host's page supplies

The chrome of the editor is drawn with CSS custom properties the host's design system defines. Every `--cratis-*` colour,
border and radius token the editor reads is the one Cratis Components defines (for example `--cratis-surface-card`,
`--cratis-surface-border`, `--cratis-text-color`, `--cratis-primary-color`, `--cratis-border-radius`); a host on Cratis
Components has them already. Two more are optional and have fallbacks, for a host whose own bars float over the page:

| Property | Meaning | Fallback |
|---|---|---|
| `--studio-chrome-height` | The height of a bar the host draws across the top, which the workspace keeps clear of | `0px` |
| `--studio-rail-inset` | The width of a rail the host draws on the left | `0px` |

The properties the editor sets itself, such as `--studio-surface-viewport-height`, `--studio-empty-container-label` and
`--studio-dialog-title`, are the editor's own; a host does not set them.

## What the browser remembers

Three things are kept in the browser's local storage, under keys that predate the move to Scene and are kept so nothing an
author set is lost: the window size of a screen (`studio.screenEditor.windowSize.v1`, replaceable with the `windowMemory` seam
of the overlay), whether the application shell and the template are drawn around a screen
(`studio.screenEditor.showApplicationShell.v1`, `studio.screenEditor.showTemplate.v1`) and the component picker's recents
and groups (`cratis.studio.componentUsage.v1`, `cratis.studio.componentGroups.v1`). None is part of a screen document.

## Peer dependencies

The editor draws with `@cratis/components`, PrimeReact 11 (`primereact`, `@primereact/core`, `@primereact/styles`,
`@primereact/types`), `chart.js` and `quill` (the chart and rich text controls), `primeicons`, React and React DOM. The host
installs them; the Scene packages (`@cratis/scene.*`), `lucide-react` and `react-icons` come with the editor.
