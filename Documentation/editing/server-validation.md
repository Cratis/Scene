---
title: Validating a saved document on the server
description: Checking that a document an editor saved stays within what its screen, template or layout may change, from .NET.
---

An editor holds its author to the rules: inherited content is locked, and a screen configures only what its
template exposed. A request that never went through the editor is not held to anything unless the server checks.
`SceneDocumentChangeValidation` in `Cratis.Scene.Engine` applies the same rules to the document that is about to
be stored, so the server does not need a second rule set of its own.

```csharp
using Cratis.Scene.Engine.Editing;
using Cratis.Scene.Model.Editing;

var result = SceneDocumentChangeValidation.Validate(
    new EditingScope(EditingScopeKind.Screen, "Invoices"),
    previous: storedDocumentJson,      // null for a first save
    submitted: submittedDocumentJson,
    references: new Dictionary<string, string>
    {
        ["Module"] = moduleTemplateDocumentJson,
        ["Feature"] = featureTemplateDocumentJson,
    });

if (!result.IsValid)
{
    return Refuse(result.Message);
}
```

`references` are the stored documents the scope inherits from, keyed by the name of the screen template each one
holds. They are the other templates in the chain, never the one being edited.

## What is checked

| Rule | Violation |
| --- | --- |
| A layout, template or screen other than the scope, what its owner exposes, and what another instance set are unchanged | `nodeNotEditable` |
| A value is set only on a property an owner exposed to the scope, and each template between passed it on | `contributionNotExposed` |
| A collection is changed only by operations that were granted: add, remove, reorder, edit fields | `contributionOperationNotPermitted` |
| An item field is set only when the owner left it editable | `contributionOperationNotPermitted` |
| An item id is not used twice, nor by an item the owner has | `duplicateCollectionItem` |
| A template exposes a component it has | `exposureTargetMissing` |
| A template re-exposes only what an outer owner exposed | `reExposureBroken` |
| A template never re-exposes more operations or fields than its owner granted | `exposureWidensOwner` |
| The scope is in the document, and the document is a Scene document | `unknownScope`, `documentUnreadable` |

The codes are the camel-cased names of the matching `DiagnosticCode` members of `@cratis/scene.model`, so an
editor and a server give the same reason for the same refusal.

## Only changes are judged

The check compares the submitted document with the one it replaces, so what was already stored is left alone:

- A value kept after its exposure was withdrawn is not refused while it stays as it was. Setting or changing it is.
- A copy of a template that has since moved on is not refused while it is unchanged. A changed copy must be exactly
  what the stored template says, which is how a stale copy is brought up to date.
- A screen does not have to embed its template. When the stored template is passed in `references`, it is part of the
  chain the screen's values are checked against. A screen with references must name a layout and screen template from that
  authoritative ancestry; a name invented in the submitted document is refused.
- An owner that exists in a reference but has no exposure declares **zero grants**. The server refuses a submitted exposure
  or contribution for it; absence is never interpreted as "the client may define it".
- The server must resolve `scope` and `references` from its own application, module, feature and slice context. Never derive
  either from the submitted document. When it cannot resolve that context, refuse the save rather than treating unfamiliar
  layouts, templates or instances as authored by the client.

## What it does not check

Whether a value fits its property's type, range or pattern belongs to the component descriptors, which a server does
not have. The engine ignores a value that does not fit when it resolves the configuration, and says so in a
diagnostic.

## Parity with the editor

`document-change-fixtures.json` at the repository root is run by both stacks. The TypeScript specs hand each case's
edit to `applyEdit`; an allowed change must be applied and produce exactly the submitted document, and a refused one
must be refused for the reason the case gives. The .NET specs give the submitted document to
`SceneDocumentChangeValidation` and expect the same verdict and the same codes.
