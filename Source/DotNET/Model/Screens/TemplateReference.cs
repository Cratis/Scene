// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// How a module, feature or slice refers to the template it uses: an own template by name, or a blueprint
/// template by blueprint, name and the version range of the blueprint it was chosen from.
/// </summary>
/// <param name="Source">Whether the template is the user's own or comes from a blueprint.</param>
/// <param name="Id">The template's name - within the workspace for an own template, within the blueprint for a blueprint template.</param>
/// <param name="Blueprint">The blueprint package name. Present exactly when <paramref name="Source"/> is <see cref="TemplateReferenceSource.Blueprint"/>.</param>
/// <param name="Version">
/// The semver range of the blueprint the reference accepts, such as <c language="csharp">^1.2.0</c>. Defaults to the caret range of the
/// installed blueprint version when a reference is created; absent means any version. Only meaningful for a blueprint reference.
/// </param>
public record TemplateReference(
    TemplateReferenceSource Source,
    string Id,
    string? Blueprint = null,
    string? Version = null);
