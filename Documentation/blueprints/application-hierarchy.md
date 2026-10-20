---
title: The application hierarchy and toolbars
description: How a screen records the modules and features it was declared in, how navigation items carry that hierarchy, how toolbar items execute destinations and honour their presentation, and how toolbar buttons invoke state change slices.
---

An application is a hierarchy - modules containing features containing slices - and a host that draws navigation
should draw that hierarchy, not a flat list of screen names.

## Where a screen sits

`Screen.path` (`Screen.Path` in .NET) holds the modules and features, outermost first, the screen was declared in:

```json
{ "name": "WorkItemList", "path": ["Workspaces", "Tracking"] }
```

It is the structural identity a destination's `module` and `feature` resolve against, and it lets a host group a
screen under its place in the hierarchy even when no navigation entry lists it. A screen outside any module has an
empty or absent `path`.

## Navigation items carry their hierarchy

A `Navigation` contribution's `NavigationItem` records the same thing in `hierarchy` - the modules and features it
was declared in. A contribution may sit on a module, on a feature at any depth, or inside a screen. `extractNavigationItem`
reads the full authored item: `id`, `label`, `icon`, `presentation`, `targetScreen`, `destination`, `order`, `group`
and `hierarchy`.

## Toolbars

The `core` package renders `core:toolbar` and its `core:toolbarItem` elements, so a toolbar a document authors is
a toolbar on the screen rather than a placeholder.

| Property | Meaning |
| --- | --- |
| `name`, `label`, `icon` | The item's identity, text and icon |
| `kind` | `Action` announces the command in `target` with `cratis.scene.command`; `Navigate` and `Dialog` execute a destination |
| `target` | The command, screen or dialog template |
| `parameters` | Bindings resolved when the item is activated - command arguments or route parameters |
| `destination` | Where the item opens; when absent a `Navigate` item opens the screen `target` and a `Dialog` item the dialog `target` |
| `presentation` | Hints by name. `mode` is `icon`, `text` or `both` (the default); every hint is also exposed as `data-scene-presentation-<name>` |

A destination executes through the enclosing navigation host - a screen in an outlet, or a dialog - and is announced with
the host-neutral `cratis.scene.navigate` event (carrying `targetScreen`, `dialog` and `destination`) outside one. An
icon-only item keeps its label as its accessible name.

## Toolbar buttons that invoke state change slices

A toolbar button of the screen editor is a `core:toolbarItem` with `kind: Action` plus a `slice` and an `emphasis`:

| Property | Meaning |
| --- | --- |
| `label` | The title shown on the button (`Button` for a new one) |
| `slice` | The qualified id of the **state change** slice the button invokes, for example `sales.orders.PlaceOrder`. Edited with the `slice` editor (`editorOptions.kinds: ['StateChange']`): the whole slice tree is listed, state changes are selectable, state views and automations are greyed |
| `emphasis` | `primary`, `secondary` (the default) or `quiet`, edited as chips |
| `icon` | Qualified icon reference |
| `target` | The hand-typed command of a legacy button; kept for compatibility |
| `confirm` | Optional question the user answers before the button runs: an accessible alert dialog with Cancel and the button's title as the accept action. Empty runs at once. Screenplay's `confirm "..."` line on a toolbar item or button, also on the toolbar a feature or module contributes |

`ToolbarButton` (`id`, `title`, `slice?`, `emphasis?`, `icon?`, `target?`) and `Toolbar` (`buttons`) are the model shapes in
`@cratis/scene.model` and `Cratis.Scene.Model.Toolbar`; `toolbarButtonFromItem` / `ToolbarButtons.FromItem` read a button from
the properties of a `core:toolbarItem` (a `Navigate` or `Dialog` item is not a slice button). The slice comes from the
[application structure](application-structure.md).

**Validation** - `validateToolbarButtons(structure, toolbar)` (`ToolbarButtonValidation.Validate`):

