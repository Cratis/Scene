// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// The outcome of expanding a chosen set of package names into the full set a
/// <see cref="Model.Profiles.UiProfile"/> actually needs.
/// </summary>
/// <param name="Packages">
/// Every package the selection requires, in ascending override-priority order: a package always appears
/// after the packages it depends on, so a package that layers on top of another shadows it on a name
/// collision. That is the order a <see cref="Model.Profiles.UiProfile.Packages"/> list should carry.
/// </param>
/// <param name="Added">
/// The packages pulled in transitively that the caller did not choose - what a package picker tells the
/// user it is about to add on their behalf.
/// </param>
/// <param name="Missing">Dependencies nothing in the catalog can satisfy.</param>
/// <param name="VersionConflicts">Dependencies satisfied by name but not by version.</param>
/// <param name="Cycles">
/// Dependency cycles found while ordering, each listed as the packages involved. A cycle has no valid
/// priority order, so its members are emitted in catalog order and reported here rather than silently
/// arranged into one.
/// </param>
public record PackageSelection(
    IReadOnlyList<string> Packages,
    IReadOnlyList<string> Added,
    IReadOnlyList<MissingPackageDependency> Missing,
    IReadOnlyList<PackageVersionConflict> VersionConflicts,
    IReadOnlyList<IReadOnlyList<string>> Cycles)
{
    /// <summary>
    /// Whether the selection is complete and orderable - nothing missing, no version conflict, no cycle.
    /// </summary>
    public bool IsValid => Missing.Count == 0 && VersionConflicts.Count == 0 && Cycles.Count == 0;
}
