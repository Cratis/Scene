// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconReference } from '@cratis/scene.model';

/**
 * One place an icon is used - a persisted value somewhere in a screen, template, blueprint or profile.
 */
export interface IconUsage {
    /**
     * The icon value as persisted: an {@link IconReference}, or a legacy bare string (an icon font class
     * such as `pi pi-home`) from before icons were library-qualified.
     */
    value: IconReference | string;

    /**
     * Where the value lives, in whatever terms the caller wants reported back (a screen name, a path).
     * Never interpreted.
     */
    location?: string;
}