| Code | Severity | Meaning |
| --- | --- | --- |
| `toolbarButtonSliceNotFound` | error | The slice does not exist in the application structure |
| `toolbarButtonSliceNotStateChange` | error | The slice is a state view or an automation |
| `toolbarButtonSliceEmpty` | warning | The button has no slice yet; it is allowed while designing and flagged |

**Resolution** - `resolveToolbarButton(index, button)` (`ToolbarButtons.Resolve`) returns what a renderer needs without any React:
the slice, its `command`, and the task `dialog` - `sliceDialogFor` (`SliceDialogs.For`) picks the slice's own `dialogTemplate` when
its structure node names one, else the default `FormDialog` (a host may name another default). The dialog is decided once, here, so
Stage, Studio preview and the renderers agree.

**Compatibility** - a legacy button (`kind: Action` and a `target` command, no `slice`) still validates and renders. On read
the engine converts it: when exactly one state change slice accepts the command (a slice's `command`, or its id when it names
none; a qualified slice id also matches) the button names that slice. A command no single slice accepts - unknown, ambiguous, or a
state view - stays a legacy button and raises no diagnostic. `core:toolbarItem` keeps rendering from `kind` and `target` as before.

Both engines are asserted against `toolbar-slice-fixtures.json` (state change ok, state view and automation rejected, missing
slice, empty slice warning, dialog template resolution, conversion from a `target` command, and reading buttons from items):
`Engine.Specs/for_ToolbarButtonValidation` and `engine/for_validateToolbarButtons`.

### Running a slice button: the task dialog and the `sliceInvoker`

`core:toolbarItem` renders every button with its `emphasis` - `data-scene-emphasis` and the class `scene-toolbar-button-<emphasis>`
(`primary` solid accent, `secondary` outlined, `quiet` frameless; `blueprint.default` styles them) - and an icon according to
`presentation.mode`. When a navigation model is in scope (`SceneNavigationHost` `navigationModel`), a button that resolves to a state
change slice **opens its dialog** instead of announcing the command:

- The button navigates to the dialog destination `sliceDialogDestination(resolved)` - the template `sliceDialogFor` picked, with the
  `slice`, `command` and `title` as parameters. The host renders `dialogs[template]` when the application authors one (the
  `core:sliceDialog` component, or its own element, reading `currentDialogParameters`), and the built-in **`SliceDialogView`** otherwise.
- The dialog is a centred modal card: the button title, the subtitle `State Change · <Slice>`, a labelled field per command property,
  and `Cancel` with a submit button labelled with the title. The first field takes focus, Tab stays inside, Escape cancels, and focus
  goes back to the button. Required fields are checked before anything is invoked.
- The fields come from the command, through `SliceCommandFieldsProvider` (`fieldsFor(command, slice)` returns `{ name, type, label?, required? }`
  per property): Stage reads them from the generated command schemas, Studio from the model. `@cratis/scene.react` imports no Arc or
  transport code (seam rules I3/I4).
- Submit calls the **`SliceInvoker`** in scope - `invoke(sliceId, payload, command)` returning an `InvocationResult` (`succeeded`,
  `validationErrors` by field, `message`, `payload`, `dryRun`). Success closes the dialog and signals the result (`dialogResult`);
  validation errors are shown against their fields (`aria-invalid`, `aria-describedby`) or for the whole form.

| Invoker | Provided by | Does |
| --- | --- | --- |
| announcing (default, no provider) | `createAnnouncingInvoker()` | Announces `cratis.scene.command` with the payload and reports success - what a toolbar action has always done |
| real | Stage, through `SliceInvokerProvider` | Sends the command and returns its validation result |
| dry run | `createDryRunInvoker({ onInvoked, validate })` | Validates, sends nothing, returns a result carrying the would-be payload for the toast (spec PRV5) |

A button with no slice shows a warning badge only when the host asks for it - `SliceInvokerProvider warnEmptySlices` (a dry-run invoker
implies it) - so design and preview hosts flag it (TB5) and a running application never does. Without a navigation model a slice button
announces the command exactly as before.
