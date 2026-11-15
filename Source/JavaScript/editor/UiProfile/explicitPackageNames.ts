// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage } from '@cratis/scene.engine';
import { UiProfileSettings } from './UiProfileSettings';

/**
 * Every package the settings name, in the order they are handed to the resolver: `core` first, then the
 * libraries in priority order, then the shell, then the template packs. The resolver is a stable sort, so
 * this order is what decides override priority among packages nothing forces apart.
 *
 * @param settings The settings to read.
 * @returns The distinct explicit package names.
 */
export function explicitPackageNames(settings: UiProfileSettings): string[] {
    const named = [corePackage, ...settings.packages, settings.shell, settings.root?.template.blueprint ?? '', ...settings.templatePacks];
    return [...new Set(named.filter(name => name.length > 0))];
}
