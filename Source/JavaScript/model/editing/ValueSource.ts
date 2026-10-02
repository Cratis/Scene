// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where a property's effective value came from.
 */
export enum ValueSource {
    /** The descriptor's default - nothing sets it. */
    Default = 'default',

    /** Set on the node itself (or by the owning template's author). */
    Local = 'local',

    /** Set by a template instance through an exposed property. */
    Instance = 'instance',
}
