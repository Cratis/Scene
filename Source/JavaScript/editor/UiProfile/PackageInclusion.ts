// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Why a package is part of the resolved profile. */
export enum PackageInclusion {
    /** Always present: Scene's `core`, the final fallback every name resolves against. */
    Fallback = 'fallback',

    /** Chosen by the user - as a library, the shell or a template pack. */
    Explicit = 'explicit',

    /** Not chosen; present only because another package in the profile requires it. */
    Automatic = 'automatic',
}
