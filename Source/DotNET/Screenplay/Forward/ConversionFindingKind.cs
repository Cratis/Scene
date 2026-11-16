// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Forward;

/// <summary>
/// The kinds of <see cref="ConversionFinding"/> the conversion of Screenplay into Scene's model reports.
/// </summary>
/// <remarks>
/// The names match the kinds of the same name a Stage render plan reports, so a host that plans a render maps a
/// conversion finding onto its own by name.
/// </remarks>
public enum ConversionFindingKind
{
    /// <summary>
    /// A screen or template uses a behavior the document does not declare.
    /// </summary>
    BehaviorNotFound = 0,

    /// <summary>
    /// The application's navigation names a destination or outlet that does not resolve.
    /// </summary>
    NavigationInvalid = 1,

    /// <summary>
    /// A toolbar button names a slice that does not exist or cannot host a button.
    /// </summary>
    ToolbarButtonInvalid = 2,

    /// <summary>
    /// The application's structure (modules, features, screens) is inconsistent.
    /// </summary>
    StructureInvalid = 3,

    /// <summary>
    /// A sample data pack is declared twice, or names something it does not hold.
    /// </summary>
    SampleDataInvalid = 4
}
