---
title: Editing screens and templates
description: What Scene gives an editor - descriptors, inspection, edits, exposure and query bindings - and how the pieces fit.
---

An editor such as Studio needs to answer four questions about a screen without knowing anything about how it
is drawn: *what is this node*, *what can I change on it*, *what happens if I do*, and *what may the thing
sitting inside it change*. Scene answers them with plain data and pure functions, so the answers are the same
in an editor, in a test and in a different renderer.

| Question | Answer | Page |
| --- | --- | --- |
| What can be edited on a component or a layout? | A `PropertyDescriptor` per property, shipped by the package that owns the component | [Describing what can be edited](descriptors.md) |
| What is this node, and can I change it from here? | `inspect(document, nodeId, context)` returns a `NodeInspection` | [Inspecting and editing](inspection-and-editing.md) |
| Change it | `applyEdit(document, edit, context)` returns a new document or refuses with diagnostics | [Inspecting and editing](inspection-and-editing.md) |
| What may a screen change on its template? | An `ExposureDeclaration` on the template, `InstanceContribution`s on the screen | [Exposing a template](exposure-and-configuration.md) |
| What does a data component bind to? | A `QueryBinding` checked against host-supplied `QueryCandidate`s | [Binding queries](query-binding.md) |

## The document

Everything operates on a `SceneDocument`: the layouts, screen templates, dialog templates and screens, plus
the two collections that make templates configurable - `exposures` and `instanceContributions`. Operations
never change the document you pass in. They return a new one, so undo is keeping the previous value.

```ts
const outcome = applyEdit(document, {
    kind: SceneEditKind.SetProperty,
    nodeId: 'element:orders',
    path: 'pageSize',
    value: 50,
}, { catalog, scope: { kind: 'screen', name: 'Orders' } });

if (outcome.applied) save(outcome.model);
else show(outcome.diagnostics);
```

## The editing scope

Every operation takes an `EditingContext` whose `scope` names the screen, template or layout being edited.
The scope decides what is **local**. A node the scope owns is edited directly. A node it inherits from an outer
template or layout is read-only, unless its owner exposed some of its properties, in which case those are
configured through an *instance* edit that is stored on the scope, never on the inherited node.

## One resolution, two consumers

`resolveEffectiveConfiguration` merges a template's own values with what each instance contributed. The editor
shows the result and the runtime renders from it (`SceneElementView` takes it as `configuration`), so what an
author sees is what plays. There is no design-time flag anywhere in the engine.

## What Scene does not do

- It does not discover queries. The host works out which queries are in scope and passes them in.
- It does not own the icon catalog. An icon is a `{ library, key, variant? }` reference; the libraries and
  the picker live elsewhere.
- It does not draw anything. Presentation, selection handles and drag feedback belong to the host.
