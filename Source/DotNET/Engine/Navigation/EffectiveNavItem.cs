// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// One item a region effectively shows, with its provenance.
/// </summary>
/// <param name="Id">The item identity.</param>
/// <param name="Title">The text shown for the item.</param>
/// <param name="Slot">The slot the target renders into; <c language="csharp">content</c> when the item names none.</param>
/// <param name="Origin">Which level defined the item.</param>
/// <param name="ReadOnly">Whether the item may not be edited here: it is inherited from the application into a module.</param>
/// <param name="Reason">A sentence saying why the item is shown and whether it can be edited here.</param>
/// <param name="Icon">Qualified icon reference, when the item has one.</param>
/// <param name="Target">What the item navigates to, with a module resolved to its first feature; <see langword="null"/> when the item has no target.</param>
/// <param name="Children">The sub-items; only sidebar items have them.</param>
public record EffectiveNavItem(
    string Id,
    string Title,
    string Slot,
    NavigationItemOrigin Origin,
    bool ReadOnly,
    string Reason,
    string? Icon = null,
    ResolvedNavigationTarget? Target = null,
    IReadOnlyList<EffectiveNavItem>? Children = null);
