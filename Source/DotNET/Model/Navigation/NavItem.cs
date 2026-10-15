// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// One item of a navigation region.
/// </summary>
/// <param name="Id">The item identity, unique in its region at the level that owns it.</param>
/// <param name="Title">The text shown for the item.</param>
/// <param name="Icon">Qualified icon reference, when the item has one.</param>
/// <param name="Target">What the item navigates to: <see cref="DestinationReference.Module"/>, and optionally <see cref="DestinationReference.Feature"/> (a dotted path inside the module). A module without a feature goes to the module's first feature.</param>
/// <param name="Slot">The rendering slot - an outlet id - the target renders into; <c language="csharp">content</c>, the primary outlet, when absent.</param>
/// <param name="Children">The sub-items; only a sidebar item has them.</param>
public record NavItem(
    string Id,
    string Title,
    string? Icon = null,
    DestinationReference? Target = null,
    string? Slot = null,
    IReadOnlyList<NavItem>? Children = null);
