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
