// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// Why an action's slice cannot open where it asks to. The TypeScript engine uses the same values
/// (<c language="csharp">PlacementProblem</c>).
/// </summary>
public enum PlacementProblem
{
    /// <summary>The action opens a screen, but the slice has none; it can only run directly.</summary>
    NoScreen = 0,

    /// <summary>The action runs directly, but an input has no source, so it needs the form.</summary>
    InputsWithoutSource = 1,

    /// <summary>The action opens automatically, but the page has nothing free that the slice fits.</summary>
    NothingFits = 2,

    /// <summary>The action opens in a dialog or a drawer the slice does not list in what it fits.</summary>
    NotFitted = 3,

    /// <summary>The action opens in a slot but does not name one.</summary>
    SlotNotNamed = 4,

    /// <summary>The action opens in a slot the page does not declare.</summary>
    SlotNotDeclared = 5,

    /// <summary>The action opens in a slot the page's own content already fills.</summary>
    SlotFilled = 6,

    /// <summary>The action opens in a slot whose role the slice does not list in what it fits.</summary>
    RoleNotFitted = 7,
}
