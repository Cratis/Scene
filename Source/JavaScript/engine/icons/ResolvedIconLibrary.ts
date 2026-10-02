// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackage } from '@cratis/scene.model';

/**
 * An icon library that is active in a profile, with the reason it is.
 */
export interface ResolvedIconLibrary {
    /**
     * The library's identity - what an {@link IconReference.library} names.
     */
    library: string;

    /**
     * The package declaration behind the library: version, license, attribution, renderers.
     */
    package: ScenePackage;

    /**
     * Whether the profile lists the library itself. `false` means it is only active because something
     * else needs it.
     */
    isSelected: boolean;

    /**
     * The names of the active packages that declare a dependency on the library. Together with
     * {@link isSelected} this is the library's provenance: why it is here, and what stops depending on it
     * when it is removed.
     */
    requiredBy: string[];
}
