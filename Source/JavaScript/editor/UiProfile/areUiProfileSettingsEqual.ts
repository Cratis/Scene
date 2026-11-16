// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { areSampleDataEqual, sampleDataOf } from './sampleDataOf';
import { UiProfileSettings } from './UiProfileSettings';

/**
 * Whether two settings make the same choices. Package order is compared because it is override priority.
 *
 * @param left The first settings.
 * @param right The second settings.
 * @returns `true` when nothing differs.
 */
export function areUiProfileSettingsEqual(left: UiProfileSettings, right: UiProfileSettings): boolean {
    return (
        left.shell === right.shell &&
        JSON.stringify(left.root ?? null) === JSON.stringify(right.root ?? null) &&
        left.theme === right.theme &&
        left.colorScheme === right.colorScheme &&
        left.navigationMode === right.navigationMode &&
        left.accent === right.accent &&
        (left.corners ?? '') === (right.corners ?? '') &&
        (left.font ?? '') === (right.font ?? '') &&
        (left.menuTheme ?? '') === (right.menuTheme ?? '') &&
        JSON.stringify(left.identity ?? null) === JSON.stringify(right.identity ?? null) &&
        left.defaultScreenTemplate === right.defaultScreenTemplate &&
        (left.sizeClass ?? '') === (right.sizeClass ?? '') &&
        areSampleDataEqual(sampleDataOf(left), sampleDataOf(right)) &&
        left.packages.join('\n') === right.packages.join('\n') &&
        left.templatePacks.join('\n') === right.templatePacks.join('\n')
    );
}
