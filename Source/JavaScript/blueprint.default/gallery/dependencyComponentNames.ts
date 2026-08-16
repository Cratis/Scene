// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The component names the gallery borrows from this blueprint's dependencies.
 *
 * A screen template names components by their **bare** name and lets `resolveComponentName` pick the
 * package, which is what makes a template portable across profiles. The cost is that a template can
 * reference a name no active package declares, and the only symptom is a dashed red placeholder in the
 * middle of an otherwise fine screen.
 *
 * Every name below was checked against the owning package's own manifest - `primeReactPackage.ts` and
 * `cratisComponentsPackage.ts` - rather than assumed. Two that a dashboard obviously wants, `chart` and
 * `fileUpload`, are deliberately absent from both, so the templates use what does exist (a table of
 * figures, an image beside a button) rather than referencing something that would not render.
 *
 * This list exists because this package does not take an npm dependency on either of those packages - a
 * blueprint declares its dependencies in its manifest, not in its bundler graph. When a host wires the
 * real manifests together, it should resolve against those instead, and any name that drifted will fail
 * this blueprint's specs immediately.
 */

/**
 * Names borrowed from the `PrimeReact` package, each present in its declared component list.
 *
 * `menu`, `breadcrumb` and `sidebar` are here even though the gallery uses this blueprint's versions of
 * them, because PrimeReact really does declare all three - and leaving them out would hide the shadowing
 * that makes a blueprint's own shell components win those bare names.
 */
export const primeReactComponentNames: string[] = [
    'avatar',
    'breadcrumb',
    'calendar',
    'card',
    'checkbox',
    'column',
    'dataTable',
    'dropdown',
    'image',
    'menu',
    'sidebar',
    'inputNumber',
    'inputText',
    'inputTextarea',
    'message',
    'password',
    'progressBar',
    'steps',
    'tag',
    'text',
    'timeline',
];

/**
 * Names borrowed from the `Cratis.Components` package.
 *
 * Deliberately short. The gallery's templates are built from primitives so that they stay legible as
 * *structure*; an application replaces a seeded table with a real `dataPage` bound to a query, and that is
 * the point at which the Arc-bound composites earn their place.
 */
export const cratisComponentsNames: string[] = ['dataPage', 'observableDataTable', 'commandDialog', 'dialog'];

/** The names `core` guarantees, regardless of which packages a profile lists. */
export const coreComponentNames: string[] = ['text', 'button', 'card'];
