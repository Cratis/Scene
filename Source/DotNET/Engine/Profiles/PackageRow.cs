// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One row of the package list.
/// </summary>
/// <param name="Position">1 is the strongest package: the one that wins when two supply the same component.</param>
/// <param name="Name">The package name.</param>
/// <param name="DisplayName">The name to show.</param>
/// <param name="Version">The installed version.</param>
/// <param name="Kind">What the package contributes.</param>
/// <param name="Description">The one-line description.</param>
/// <param name="Reason">Why it is in the list.</param>
/// <param name="CanMoveUp">Whether it can move up.</param>
/// <param name="CanMoveDown">Whether it can move down.</param>
/// <param name="Lock">Present when the package cannot be removed.</param>
public record PackageRow(
    int Position,
    string Name,
    string DisplayName,
    string Version,
    PackageKind Kind,
    string? Description,
    PackageReason Reason,
    bool CanMoveUp,
    bool CanMoveDown,
    PackageLock? Lock);
