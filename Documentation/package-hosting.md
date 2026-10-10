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

## Embedded host example

`Source/JavaScript/thirdparty.inspections/webview` is a runnable embedded-host example: one custom package set rendered by `WebViewPackageHost`, the way a VS Code or Event Models webview embeds Scene. The build turns it into `dist-webview/index.html`, a single file whose inline script loads nothing from the network, under a content security policy of `default-src 'none'`. It needs no Studio global. Rendered content reaches the embedder only through the `cratis.scene.command` and `cratis.scene.navigate` events, which the example forwards to VS Code's `acquireVsCodeApi().postMessage`, or to the parent frame when that API is absent.

The `for_webviewExample` specification loads the built page the way VS Code does, with only `acquireVsCodeApi` provided. It requires the page to render the package set, report `ready`, and send the command with its resolved arguments.
