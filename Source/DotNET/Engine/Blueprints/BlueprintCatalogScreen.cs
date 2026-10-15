// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// One screen of a blueprint's screen set, as the gallery lists it.
/// </summary>
/// <param name="Name">The screen's name.</param>
/// <param name="Title">The title shown in the navigation.</param>
/// <param name="Description">One sentence saying what the screen is for.</param>
/// <param name="Template">The template the screen is built from.</param>
/// <param name="Parent">The screen it sits under.</param>
/// <param name="Order">Where it sits among its siblings.</param>
public record BlueprintCatalogScreen(string Name, string Title, string? Description = null, string? Template = null, string? Parent = null, int? Order = null);
