// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What can be wrong with the outlets of a chain of levels. The C# engine uses the same codes, in Pascal case.
 */
export enum OutletDiagnosticCode {
    /** No level of the chain declares the outlet asked for. */
    UnknownOutlet = 'unknownOutlet',

    /** A level declares an outlet a level above it already declares. */
    DuplicateOutlet = 'duplicateOutlet',

    /** A level refines an outlet no level above it declares. */
    RefinementOfUnknownOutlet = 'refinementOfUnknownOutlet',

    /** A level contributes to an outlet no level declares. */
    ContributionToUnknownOutlet = 'contributionToUnknownOutlet',

    /** A level hides an item the outlet it inherits does not have. */
    HiddenItemMissing = 'hiddenItemMissing',

    /** An item goes before or after an item the outlet does not have; it goes last. */
    PlacementTargetMissing = 'placementTargetMissing',

    /** An item is of a kind the outlet does not take, such as a tab in an outlet of actions; it is left out. */
    ItemKindMismatch = 'itemKindMismatch',

    /** An item has the id of an item the outlet already has; it is left out. */
    DuplicateItemId = 'duplicateItemId',

    /** A level inherits an outlet unchanged but has items or hides, which are ignored. */
    ItemsIgnoredWhenInheriting = 'itemsIgnoredWhenInheriting',

    /** An outlet of tabs names no slot to show its screens in. */
    TabsNeedSlot = 'tabsNeedSlot',

    /** An outlet that is not of actions names a subject. */
    SubjectOnlyForActions = 'subjectOnlyForActions',
}
