// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// What can be wrong with the slots of a stored Scene document, or what upgrading one from the outlet shape could not map.
/// The TypeScript engine uses the same codes, in camel case.
/// </summary>
public enum SlotShapeDiagnosticCode
{
    /// <summary>
    /// The document still uses the outlet shape Scene 5 replaced with slots; upgrade it before saving.
    /// </summary>
    LegacyOutletShape = 0,

    /// <summary>
    /// A slot's role is not page, pane or panel.
    /// </summary>
    UnknownSlotRole = 1,

    /// <summary>
    /// A slot names route parameters but is not routed.
    /// </summary>
    RouteParametersWithoutRouting = 2,

    /// <summary>
    /// More than one slot of the same layout or screen template is marked primary.
    /// </summary>
    MultiplePrimarySlots = 3,

    /// <summary>
    /// The legacy primary outlet names a slot the layout or screen template does not declare.
    /// </summary>
    PrimarySlotNotDeclared = 4,

    /// <summary>
    /// An object has both the legacy outlet and the new slot key, with different values.
    /// </summary>
    ConflictingSlotKey = 5,

    /// <summary>
    /// The document still has a feature or module toolbar Scene 5 replaced with the toolbar outlet; upgrade it before saving.
    /// </summary>
    LegacyToolbarShape = 6,

    /// <summary>
    /// An outlet's kind is not actions, filters, tabs, stats or navigation.
    /// </summary>
    UnknownOutletKind = 7,

    /// <summary>
    /// A navigation model lists navigation regions, which Scene 5 replaced with outlets of navigation; upgrade it before saving.
    /// </summary>
    LegacyNavigationShape = 8,

    /// <summary>
    /// A screen contributes navigation items to a contribution point, which Scene 5 replaced with contributions to an outlet of navigation;
    /// upgrade it before saving.
    /// </summary>
    LegacyNavigationContribution = 9,

    /// <summary>
    /// An <c language="csharp">action</c> component stores a presentation, which Scene 5 replaced with <c language="csharp">opens</c>; or its
    /// presentation cannot become one.
    /// </summary>
    LegacyActionPresentation = 10,

    /// <summary>
    /// An action opens somewhere that is not automatic, none, dialog, drawer or slot.
    /// </summary>
    UnknownOpens = 11,

    /// <summary>
    /// An action opens in a slot but does not name one.
    /// </summary>
    OpensSlotWithoutName = 12,

    /// <summary>
    /// A screen fits a place that is not a dialog, a drawer, a pane, a panel or a page.
    /// </summary>
    UnknownScreenFit = 13,

    /// <summary>
    /// The document still has a <c language="csharp">core:toolbar</c> element or its <c language="csharp">core:toolbarItem</c> items,
    /// which Scene 5 replaced with an outlet of actions drawn by <c language="csharp">core:outletItems</c>; or such a toolbar holds
    /// something an outlet button cannot carry.
    /// </summary>
    LegacyToolbarElement = 14,

    /// <summary>
    /// An outlet item has no kind, or one that is not a button, menu entry, separator, group, filter, tab, stat or navigation item.
    /// </summary>
    UnknownOutletItemKind = 15,

    /// <summary>
    /// An outlet item is of a kind its outlet, or the group it sits in, does not take, such as a tab in an outlet of actions.
    /// </summary>
    OutletItemKindMismatch = 16,

    /// <summary>
    /// An outlet item lacks what its kind needs: an id, a title, the screen a tab shows or the items of a group.
    /// </summary>
    IncompleteOutletItem = 17,

    /// <summary>
    /// An old toolbar item had presentation hints, such as a placement, which an outlet button has no place for;
    /// the upgrade drops them and upgrades the item.
    /// </summary>
    DroppedPresentationHints = 18,

    /// <summary>
    /// A button of an outlet of actions shows something that is not its icon and title, its icon or its title.
    /// </summary>
    UnknownButtonDisplay = 19,
}
