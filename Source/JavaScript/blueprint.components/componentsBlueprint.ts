// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';
import { ComponentName } from './ComponentName';
import { componentsBlueprintComponents } from './componentsBlueprintComponents';
import { componentsGalleryScreens } from './gallery';
import { componentsBlueprintName } from './packageName';
import { componentsDialogTemplates, componentsScreenTemplates } from './templates';

/**
 * This blueprint's declaration.
 *
 * Where the default blueprint answers "what does an application look like", this one answers "what does a
 * *page* look like once it is bound to Arc". Its templates are whole pages already wired to the composites
 * in `Cratis.Components`: a data list page is a `dataPage` with its query, columns, empty message, data key
 * and filter fields all decided, under a header that says what it is bound to. An application picks the
 * template and supplies a query name.
 *
 * `layouts` is empty, and that is the most important line in this file.
 *
 * A layout is an application's base navigational shell, and an application has exactly one. This package
 * deliberately ships none: it depends on `Cratis.Blueprint.Default` and reuses that blueprint's `AppShell`,
 * its slot vocabulary, its shell components and its themes. That is what the dependency on another
 * blueprint *means* - and this is the first blueprint-on-blueprint dependency in Scene, so it is worth
 * stating plainly rather than leaving to be inferred from an empty array.
 *
 * The alternative would have been to ship a second application shell. It would have looked like value and
 * been the opposite: an application can activate only one shell, so the two blueprints would have become
 * mutually exclusive, and picking Arc-bound pages would have meant giving up the eight layout modes, the
 * themes and the navigation that the default blueprint already does well. Layering means both can be
 * active at once, which is the only arrangement in which either is worth having.
 *
 * `themes` is empty for the same reason at a smaller scale: the shell being themed is the default
 * blueprint's, so its themes are the right ones, and a theme shipped here would be this package asserting
 * a look for a shell it does not own.
 */
export const componentsBlueprintManifest: ScenePackage = {
    name: componentsBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default' }, { name: 'Cratis.Components' }],
    components: Object.values(ComponentName),
    layouts: [],
    screenTemplates: componentsScreenTemplates.map(template => template.name),
    dialogTemplates: componentsDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Cratis Components Blueprint',
    description: 'Arc-bound screen and dialog templates: whole pages built from the Cratis Components composites, for the default blueprint shell.',
    module: '@cratis/scene.blueprint.components',
};

/**
 * This blueprint as a loadable bundle.
 *
 * The manifest names things; this provides them. `validatePackageBundle` is what proves the two agree, and
 * this package's specs run it - a manifest promising a template the bundle never provided is a failure that
 * only shows up when someone picks that template and gets nothing.
 *
 * The screens are the gallery: real `Screen` instances naming the default blueprint's `AppShell`, its
 * chrome and one of these templates, so a preview boots them through the real engine as a working
 * miniature application rather than a set of pictures. They render with unregistered bindings, which is the
 * normal design-time state - the placeholders naming each wanted binding are exactly what should be there.
 */
export const componentsBlueprint: ScenePackageBundle = {
    manifest: componentsBlueprintManifest,
    components: componentsBlueprintComponents,
    screenTemplates: componentsScreenTemplates,
    dialogTemplates: componentsDialogTemplates,
    screens: componentsGalleryScreens,
};
