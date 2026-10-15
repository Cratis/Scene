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
public record BlueprintCatalogTemplate(string Name, string Kind, string? DisplayName = null, string? Description = null, string? Type = null, string? Category = null, string? Thumbnail = null);
