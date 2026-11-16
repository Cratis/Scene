---
title: The Scene editor
description: "@cratis/scene.editor - the deterministic editors for a Scene application: the screen editor, the UI profile designer, the template browser and picker, the application preview, sample data and the blueprint gallery."
---

`@cratis/scene.editor` is where a person edits a Scene application by hand. It holds every editor that works on the model
directly and deterministically: it applies [Scene edits](../editing/index.md) to a Scene document, draws the result with the same
renderer an application runs on, and asks Scene - not itself - what is wrong and what may change. Nothing in it prompts a
model; the AI-driven canvas composes these editors rather than replacing them.

It is a React package with no application in it. It has no router, no persistence, no authorization and no knowledge of any
host: the model it edits, the commands that store what it produces and the words it shows all come from its
[host](host-seams.md).

## What is in it

| Folder | What it is |
|---|---|
| `ScreenEditor` | The screen editor: window, surface, palette, inspector, structure tree, property editors, design mode, session and undo, play. See [the screen editor](screen-editor.md) |
| `UiProfileDesigner`, `UiProfile` | The UI profile designer and the settings, packages, themes, shells and problems it edits |
| `TemplateBrowser`, `TemplatePicker`, `ScreenTemplates`, `LevelTemplateSurface` | Browsing, choosing and authoring screen templates at the application, module, feature and slice levels |
| `Preview`, `PreviewSurface`, `BlueprintPreview` | The application preview, with personas and the bindings lens, and previews of a blueprint's screens |
| `BlueprintGallery` | The domain blueprints as cards, with their preview and sample data |
| `SampleData` | Choosing, importing and managing sample-data packs |
| `FormDesigner`, `NavigationDesigner`, `StringResourceDesigner`, `LayoutDesigner` | The smaller designers for a command form, navigation, string resources and a freeform arrangement |
| `DesignSystem` | The design system editor: foundations, themes, components, words, Screenplay, conflicts, what is off the standard and a draft's changes, all through a host seam. See [the design system editor](design-system-editor.md) |
| `Icons`, `IconLibraries` | The icon property field and the Lucide library |
| `CascadeMenu`, `Crash`, `NewProjectWizard` | Shared widgets: the cascading menu, the crash panel and boundary, the new project wizard |

## Install

```bash
yarn add @cratis/scene.editor
```

The host installs the peers the editor draws with (`@cratis/components`, PrimeReact 11, `chart.js`, `quill`, `primeicons`,
React); see [host seams](host-seams.md#peer-dependencies).

```tsx
import { ScreenEditorOverlay, createScreenEditorEnvironment, defaultScreenEditorStrings } from '@cratis/scene.editor';
import { TemplateBrowser } from '@cratis/scene.editor/TemplateBrowser';
import { resolveUiProfile } from '@cratis/scene.editor/UiProfile';
```

The package root exports the screen editor, the designers and the contracts a host needs; folders with an `index.ts` are
also entries, and every other module can be imported by its path.

## Pages

- [The screen editor](screen-editor.md) - how it fits together, how a screen is opened and handed back, what the surface draws, what each part of the inspector does.
- [Host seams](host-seams.md) - everything the editor asks of its host and what it does when it is not given.
- [Moving from `@cratis/studio.editor`](import-mapping.md) - the mechanical import mapping and what changed.

## Building and testing

From the repository root, `yarn build`, `yarn test` and `yarn lint` cover this package like every other workspace. Its
specifications run with parallel files and a fresh module graph per file (`vitest.setup.ts`), and a browser specification
that mounts the editor in Chromium runs with `yarn workspace @cratis/scene.editor test:browser`.
