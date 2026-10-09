// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference } from '@cratis/scene.model';

/**
 * The route a destination gets when no route override was authored: its screen name, or its stable
 * module/feature/slice identity as a path.
 */
export function identityRoute(destination: DestinationReference): string | undefined {
    if (destination.screen) return destination.screen;
    const parts = [destination.module, destination.feature, destination.slice].filter((part): part is string => typeof part === 'string' && part.length > 0);
    return parts.length ? parts.join('/') : undefined;
}
