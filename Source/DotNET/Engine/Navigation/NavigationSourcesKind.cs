// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// How a region's effective items relate to the application's. The camel-cased names are shared with the TypeScript engine.
/// </summary>
public enum NavigationSourcesKind
{
    /// <summary>The application level: every region is defined here.</summary>
    DefinedHere = 0,

    /// <summary>A module region that shows the application's items.</summary>
    Inherited = 1,

    /// <summary>A module region that shows the application's items and its own.</summary>
    Extended = 2,

    /// <summary>A module region that shows its own items only.</summary>
    Overridden = 3,
}
