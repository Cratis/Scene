// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfileSettings } from './UiProfileSettings';
import { sizeClassOf } from './ProfileSizeClass';

/**
 * Chooses the size class the profile assumes by default. A value that is not a size class - empty, say - clears the choice.
 *
 * @param settings The current settings.
 * @param value What the editor produced.
 * @returns The settings with that size class, or without one.
 */
export function withSizeClass<T extends UiProfileSettings>(settings: T, value: unknown): T {
    const { sizeClass: _previous, ...rest } = settings;
    const chosen = sizeClassOf(typeof value === 'string' ? value : undefined);
    return (chosen ? { ...rest, sizeClass: chosen } : rest) as T;
}
