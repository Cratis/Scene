// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';

/**
 * What an action control does when the user lacks the permission it needs (spec Part B 1.5): it is shown and works, shown and
 * refuses, or not shown. A template never assumes a role, so every action declares one of these and the host's permission
 * evaluation sets it.
 */
export enum PermissionRule {
    /** The control works. */
    Enabled = 'enabled',

    /** The control is shown but cannot be used, and says why. */
    Disabled = 'disabled',

    /** The control is not rendered. */
    Hidden = 'hidden',
}

/** Reads a permission rule from a property, defaulting to Enabled for anything that is not a rule. */
export function readPermissionRule(element: ExternalComponent, property = 'permission'): PermissionRule {
    const value = element.properties[property];
    return value === PermissionRule.Disabled || value === PermissionRule.Hidden ? value : PermissionRule.Enabled;
}
