// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScenePackageBundle } from '@cratis/scene.react';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';

// Moves a chosen package to where another chosen package is, which is what dropping it on that row means. Refused (undefined) when either is not
// a chosen package, when nothing would move, or when the resolver would not keep the order (a package that depends on another stays after it).
export function reorderPackage(settings: UiProfileSettings, name: string, ontoName: string, bundles: ScenePackageBundle[]): UiProfileSettings | undefined {
    const from = settings.packages.indexOf(name);
    const to = settings.packages.indexOf(ontoName);
    if (from < 0 || to < 0 || from === to) return undefined;

    const packages = [...settings.packages];
    packages.splice(to, 0, ...packages.splice(from, 1));
    const next = { ...settings, packages };

    const before = resolveUiProfile(settings, bundles);
    const after = resolveUiProfile(next, bundles);
    return after.isValid && before.selection.packages.join('\n') !== after.selection.packages.join('\n') ? next : undefined;
}
