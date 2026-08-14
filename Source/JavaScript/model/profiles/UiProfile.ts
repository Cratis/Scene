// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SizeClass } from '../sizeClasses';

/**
 * A named target: a platform, a default size class, and an ordered list of component packages.
 * Declaration order in `packages` is override priority — a later package shadows an earlier one when
 * both resolve the same bare component name. `core` is always the final fallback, so a minimum
 * vocabulary resolves regardless of which packages a profile lists.
 */
export interface UiProfile {
    name: string;
    targetPlatform: string;
    packages: string[];
    defaultSizeClass?: SizeClass;
}

export const UiProfilePropertyNames: (keyof UiProfile)[] = ['name', 'targetPlatform', 'packages', 'defaultSizeClass'];
