// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// One template a blueprint provides, as the gallery lists it.
/// </summary>
/// <param name="Name">The template's name.</param>
/// <param name="Kind">Layout, ScreenTemplate or DialogTemplate.</param>
/// <param name="DisplayName">The name shown in a picker.</param>
/// <param name="Description">One sentence saying what the template is for.</param>
/// <param name="Type">The template type.</param>
/// <param name="Category">The browse category.</param>
/// <param name="Thumbnail">The package-relative thumbnail path.</param>
/// <param name="Outlets">For a shell (a layout, or a screen template with the root role): the names of its outlets, in declaration order.</param>
/// <param name="PrimaryOutlet">For a shell: the outlet every screen's content is placed in. <see langword="null"/> when it is <c language="csharp">content</c>.</param>
/// <param name="Role">The structural role the template takes, for a screen template with one (<c language="csharp">Root</c> marks a shell).</param>
public record BlueprintCatalogTemplate(string Name, string Kind, string? DisplayName = null, string? Description = null, string? Type = null, string? Category = null, string? Thumbnail = null, IReadOnlyList<string>? Outlets = null, string? PrimaryOutlet = null, string? Role = null);
