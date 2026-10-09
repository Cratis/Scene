// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What is wrong with a navigation destination. The values are shared with the C# engine so both report
 * the same code for the same model.
 */
export enum NavigationDiagnosticCode {
    /** Two destinations that go to different targets share one URL. */
    DuplicateRoute = 'duplicateRoute',

    /** Two surfaces declare an outlet with the same name, so a destination cannot tell them apart. */
    DuplicateOutlet = 'duplicateOutlet',

    /** A destination names an outlet that no layout or screen template declares. */
    MissingOutlet = 'missingOutlet',

    /** A destination names an outlet that cannot host what it opens. */
    IncompatibleOutlet = 'incompatibleOutlet',

    /** Screens are placed in outlets owned by each other, so composition never terminates. */
    NavigationCycle = 'navigationCycle',

    /** A destination opens a screen or dialog that does not exist, or names nothing to open. */
    UnavailableTarget = 'unavailableTarget',
}
