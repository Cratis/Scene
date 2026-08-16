// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, Layout, ScenePackage, Screen, ScreenTemplate, Theme } from '@cratis/scene.model';
import { ComponentRegistry } from '../renderer';

/**
 * What a package actually ships to a React renderer, as opposed to what it *declares*.
 *
 * `ScenePackage` is the declaration — a name, a kind, dependencies, and the names of what it
 * contributes. It is deliberately platform-agnostic and lives in `Scene.Model`, because Stage's build and
 * Studio's design-time queries both read it without ever loading a component. A bundle is the other half:
 * the real React components, layouts, screens and themes behind those names, which only a renderer needs.
 *
 * A package publishes exactly one bundle, as a named export following its own name —
 * `primeReactPackage`, `cratisComponentsPackage`, `corePackage`. A host loads it from the module the
 * declaration's `ScenePackage.module` names.
 */
export interface ScenePackageBundle {
    /**
     * The package's own declaration. Its `components`, `layouts` and `themes` name lists must agree with
     * what this bundle actually provides — {@link validatePackageBundle} is what proves they do.
     */
    manifest: ScenePackage;

    /**
     * The components this package provides, keyed by {@link componentRegistryKey}.
     */
    components: ComponentRegistry;

    /**
     * The application shells this package provides, if any. Only a blueprint has these.
     */
    layouts?: Layout[];

    /**
     * The screen templates this package provides — the shapes that go inside a layout, each declaring
     * which of its parent's slots it fills.
     */
    screenTemplates?: ScreenTemplate[];

    /**
     * The dialog templates this package provides.
     */
    dialogTemplates?: DialogTemplate[];

    /**
     * Sample screens this package ships — a layout package's gallery, so a preview has real content to
     * put through the real engine rather than a mockup.
     */
    screens?: Screen[];

    /**
     * The themes this package ships, if any.
     */
    themes?: Theme[];
}

/**
 * The key a component is registered and looked up under: the package that provides it, then the bare name
 * a screen refers to it by.
 *
 * A screen writes a bare name (`button`) or a package-qualified one (`PrimeReact.button`);
 * `resolveComponentName` turns either into a `{ name, package }` pair, and this turns that pair into the
 * registry key. Nothing should build this string by hand — the separator is an implementation detail of
 * the registry, deliberately not the `.` used for qualification in a screen, so a package name containing
 * dots stays unambiguous.
 */
export function componentRegistryKey(packageName: string, componentName: string): string {
    return `${packageName}:${componentName}`;
}

/**
 * Checks that a bundle provides everything its manifest declares, and declares everything it provides.
 *
 * A manifest that promises a component the bundle does not register renders as `UnresolvedComponent` at
 * runtime — a blank box, far from where the mistake was made. A component registered but not declared is
 * invisible to `resolveComponentName`, so a screen can never name it. Both are silent failures, which is
 * why every package's specs run this.
 */
export function validatePackageBundle(bundle: ScenePackageBundle): string[] {
    const problems: string[] = [];
    const { manifest } = bundle;

    for (const name of manifest.components) {
        if (!(componentRegistryKey(manifest.name, name) in bundle.components)) {
            problems.push(`declares the component '${name}' but registers no implementation for it`);
        }
    }

    const declared = new Set(manifest.components.map((name) => componentRegistryKey(manifest.name, name)));
    for (const key of Object.keys(bundle.components)) {
        if (!declared.has(key)) {
            problems.push(`registers '${key}', which the manifest does not declare`);
        }
    }

    const providedLayouts = new Set((bundle.layouts ?? []).map((layout) => layout.name));
    for (const name of manifest.layouts) {
        if (!providedLayouts.has(name)) {
            problems.push(`declares the layout '${name}' but provides no definition for it`);
        }
    }

    const providedScreenTemplates = new Set((bundle.screenTemplates ?? []).map((template) => template.name));
    for (const name of manifest.screenTemplates) {
        if (!providedScreenTemplates.has(name)) {
            problems.push(`declares the screen template '${name}' but provides no definition for it`);
        }
    }

    const providedDialogTemplates = new Set((bundle.dialogTemplates ?? []).map((template) => template.name));
    for (const name of manifest.dialogTemplates) {
        if (!providedDialogTemplates.has(name)) {
            problems.push(`declares the dialog template '${name}' but provides no definition for it`);
        }
    }

    const providedThemes = new Set((bundle.themes ?? []).map((theme) => theme.name));
    for (const name of manifest.themes) {
        if (!providedThemes.has(name)) {
            problems.push(`declares the theme '${name}' but provides no definition for it`);
        }
    }

    return problems;
}

/**
 * Merges the component registries of several bundles into the single registry a renderer consumes.
 *
 * Keys carry their package name, so nothing collides and merge order does not matter — which package wins
 * a *bare* name is decided earlier, by `resolveComponentName` walking the profile's priority order.
 */
export function mergePackageRegistries(bundles: ScenePackageBundle[]): ComponentRegistry {
    return Object.assign({}, ...bundles.map((bundle) => bundle.components)) as ComponentRegistry;
}
