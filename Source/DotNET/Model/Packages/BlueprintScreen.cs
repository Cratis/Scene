// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Icons;

namespace Cratis.Scene.Model.Packages;

/// <summary>
/// One screen of a domain blueprint's ready-to-use screen set, with where it sits in the navigation the blueprint brings.
/// The screen itself (its layout, template and content) is a <see cref="Screens.Screen"/> the package provides under the same name;
/// this is the part a gallery and a navigation builder need without loading it.
/// </summary>
/// <param name="Name">The name of the screen the package provides. Unique within the screen set.</param>
/// <param name="Title">The title shown in the navigation and in the gallery.</param>
/// <param name="Description">One sentence saying what the screen is for.</param>
/// <param name="Template">The name of the screen template the screen is built from, when it is built from one.</param>
/// <param name="Parent">The name of the screen this one sits under in the navigation; absent for a top-level screen.</param>
/// <param name="Order">Where the screen sits among its siblings; lower comes first, and screens without an order keep the order they are written in.</param>
/// <param name="Icon">The icon beside the title in the navigation.</param>
public record BlueprintScreen(
    string Name,
    string Title,
    string? Description = null,
    string? Template = null,
    string? Parent = null,
    int? Order = null,
    IconReference? Icon = null);
