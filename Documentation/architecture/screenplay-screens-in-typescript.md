---
title: Drawing a Screenplay screen without a backend
description: "@cratis/scene.screenplay is the TypeScript mirror of the screen half of Cratis.Scene.Screenplay's reverse bridge, for a host that has a .play document and no server to convert it."
---

A host that shows an event model board draws each role's screen from a **Scene document**. Studio has one: its backend
compiles the `.play` with `Cratis.Scene.Screenplay` and hands the document to the board. A host with no backend -
the Screenplay VS Code board, the Screenplay MCP App - has the `.play` and a TypeScript compiler, and nothing that
turns one into the other. It therefore drew a placeholder window where a screen should be
([Cratis/StudioIssues#1420](https://github.com/Cratis/StudioIssues/issues/1420)).

`@cratis/scene.screenplay` is that missing step: the screen half of the reverse bridge, in TypeScript.

```ts
import { screenDocumentsOfSlice } from '@cratis/scene.screenplay';

const { documents, findings } = screenDocumentsOfSlice({
    sliceId: slice.id,
    screens: slice.screens,     // the ScreenSyntax nodes the Screenplay compiler produced
    forms: module.forms,        // the module's forms, which a screen's actions reach
    roles: personaNames,        // the personas the application declares, when it declares any
});
```

Each document is the text a host reads with `readThumbnailDocument` from `@cratis/scene.editor` and draws with
`ScreenThumbnail`.

## What it is for, and what it is not

It draws. It does not export.

The C# bridge keeps every directive no Scene element can hold as printed `.play` text in the document's **native
residue**, so the exact document can be written back out as the `.play` it came from. Printing `.play` is something
only the C# compiler can do, so this bridge never writes residue — and a document from here must never be written
back to a `.play` file. For drawing, residue changes nothing: the shared corpus compares the two bridges with the
residue taken out, and they agree.

Studio and the Viewer keep using the C# bridge. Nothing that has a backend should use this one.

## What travels

| A screen that says | Travels as |
| --- | --- |
| `title`, `data`, `data … as`, `summary` | the matching Scene core component |
| `table` with columns | `core:table` with a `core:column` child per column |
| `toolbar` of buttons | `core:outletItems` of kind `actions` |
| `component`, including a `panel` and its children | the component element, with its properties, bindings, slots, icon, presentation and exposed values |
| `section` | a panel element holding the section's directives |
| `action` | `core:action`, or the module's form for that command when it has one |
| `template blueprint … <Name>` and its slots | the screen's `screenTemplate` and its slot content |
| a screen Studio exported | the exact document it carries, decoded and handed over untouched |

## What does not, and how you hear about it

Everything else is reported as a `ConversionFinding` - the screen it is on and what was left out - and the screen is
drawn without it. A finding is never an error, and a screen is never refused: the worst case a host sees is the
placeholder window it drew before.

Reported today: a navigation, a nested `show`, a guarded action, an inline code block, an `on`/`uses` interaction,
and a screen whose design lives in a file (`screen <Name> file "<path>"`), which Screenplay's TypeScript compiler
recognizes but does not model - only the Studio backend can read one.

There is one difference a host cannot be told about: Screenplay's TypeScript compiler does not model the
behaviors attached to a `table`, so a table with `on double click navigate to …` is drawn as a plain table here,
where the C# bridge keeps the whole directive as residue and draws none. Nothing is lost that the thumbnail would
have shown.

Application-level declarations - layouts, screen and dialog templates, exposures, instance contributions, outlet
levels and navigation - are not written. A screen that needs one of them is drawn in the host's own profile.

## The shared corpus

`screenplay-scene-document-fixtures.json` at the repository root holds the `.play` sources, the syntax a host hands
this bridge, and the documents the **C# bridge** produced from them. The C# bridge is the reference; both sides
assert the committed file, so neither can change without the other's specification saying so.

Regenerate it after changing either side - never edit it by hand:

```bash
node generate-screenplay-scene-document-fixtures.mjs
```

## Reading the syntax

The package declares the Screenplay nodes it reads structurally rather than depending on
`@cratis/screenplay-compiler`, so the direction of dependency matches the C# side - `Cratis.Scene.Screenplay` reads
Screenplay's syntax, never the reverse - and so a renderer never carries a parser. A host's own `ScreenSyntax` and
`FormSyntax` assign to these declarations member for member; where a host's tree models less than the C# one, the
bridge reports what it could not see rather than guessing.
