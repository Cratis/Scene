---
title: Frontend package hosting
description: Configure approved Scene frontend packages for embedded and standalone React rendering.
---

## Why hosts approve packages

Scene models stay platform-neutral. A React host decides which package bundles are allowed to execute, which assets may load, and which UI profile selects the effective component, blueprint, theme and icon packages.

Use the same `PackageHostConfiguration` shape for embedded previews and standalone rendering. That keeps VS Code/webview previews, Stage output and application hosts on the same package selection path instead of relying on Studio globals.

## Minimal host configuration

```typescript
import { resolvePackageHost } from '@cratis/scene.react';

const host = resolvePackageHost({
    profile,
    bundles: [defaultBlueprint, primeReactPackage, cratisComponentsPackage],
    policy: {
        allowExecutableImports: true,
        allowNetworkAssets: false,
    },
});

if (host.diagnostics.length) {
    // Show diagnostics in the host surface and stop rendering the invalid profile.
}
```

The resolver reports missing packages, forbidden network assets and duplicate runtime singletons before rendering starts. Runtime hosts can omit optional design-time bundles; designer hosts may load them only after their own policy approves executable imports.

## Templates and design-time contributions

The resolved host also lists every template the approved bundles provide in `templates`, with compatibility, attribution and license metadata. See [Template compatibility, attribution and license](blueprints/template-provenance.md). A designer host loads package previews, designers, property editors, property displays and actions through `resolveDesignTimeHost`. See [Package design-time extensions](editing/design-time-extensions.md).

## Profile layout, theme and host policy

`resolvePackageHost` resolves the whole effective profile from one configuration: the packages the profile lists and their dependencies, their components, assets and fonts, and the profile's `layout` and `theme` from the approved packages (`host.layout`, `host.theme`). `resolveDesignTimeHost` reads the same configuration for design-time extensions, and `PackageHostView` renders with the same registry and binding scope.

A host is blocked, with a diagnostic, when:

- the profile names a layout or theme that no approved package provides;
- the profile's theme is not compatible with every package the profile lists;
- the policy forbids network assets and a package declares one: any absolute URL other than `data:` or `blob:`, or a protocol-relative `//host/...` reference (`isNetworkAsset`);
- the policy forbids executable imports while loading design time, and a package brings design-time code.

## Approved package sets for custom runtime packages

A host that renders with packages it does not ship (a charts package, an in-house component library) approves them with one **approved package set** document. The CLI, Stage's planner and a React host all read the same file, so there is no per-host resolver:

```json
{
  "version": 1,
  "packages": [
    {
      "manifest": {
        "name": "Acme.Charts",
        "version": "1.2.0",
        "kind": "ComponentLibrary",
        "dependencies": [{ "name": "Cratis.Components", "versionRange": ">=4.0.0" }],
        "components": ["chart", "spark"]
      },
      "module": {
        "npm": "@acme/scene.charts",
        "version": "1.2.0",
        "export": "acmeChartsRuntimePackage",
        "styles": ["@acme/scene.charts/styles.css"]
      }
    }
  ]
}
```

- `manifest` is the package's declaration (`ScenePackage`): what a `ui profile` can name it as, its version, dependencies and the components, layouts, templates and themes it declares. Planning resolves profiles against it without loading any code.
- `module` says where the runtime comes from: the npm package a frontend build installs, and the named export of that package which is its `ScenePackageBundle`. `styles` are style sheets inside that same npm package, never URLs or another package.

In .NET, `ApprovedPackageSetJson.Read` (package `Cratis.Scene.Engine`) validates the document and returns the set with its `Catalog` of manifests, or diagnostics: unknown members, another document version, a name the host already ships (`reservedNames`), duplicate packages, icon libraries, invalid npm names or exports, URL or foreign style sheets. `ApprovedPackageSetJson.Write` is canonical (ordinal name order, every list present, line feeds), so the same set is the same bytes everywhere.

In React, `loadApprovedPackages` (`@cratis/scene.react`) imports the bundles through the host's importers and `resolveApprovedPackageHost` resolves the effective profile over the built-in and approved bundles:

```typescript
import { resolveApprovedPackageHost } from '@cratis/scene.react';

const host = await resolveApprovedPackageHost({
    profile,
    bundles: [defaultBlueprint, primeReactPackage, cratisComponentsPackage],
    packageSet,
    // Literal imports, so the bundler includes exactly the approved modules.
    importers: { '@acme/scene.charts': () => import('@acme/scene.charts') },
    policy: { allowExecutableImports: true, allowNetworkAssets: false },
});
```

The importers are an explicit map from npm package name to a literal `import()`, not a way to load an arbitrary specifier: a bundler resolves imports at build time, and a set that names a module the host's build does not include is reported (`imported from '@acme/scene.charts', which this host's build does not include`) rather than loaded. The loader reports, and blocks the host for:

- a policy that forbids executable imports (nothing is imported);
- a module that fails to import, or lacks the declared export;
- a bundle that differs from the declaration - name, version, kind, components, layouts, templates or themes - because the declaration planning used and the code running must be the same package.

Packages load in ordinal name order whatever order the set is written in, so package selection is deterministic, and runtime singletons and dependency ranges are checked by `resolvePackageHost` like any other package. `approved-package-set-fixture.json` is the canonical document; both the .NET writer and the TypeScript loader are specified against it.

## Embedded host example

`Source/JavaScript/thirdparty.inspections/webview` is a runnable embedded-host example: one custom package set rendered by `WebViewPackageHost`, the way a VS Code or Event Models webview embeds Scene. The build turns it into `dist-webview/index.html`, a single file whose inline script loads nothing from the network, under a content security policy of `default-src 'none'`. It needs no Studio global. Rendered content reaches the embedder only through the `cratis.scene.command` and `cratis.scene.navigate` events, which the example forwards to VS Code's `acquireVsCodeApi().postMessage`, or to the parent frame when that API is absent.

The `for_webviewExample` specification loads the built page the way VS Code does, with only `acquireVsCodeApi` provided. It requires the page to render the package set, report `ready`, and send the command with its resolved arguments.
