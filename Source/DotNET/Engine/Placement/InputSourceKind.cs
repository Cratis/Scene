// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// Where a command input gets its value when an action runs, without asking for it in a form. The TypeScript engine uses
/// the same values (<c language="csharp">InputSourceKind</c>).
/// </summary>
public enum InputSourceKind
{
    /// <summary>A path into the data context of the screen, such as the selected product's <c language="csharp">sku</c>.</summary>
    DataContext = 0,

    /// <summary>A route value of the page, such as <c language="csharp">:sku</c>.</summary>
    Route = 1,

    /// <summary>What another component publishes, such as the selected row of a table or what someone typed into an input.</summary>
    Component = 2,

    /// <summary>A constant the author wrote.</summary>
    Constant = 3,
}
