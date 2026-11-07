// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Why an action's slice cannot open where it asks to. The C# engine uses the same values (`PlacementProblem`).
 */
export enum PlacementProblem {
    /** The action opens a screen, but the slice has none; it can only run directly. */
    NoScreen = 'noScreen',

    /** The action runs directly, but an input has no source, so it needs the form. */
    InputsWithoutSource = 'inputsWithoutSource',

    /** The action opens automatically, but the page has nothing free that the slice fits. */
    NothingFits = 'nothingFits',

    /** The action opens in a dialog or a drawer the slice does not list in what it fits. */
    NotFitted = 'notFitted',

    /** The action opens in a slot but does not name one. */
    SlotNotNamed = 'slotNotNamed',

    /** The action opens in a slot the page does not declare. */
    SlotNotDeclared = 'slotNotDeclared',

    /** The action opens in a slot the page's own content already fills. */
    SlotFilled = 'slotFilled',

    /** The action opens in a slot whose role the slice does not list in what it fits. */
    RoleNotFitted = 'roleNotFitted',
}
