// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a design-time host found for one extension point request.
 *
 * When `contribution` is absent the host renders its generic fallback - the default preview, the
 * descriptor-driven inspector, the default editor for the property's value type - and `diagnostic` says
 * why, unless nothing was requested in the first place.
 */
export interface DesignTimeResolution<T> {
    /** The package-provided contribution, when one was found and loaded. */
    contribution?: T;

    /** The package that provided it. */
    package?: string;

    /** The host-provided editor kind used instead, for property editors the host implements itself. */
    hostKind?: string;

    /** Why the generic fallback is used. Absent when the request was satisfied or nothing was requested. */
    diagnostic?: string;
}
