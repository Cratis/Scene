// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// What can be wrong with the outlets of a chain of levels. The TypeScript engine uses the same codes, in camel case.
/// </summary>
public enum OutletDiagnosticCode
{
    /// <summary>No level of the chain declares the outlet asked for.</summary>
    UnknownOutlet = 0,

    /// <summary>A level declares an outlet a level above it already declares.</summary>
    DuplicateOutlet = 1,

    /// <summary>A level refines an outlet no level above it declares.</summary>
    RefinementOfUnknownOutlet = 2,

    /// <summary>A level contributes to an outlet no level declares.</summary>
    ContributionToUnknownOutlet = 3,

    /// <summary>A level hides an item the outlet neither inherits nor receives as a contribution.</summary>
    HiddenItemMissing = 4,

    /// <summary>An item goes before or after an item the outlet does not have; it goes last.</summary>
    PlacementTargetMissing = 5,

    /// <summary>An item is of a kind the outlet does not take, such as a tab in an outlet of actions; it is left out.</summary>
    ItemKindMismatch = 6,

    /// <summary>An item has the id of an item the outlet already has; it is left out.</summary>
    DuplicateItemId = 7,

    /// <summary>A level inherits an outlet unchanged but has items or hides, which are ignored.</summary>
    ItemsIgnoredWhenInheriting = 8,

    /// <summary>An outlet of tabs names no slot to show its screens in.</summary>
    TabsNeedSlot = 9,

    /// <summary>An outlet that is not of actions names a subject.</summary>
    SubjectOnlyForActions = 10,

    /// <summary>A level places an item before one that comes from above it; own items never go above inherited ones, so it goes first after them.</summary>
    PlacementAboveInherited = 11,
}
