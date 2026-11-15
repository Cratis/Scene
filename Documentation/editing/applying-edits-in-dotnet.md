---
title: Applying edits from .NET
description: EditApplier in Cratis.Scene.Engine applies every SceneEdit with the same outcomes as applyEdit, and the shared fixture corpus that keeps the two engines identical.
---

`applyEdit` in `@cratis/scene.engine` is the reference for what an edit does. `EditApplier` in `Cratis.Scene.Engine`
applies the same fourteen edits to the same document and gives the same outcome: the same document after an accepted edit,
the same refusal, and the same diagnostics - code, severity, message and the node, instance, component, path and item they
are about. A host that edits on the server, replays a saved list of edits or checks what an editor sent does not need a
second rule set of its own.

```csharp
using Cratis.Scene.Engine.Editing.Applying;
using Cratis.Scene.Model.Editing;

var catalog = DescriptorCatalog.Create(componentDescriptors);
var context = new EditingContext(catalog, new EditingScope(EditingScopeKind.Screen, "Invoices"));

var outcome = EditApplier.Apply(document, new SetPropertyEdit("element:invoiceTable", "pageSize", JsonSerializer.SerializeToElement(50)), context);

if (outcome.Applied)
{
    document = outcome.Model;   // a new SceneDocument
}
else
{
    foreach (var diagnostic in outcome.Diagnostics)
    {
        Console.WriteLine($"{diagnostic.Code}: {diagnostic.Message}");
    }
}
```

## What is the same

| TypeScript | C# |
| --- | --- |
| `SceneDocument` | `SceneDocument` (layouts, templates and screens are held as `JsonElement`s: an element tree has no type discriminator, so it is read by its shape and kept as data) |
| `SceneEdit` and its kinds | `SceneEdit` and the `*Edit` records, discriminated by `kind` |
| `applyEdit(model, edit, context)` | `EditApplier.Apply(model, edit, context)` |
| `EditingContext` | `EditingContext` |
| `EditOutcome` | `EditOutcome` |
| `createDescriptorCatalog(components)` | `DescriptorCatalog.Create(components)` |
| `SceneDiagnostic`, `DiagnosticCode` | `SceneDiagnostic`, `DiagnosticCode` |
| `ComponentDescriptor`, `PropertyDescriptor`, `QueryCandidate` | the same names in `Cratis.Scene.Model.Descriptors` and `Cratis.Scene.Model.Queries` |

Like the TypeScript engine, `Apply` is pure. The document passed in is never changed and the outcome holds a new one. When any
error is found the edit is refused as a whole: `Applied` is `false`, `Model` is the very object that was passed in and nothing
is half done. A warning does not refuse the edit; it comes back alongside the applied document.

The node ids are the ones the TypeScript engine builds (`element:orders`, `screenTemplate:Page#slot:main`,
`layout:Shell#arrangement#flow:root.0.1`), so an edit written for one engine addresses the same node in the other. A host
should not parse them.

## The shape contract

The records the editing model is made of - the edits, the document, the diagnostics, the effective configuration, the
descriptors and the query candidates - are in `Cratis.Scene.Model`, with their TypeScript mirrors in `@cratis/scene.model`.
`scene-model-shape.json` lists every type's properties and every enumeration's members, and both shape specs check their own side
against it. An edit record's `kind` is the polymorphic discriminator on the C# side, so it is not a property there and is not
listed.

## The shared fixture corpus

`scene-edit-fixtures.json` at the repository root is the contract between the two engines. It holds:

- `components`: the component descriptors the cases are edited against.
- `documents`: the starting documents, by name.
- `cases`: each with a `name`, the `document` it starts from, the editing `scope`, optional `queryCandidates` and a list of
  `edits`. Beside those it records, for every edit in order, whether it was `applied` and the `diagnostics` it gave
  (`steps`), and the `expectedDocument` after the last one.

Both suites apply every case:

| Suite | Spec |
| --- | --- |
| TypeScript | `engine/editing/for_applyEdit/when_applying_the_shared_edit_corpus.ts` |
| C# | `Engine.Specs/for_EditApplier/when_applying_the_shared_edit_corpus.cs` |

A step is checked in full: applied or refused, the diagnostics, that a refused edit hands back the document it was given, and
that the final document equals the recorded one.

The cases cover every kind of edit, what each accepts and what each refuses, the diagnostics, edits that span size-class
variants of a freeform element, query-binding checks against the host's candidates, and sequences of edits applied one after the
other.

### Changing an edit's behavior

The TypeScript engine is the reference, so a change starts there:

1. Change `applyEdit` or what it relies on, and add the case that shows the new behavior to `generate-edit-fixtures.mjs`.
2. Run `yarn build`, then `node generate-edit-fixtures.mjs`. The outcomes of every case are recomputed by the TypeScript engine
   and written back to `scene-edit-fixtures.json`.
3. Read the diff of `scene-edit-fixtures.json`: it is exactly what changed for the other engine.
4. Run the C# specs. They fail where `EditApplier` has to follow; change it until they pass.

Never edit `scene-edit-fixtures.json` by hand, and never change an expectation to make the C# side pass.
