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

    /** A navigation model lists navigation regions, which Scene 5 replaced with outlets of navigation. */
    LegacyNavigationShape = 'legacyNavigationShape',

    /** A screen contributes navigation items to a contribution point, which Scene 5 replaced with contributions to an outlet of navigation. */
    LegacyNavigationContribution = 'legacyNavigationContribution',

    /** An `action` component stores a presentation, which Scene 5 replaced with `opens`; or its presentation cannot become one. */
    LegacyActionPresentation = 'legacyActionPresentation',

    /** An action opens somewhere that is not automatic, none, dialog, drawer or slot. */
    UnknownOpens = 'unknownOpens',

    /** An action opens in a slot but does not name one. */
    OpensSlotWithoutName = 'opensSlotWithoutName',

    /** A screen fits a place that is not a dialog, a drawer, a pane, a panel or a page. */
    UnknownScreenFit = 'unknownScreenFit',

    /**
     * The document still has a `core:toolbar` element or its `core:toolbarItem` items, which Scene 5 replaced with an outlet of
     * actions drawn by `core:outletItems`; or such a toolbar holds something an outlet button cannot carry.
     */
    LegacyToolbarElement = 'legacyToolbarElement',

    /** An outlet item has no kind, or one that is not a button, menu entry, separator, group, filter, tab, stat or navigation item. */
    UnknownOutletItemKind = 'unknownOutletItemKind',

    /** An outlet item is of a kind its outlet, or the group it sits in, does not take, such as a tab in an outlet of actions. */
    OutletItemKindMismatch = 'outletItemKindMismatch',

    /** An outlet item lacks what its kind needs: an id, a title, the screen a tab shows or the items of a group. */
    IncompleteOutletItem = 'incompleteOutletItem',

    /**
     * An old toolbar item had presentation hints, such as showing only its icon, which an outlet button has no place for;
     * the upgrade drops them and upgrades the item.
     */
    DroppedPresentationHints = 'droppedPresentationHints',
}
