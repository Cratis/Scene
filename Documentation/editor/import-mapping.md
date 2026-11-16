---
title: Moving from @cratis/studio.editor
description: The mechanical import mapping from Studio's private editor package to @cratis/scene.editor, and the few places where the move changed something.
---

`@cratis/scene.editor` is Studio's `@cratis/studio.editor` moved to Scene with its folder structure, exports and names
unchanged. A host switches with one replacement:

| From | To |
|---|---|
| `@cratis/studio.editor` | `@cratis/scene.editor` |
| `@cratis/studio.editor/<Folder>` (for example `TemplateBrowser`, `ScreenTemplates`, `UiProfile`, `Icons`, `BlueprintGallery`) | `@cratis/scene.editor/<Folder>` |
| `@cratis/studio.editor/<Folder>/<module>` (for example `UiProfile/resolveUiProfile`, `ScreenEditor/Document/studioScreen`) | `@cratis/scene.editor/<Folder>/<module>` |

```bash
git grep -l "@cratis/studio.editor" | xargs perl -pi -e 's#\@cratis/studio\.editor#\@cratis/scene.editor#g'
```

The dependency `"@cratis/studio.editor": "workspace:*"` becomes `"@cratis/scene.editor": "<version>"`.

## What is the same

- Every module path. Each module is published as its own entry (`./*`), and each folder with an `index.ts` as a folder entry
  (`./TemplateBrowser`, `./ScreenEditor/Integration`, ...), so a deep import of any module that Studio imported still resolves.
- Every exported name, including the `studio.*` property editor kinds, the `studio-*` CSS class names, the `--studio-*` custom
  properties and the browser storage keys, so what authors set and what hosts style keeps working. See [host seams](host-seams.md).
- The shared test helpers that other packages' specifications import from the editor, such as
  `ScreenTemplates/given/aTemplateCatalog` and `ScreenTemplates/given/aHierarchy`, are published with it.

## What changed

- **The package ships built output.** Studio imported TypeScript source (`"main": "./index.ts"`); the Scene package ships ESM and
  CommonJS with declarations under `dist/`, like the other `@cratis/scene.*` packages. A host no longer needs to compile it, and
  the `.css` files the components import stay imports for the host's bundler (they are copied beside the modules that use them).
- **No legacy `@cratis/scene`.** `surfaceLayoutOfRoot` returned the legacy `PrototypeLayout`; it now returns `SurfaceLayout`,
  a local enum with the same numbers (`absolute` 0, `flexRow` 1, `flexColumn` 2, `grid` 3). A host that still holds a
  `PrototypeLayout` converts with a number cast; `ScreenEditorResult.layout` was already a plain number.
- **No Studio code.** Nothing in the package imports a Studio package or reaches into a Studio folder. The two specifications that
  did stay with Studio, because what they check is Studio's:
  - the comparison of `registeredPrototypeTypes` with the `[DerivedType]` registrations in Studio's C# (the list is still
    exported for the host's own check), and
  - the wire test that posted a projected form through Studio's `SaveSliceUiActorScreen` command (the editor's side of it, the
    projection of a form with generated fields, is specified here).
- **A fixture moved.** The expected UI profile document for a new application
  (`UiProfile/for_uiProfileDocumentOf/given/default-profile.json`) now lives with the specification that checks it. A host that
  writes a creation-time profile compares its own document with that file.
- **The browser harnesses stay with the host.** Studio's Playwright pages (`screen-editor-dom`) mount the editor inside Studio's
  own host code - its strings, its opening of a screen, its design-time commands and its blueprint assets - so they run against
  `@cratis/scene.editor` unchanged after the import replacement. Scene's own browser specification is
  `ScreenEditor/Host/for_ScreenEditorWorkspace/when_mounting_the_editor_in_chromium.browser.ts` (`yarn workspace @cratis/scene.editor test:browser`).
