// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ScenePackageBundle, describeComponents } from '@cratis/scene.react';
import { ComponentName } from './ComponentName';
import { defaultBlueprintComponentMetadata } from './defaultBlueprintComponentMetadata';
import { foundationDescriptors } from './foundation';
import { defaultBlueprintComponents } from './defaultBlueprintComponents';
import { galleryDialogTemplates, galleryScreenTemplates, galleryScreens } from './gallery';
import { LayoutName, defaultLayouts } from './layouts';
import { defaultBlueprintName } from './packageName';
import { defaultBlueprintThemes } from './themes';

/**
 * The default blueprint's declaration.
 *
 * A blueprint is the package an application picks once to get a coherent shape: the {@link Layout}s that
 * are its base navigational look, the {@link ScreenTemplate}s and {@link DialogTemplate}s that go inside
 * them, the components that fill their slots, and the themes that color all of it. Picking the parts
 * separately is how an application ends up with a sidebar from one design language and a form from
 * another.
 *
 * The shell uses Cratis Components. Screen templates that borrow another component library declare
 * that library in their own compatibility metadata; installing the shell does not activate it.
 *
 * `layouts` lists only true application shells. A dashboard, a CRUD list or a sign-in screen is a screen
 * template, not a layout, and is listed as one.
 */
export const defaultBlueprintManifest: ScenePackage = {
    name: defaultBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Components' }],
    components: Object.values(ComponentName),
    layouts: Object.values(LayoutName),
    screenTemplates: galleryScreenTemplates.map(template => template.name),
    dialogTemplates: galleryDialogTemplates.map(template => template.name),
    themes: defaultBlueprintThemes.map(theme => theme.name),
    displayName: 'Cratis Default Blueprint',
    description: 'Application shells with eight menu modes, the components that fill their slots, and a full screen and dialog template set.',
    module: '@cratis/scene.blueprint.default',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'foundation-en', title: 'Foundation · English', locale: 'en-GB', path: 'sampleData/foundation-en.json' }],
};

/**
 * The default blueprint as a loadable bundle.
 *
 * The manifest names things; this provides them. `validatePackageBundle` is what proves the two agree, and
 * this package's specs run it - a manifest promising a component the bundle never registered renders as a
 * dashed red placeholder somewhere deep inside a screen, a long way from the declaration that caused it.
 *
 * The screens are the gallery: real {@link Screen} instances naming a layout, a screen template and the
 * content that fills it, so a preview boots them through the real engine as a working miniature
 * application rather than a set of pictures.
 */
export const defaultBlueprint: ScenePackageBundle = {
    manifest: defaultBlueprintManifest,
    components: defaultBlueprintComponents,
    layouts: defaultLayouts,
    screenTemplates: galleryScreenTemplates,
    dialogTemplates: galleryDialogTemplates,
    screens: galleryScreens,
    themes: defaultBlueprintThemes,
    descriptors: describeComponents(defaultBlueprintManifest.name, foundationDescriptors, defaultBlueprintComponentMetadata),
};
