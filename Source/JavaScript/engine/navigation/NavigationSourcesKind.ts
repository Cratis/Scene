// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How a region's effective items relate to the application's. The values are shared with the C# engine.
 */
export enum NavigationSourcesKind {
    /** The application level: every region is defined here. */
    DefinedHere = 'definedHere',

    /** A module region that shows the application's items. */
    Inherited = 'inherited',

    /** A module region that shows the application's items and its own. */
    Extended = 'extended',

    /** A module region that shows its own items only. */
    Overridden = 'overridden',
}
