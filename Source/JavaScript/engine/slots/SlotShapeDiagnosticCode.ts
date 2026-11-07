// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What can be wrong with the slots of a stored Scene document, or what upgrading one from the outlet shape could not
 * map. The C# engine uses the same codes (`SlotShapeDiagnosticCode`).
 */
export enum SlotShapeDiagnosticCode {
    /** The document still uses the outlet shape Scene 5 replaced with slots; upgrade it before saving. */
    LegacyOutletShape = 'legacyOutletShape',

    /** A slot's role is not `page`, `pane` or `panel`. */
    UnknownSlotRole = 'unknownSlotRole',

    /** A slot names route parameters but is not routed. */
    RouteParametersWithoutRouting = 'routeParametersWithoutRouting',

    /** More than one slot of the same layout or screen template is marked primary. */
    MultiplePrimarySlots = 'multiplePrimarySlots',

    /** The legacy primary outlet names a slot the layout or screen template does not declare. */
    PrimarySlotNotDeclared = 'primarySlotNotDeclared',

    /** An object has both the legacy `outlet` and the new `slot` key, with different values. */
    ConflictingSlotKey = 'conflictingSlotKey',

    /** The document still has a feature or module toolbar Scene 5 replaced with the toolbar outlet; upgrade it before saving. */
    LegacyToolbarShape = 'legacyToolbarShape',

    /** An outlet's kind is not actions, filters, tabs, stats or navigation. */
    UnknownOutletKind = 'unknownOutletKind',
}
