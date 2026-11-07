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
}
