// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// Where in the chain an <see cref="OutletLevel"/> sits, from the top down: a layout or template declares outlets, a module,
/// feature, slice or screen refines them. The TypeScript engine uses the same values, in camel case.
/// </summary>
public enum OutletLevelKind
{
    /// <summary>A layout - the application's shell.</summary>
    Layout = 0,

    /// <summary>A screen or dialog template.</summary>
    Template = 1,

    /// <summary>A module.</summary>
    Module = 2,

    /// <summary>A feature or sub-feature.</summary>
    Feature = 3,

    /// <summary>A slice.</summary>
    Slice = 4,

    /// <summary>A screen.</summary>
    Screen = 5,
}
