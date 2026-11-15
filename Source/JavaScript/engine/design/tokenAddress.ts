// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TokenRole } from '@cratis/scene.model';

/**
 * The address a token is known by: `<category>.<name>`, such as `color.primary`.
 *
 * @param role The token role.
 * @returns The address a theme keys its values by and a component variant refers to.
 */
export function tokenAddress(role: TokenRole): string {
    return `${role.category}.${role.name}`;
}
