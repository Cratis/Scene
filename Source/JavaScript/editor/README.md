# @cratis/scene.editor

The deterministic editors for a Scene application: the screen editor, the UI profile designer, the template browser and
picker, the application preview, sample data, the form, navigation and string resource designers, and the blueprint gallery.

The editors apply Scene edits to a Scene document, draw the result with the renderer an application runs on, and ask Scene
what is wrong and what may change. They hold no router, persistence or authorization: everything else comes from the host
through documented seams.

```bash
yarn add @cratis/scene.editor
```

Peer dependencies the host installs: `@cratis/components`, `primereact`, `@primereact/core`, `@primereact/styles`,
`@primereact/types`, `chart.js`, `quill`, `primeicons`, `react` and `react-dom`.

## Layout

Every folder is an area and keeps its specifications beside the code, in `for_<Subject>/when_<situation>`.

| Folder | What it is |
|---|---|
| `ScreenEditor` | The screen editor: window, surface, palette, inspector, structure, property editors, design mode, session, play |
| `UiProfileDesigner`, `UiProfile` | The UI profile designer and the settings, packages, themes, shells and problems it edits |
| `TemplateBrowser`, `TemplatePicker`, `ScreenTemplates`, `LevelTemplateSurface` | Browsing, choosing and authoring screen templates |
| `Preview`, `PreviewSurface`, `BlueprintPreview`, `BlueprintGallery` | Application and blueprint previews, and the gallery |
| `SampleData`, `Icons`, `IconLibraries` | Sample data packs, the icon field and the Lucide library |
| `DesignSystemEditor` | Browse and edit a design system on a draft; every effect goes through a `DesignSystemHost` |
| `FormDesigner`, `NavigationDesigner`, `StringResourceDesigner`, `LayoutDesigner` | The smaller designers |
| `CascadeMenu`, `Crash`, `NewProjectWizard` | Shared widgets |

## Coming from `@cratis/studio.editor`

The package is Studio's editor moved with its folder structure, exports and names intact. Replace the package name and
keep the rest of the path:

| From | To |
|---|---|
| `@cratis/studio.editor` | `@cratis/scene.editor` |
| `@cratis/studio.editor/<path>` | `@cratis/scene.editor/<path>` |

Two things differ: the package ships built output (ESM and CommonJS with declarations) rather than TypeScript source, and
`surfaceLayoutOfRoot` returns the local `SurfaceLayout` enum (same numbers) instead of the legacy `PrototypeLayout`. The
full list is in [Documentation/editor/import-mapping.md](../../../Documentation/editor/import-mapping.md).

## Documentation

- [The Scene editor](../../../Documentation/editor/index.md)
- [The screen editor](../../../Documentation/editor/screen-editor.md)
- [Host seams](../../../Documentation/editor/host-seams.md)

## Commands

```bash
yarn build           # tsc -b, then rollup
yarn test            # Node specifications
yarn test:browser    # Chromium specifications (needs `yarn build` first)
yarn lint
yarn generate-lucide-catalog   # regenerate IconLibraries/Lucide/catalog.json from lucide-react and lucide-static
```
