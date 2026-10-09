// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, Layout, ScenePackage, ScreenTemplate } from '@cratis/scene.model';

/**
 * A package and the templates it provides. A React `ScenePackageBundle` already has this shape, so hosts pass
 * their approved bundles straight in.
 */
export interface TemplateSource {
    manifest: ScenePackage;
    layouts?: Layout[];
    screenTemplates?: ScreenTemplate[];
    dialogTemplates?: DialogTemplate[];
}
