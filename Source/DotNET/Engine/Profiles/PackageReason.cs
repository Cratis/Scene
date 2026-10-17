// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The reason line of a package.
/// </summary>
/// <param name="Kind">Why the package is in the list.</param>
/// <param name="Packages">For needed-by: the display names of the packages that need it, in list order.</param>
/// <param name="Text">The line to show: Chosen, Needed by A, B, Used by Shell or Always last.</param>
public record PackageReason(
    PackageReasonKind Kind,
    IReadOnlyList<string> Packages,
    string Text);
