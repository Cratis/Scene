# Manifest authority

Scene catalogs and Components renderer manifests are **two concepts with an executable mapping**, not two competing registries. Scene owns the platform-neutral catalog. Components owns the web renderer ABI. Scene does not generate its component catalog from Components primitive slots.

## Ownership

| Concern | Authority | Consistency gate |
| --- | --- | --- |
| Package identity, version, dependencies and abstract component names | `ScenePackage` in Scene.Model | Scene dependency resolution and `validatePackageBundle` |
| React implementations and descriptor metadata | The package's `ScenePackageBundle` | `validatePackageBundle` against its independent manifest |
| Components renderer identity, ABI, profile, capabilities and slot implementations | Components `UiLibrary` | `validateComponentsUiLibraryMapping` against the bundle's `componentsUiLibrary` contract |
| Styling, blueprint layouts/templates and icons | Their own Scene package manifests and bundles | `validatePackageBundle`; theme compatibility and icon-library validation |
| Executable editors and designers | Optional frontend tooling supplied by the component package | The frontend tooling contract; not Scene.Model or the runtime ABI |

A package owner versions its catalog and bundle together. A change to Components' ABI does not change Scene.Model: the web package owner updates its mapping and verifies the new adapter before upgrading. Non-web Scene packages need no Components mapping.

Components slots such as `common.button` are presentation contracts, **not** the Scene component vocabulary. DataTable, CommandForm and other library-independent composites do not become additional primitive slots. A component may consume several slots, and several Scene components may consume the same slot. Manifest consistency must not pretend there is a one-to-one relationship.

## Register a custom web package

1. Author a `ScenePackage` with a stable name, version, module, dependencies and contribution names.
2. Export its `ScenePackageBundle`; provide every declared component and describe editable properties. Run `validatePackageBundle` in your package's specifications.
3. If your integration requires a Components renderer, declare `componentsUiLibrary` on the React bundle. Identify its module and named export, expected runtime `id`, ABI major, profile, required slots and capabilities.
4. Register the bundle and renderer module explicitly with each host. Resolve package identity and dependencies from the catalog **before** loading executable code. A module name in a document is not permission to import arbitrary code.
5. Check the registered renderer export with `validateComponentsUiLibraryMapping` before supplying it to `CratisComponentsProvider`. Reject diagnostics rather than substituting an unrelated adapter.

For example, after importing an allowlisted package and its actual Components adapter:

```typescript
const problems = [
    ...validatePackageBundle(bundle),
    ...validateComponentsUiLibraryMapping(bundle.componentsUiLibrary!, presentationLibrary),
];
if (problems.length > 0) throw new Error(problems.join('\n'));
```

The mapping checker accepts Components' structural renderer manifest directly; it does not copy or execute slot renderers. An extra supported slot is compatible. A missing/unimplemented required slot, wrong identity, ABI or profile, or missing required capability is an actionable incompatibility.

## Precedence and diagnostics

Scene package selection determines component-name resolution; it does not authorize loading frontend modules. Scene profiles list higher-priority packages first. Components composes libraries with the last library winning. A host composing corresponding renderer libraries must therefore reverse the Scene priority order rather than silently choosing another precedence rule.

Unknown package names are dependency-resolution errors. Missing declared React implementations and malformed descriptors are bundle-validation errors. Unknown module exports are host-registration errors. Wrong ABI/profile or missing slots/capabilities are mapping errors. Runtime libraries must not quietly fall back across these boundaries.

This decision establishes the adapter boundary. It does not retrofit a renderer into legacy bundles or certify every application host: those integrations must register their actual libraries and call the same checks.
