// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';
import { UiProfileSettings } from './UiProfileSettings';

/**
 * The layout the profile's root template names, when the root is a blueprint's layout the bundles know.
 *
 * @param settings The settings to read.
 * @param bundles Every known package bundle.
 * @returns The layout name, or `undefined` when the profile has no such root (the shell's first layout is then the shell).
 */
export function rootLayoutOf(settings: UiProfileSettings, bundles: ScenePackageBundle[]): string | undefined {
    const template = settings.root?.template;
    if (template?.source !== TemplateReferenceSource.Blueprint || template.blueprint === undefined) return undefined;
    return bundles.find(bundle => bundle.manifest.name === template.blueprint)?.manifest.layouts.includes(template.id) ? template.id : undefined;
}
