// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// The custom runtime packages a host approved on top of the packages it ships, in canonical (ordinal name) order.
/// </summary>
/// <remarks>
/// The set is data, not code. Planning (the CLI, Stage's disk planner and live host) reads
/// <see cref="Catalog"/> to resolve a <c language="csharp">ui profile</c>; a frontend build installs each
/// <see cref="PackageModuleReference"/> and the React host imports it through
/// <c language="typescript">loadApprovedPackages</c>. Read and write it with <see cref="ApprovedPackageSetJson"/>.
/// </remarks>
/// <param name="Packages">The approved packages.</param>
public record ApprovedPackageSet(IReadOnlyList<ApprovedPackage> Packages)
{
    /// <summary>
    /// Gets the set that approves nothing beyond what the host ships.
    /// </summary>
    public static ApprovedPackageSet Empty { get; } = new([]);

    /// <summary>
    /// Gets whether the set approves no package.
    /// </summary>
    public bool IsEmpty => Packages.Count == 0;

    /// <summary>
    /// Gets the package declarations a planner resolves profiles against.
    /// </summary>
    public IReadOnlyList<ScenePackage> Catalog => [.. Packages.Select(package => package.Manifest)];
}
