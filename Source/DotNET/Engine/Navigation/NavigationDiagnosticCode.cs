// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// What is wrong with a navigation destination. The camel-cased names are shared with the TypeScript engine.
/// </summary>
public enum NavigationDiagnosticCode
{
    /// <summary>Two destinations that go to different targets share one URL.</summary>
    DuplicateRoute = 0,

    /// <summary>Two surfaces declare an outlet with the same name, so a destination cannot tell them apart.</summary>
    DuplicateOutlet = 1,

    /// <summary>A destination names an outlet that no layout or screen template declares.</summary>
    MissingOutlet = 2,

    /// <summary>A destination names an outlet that cannot host what it opens.</summary>
    IncompatibleOutlet = 3,

    /// <summary>Screens are placed in outlets owned by each other, so composition never terminates.</summary>
    NavigationCycle = 4,

    /// <summary>A destination opens a screen or dialog that does not exist, or names nothing to open.</summary>
    UnavailableTarget = 5,
}
