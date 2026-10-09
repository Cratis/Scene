---
title: Package design-time extensions
description: Supply a preview, designer, property editor, property display and design-time action from your own package, and load them through the generic design-time host.
---

A designer that switches on component names cannot show a component it has never heard of. Scene removes that switch: a package declares its design-time extensions as data, ships the code in an optional design-time bundle, and every host reaches them through the same lookups. A third-party package gets exactly what a Cratis package gets.

The repository carries a complete third-party fixture, `@acme/scene.inspections` in `Source/JavaScript/thirdparty.inspections`. It imports only the public Scene packages, and its specs load it through the public host API. The snippets below come from it.

## Declare the extensions in the manifest

The manifest's `designTime` block names every contribution and the contract version the bundle targets. It is plain data in `Scene.Model`, so a host reads it without loading any design-time code.

```typescript
export const inspectionsPackageManifest: ScenePackage = {
    name: 'Acme.Inspections',
    version: '2.4.0',
    kind: PackageKind.ComponentLibrary,
    // ...components, layouts, templates, themes...
    designTime: {
        contractVersion: '1.0',
        previews: ['checklistPreview'],
        designers: ['checklistDesigner'],
        propertyEditors: ['checklistItems'],
        propertyDisplays: ['severityBadge'],
        actions: ['Acme.Inspections.checklist.generateFields'],
    },
};
```

The component descriptor says which of them a component uses: `previewKind`, `editorKind` (the component designer), `propertyDisplayKind`, each property's `editorKind`, and the `actions` a designer may offer.

## Ship the code in a separate bundle

Keep the runtime bundle free of design-time imports, and add the contributions in a module of their own:

```typescript
export const inspectionsDesignTime: DesignTimeBundle = {
    previews: { checklistPreview: ChecklistPreview },
    designers: { checklistDesigner: ChecklistDesigner },
    propertyEditors: { checklistItems: ChecklistItemsEditor },
    propertyDisplays: { severityBadge: SeverityBadge },
    actions: { [generateChecklistItemsAction.descriptor.id]: generateChecklistItemsAction },
};

export const inspectionsDesignTimePackage: ScenePackageBundle = { ...inspectionsPackage, designTime: inspectionsDesignTime };
```

Designers and editors read the shared `DesignTimeContext` and change the document only through `submitEdits` and `submitAction`. The host's validation and undo history stay in charge.

An action's handler decides its own availability. `isVisible` and `isEnabled` receive the context, and `execute` returns a canonical `SceneEdit` batch rather than changing anything itself.

## Load it through the design-time host

```typescript
const designTime = resolveDesignTimeHost(
    {
        bundles: [inspectionsDesignTimePackage],
        profile: { name: 'studio', targetPlatform: 'web', packages: ['Acme.Inspections'] },
        policy: { allowExecutableImports: true, allowNetworkAssets: false, loadDesignTime: true },
    },
    { hostEditorKinds: ['icon'] },
);

const designer = designTime.designer(descriptor);          // { contribution, package } or { diagnostic }
const editor = designTime.propertyEditor(descriptor, property);
const actions = designTime.actions(descriptor, context);   // visible and enabled, as the package decides
const outcome = designTime.runAction(descriptor, 'Acme.Inspections.checklist.generateFields', context);
```

`resolveDesignTimeHost` runs the normal `resolvePackageHost` first, so dependency, policy and bundle validation apply unchanged. `runAction` submits the batch through `context.submitAction` only when every edit is a canonical Scene edit. Otherwise it submits nothing and returns the reason.

## Fallbacks and diagnostics

When a lookup cannot return a package contribution, it returns a `diagnostic` and the host renders its generic preview, inspector or value-type editor. An action without a loaded handler is shown disabled.

| Situation | Result |
| --- | --- |
| The host policy does not set `loadDesignTime` | No design-time code is loaded; every lookup falls back. A runtime host renders the component and nothing else. |
| `contractVersion` has a different major version than `DesignTimeContractVersion`, or is not `major.minor` | The package's runtime contributions are approved; none of its design-time contributions are loaded. |
| The bundle provides design-time code but the manifest declares none | None of it is loaded. |
| The bundle provides a contribution the manifest does not declare | That contribution is not loaded. |
| The manifest declares a contribution the bundle does not provide | Reported; lookups for it fall back. |
| A descriptor asks for an extension no approved package provides | `diagnoseDescriptors()` reports it; the lookup falls back. |
| A property editor kind is one the host implements itself | The lookup returns `hostKind`, with no diagnostic. |

A kind can name another package, as in `Other.Package:floorPlanDesigner`. It resolves only when the host has approved that package.

## Related

- [Designer patterns from WinForms and ASP.NET](./designer-patterns.md) explains where these extension points come from.
- [Describing what can be edited](./descriptors.md) covers component and property descriptors.
