// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { TemplateLibrary, TemplateSource } from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';

/**
 * The templates the application can draw its shell from: the blueprints the build ships, in override order, and the application's own templates.
 * Which of them can be a shell is Scene's to say (`applicableTemplates`, `resolveEffectiveShell`); this only hands them over.
 *
 * @param bundles Every known package bundle.
 * @param own The application's own templates as Scene reads them, when there are any.
 * @returns The library.
 */
export function shellLibraryOf(bundles: readonly ScenePackageBundle[], own?: TemplateSource): TemplateLibrary {
    const blueprints = bundles.filter(bundle => (bundle.layouts?.length ?? 0) + (bundle.screenTemplates?.length ?? 0) + (bundle.dialogTemplates?.length ?? 0) > 0);
    return { own, blueprints };
}
