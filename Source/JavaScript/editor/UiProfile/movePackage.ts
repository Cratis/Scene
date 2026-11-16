// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { UiProfileSettings } from './UiProfileSettings';
import { resolveUiProfile } from './resolveUiProfile';

/**
 * Moves one explicit package a step in override priority, or reports that it cannot move.
 *
 * Priority is not free: the resolver always places a package after the packages it depends on, so moving
 * a library past one that depends on it changes nothing. A move is therefore offered only when the
 * resolver's own resulting order differs from the current one and is still valid - the control reflects
 * what Scene would do, not what a list would allow.
 *
 * @param settings The current settings.
 * @param name The explicit package to move.
 * @param direction `-1` to lower its priority, `1` to raise it.
 * @param bundles Every known package bundle.
 * @returns The reordered settings, or `undefined` when the move is not possible.
 */
export function movePackage(settings: UiProfileSettings, name: string, direction: -1 | 1, bundles: ScenePackageBundle[]): UiProfileSettings | undefined {
    const index = settings.packages.indexOf(name);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= settings.packages.length) return undefined;

    const packages = [...settings.packages];
    [packages[index], packages[target]] = [packages[target], packages[index]];
    const next = { ...settings, packages };

    const before = resolveUiProfile(settings, bundles);
    const after = resolveUiProfile(next, bundles);
    const changesOrder = before.selection.packages.join('\n') !== after.selection.packages.join('\n');

    return changesOrder && after.isValid ? next : undefined;
}

/**
 * Whether {@link movePackage} would move the package.
 *
 * @param settings The current settings.
 * @param name The explicit package.
 * @param direction `-1` to lower its priority, `1` to raise it.
 * @param bundles Every known package bundle.
 * @returns `true` when the resolver would honor the move.
 */
export function canMovePackage(settings: UiProfileSettings, name: string, direction: -1 | 1, bundles: ScenePackageBundle[]): boolean {
    return movePackage(settings, name, direction, bundles) !== undefined;
}
