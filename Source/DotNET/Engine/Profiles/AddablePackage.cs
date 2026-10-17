// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// A package that is not in the list, with what adding it would also add.
/// </summary>
/// <param name="Name">The package name.</param>
/// <param name="DisplayName">The name to show.</param>
/// <param name="Version">The version.</param>
/// <param name="Kind">What the package contributes.</param>
/// <param name="Description">The one-line description.</param>
/// <param name="AlsoAdds">The display names of the packages that would be added with it, dependencies first and excluding itself.</param>
/// <param name="Text">A sentence for the list: empty when nothing else is added, otherwise Also adds A, B.</param>
public record AddablePackage(
    string Name,
    string DisplayName,
    string Version,
    PackageKind Kind,
    string? Description,
    IReadOnlyList<string> AlsoAdds,
    string Text);
