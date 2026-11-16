// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// One token role of the design system, with its value in every theme and mode.
/// </summary>
/// <param name="Address">The role as <c language="text">category.name</c>.</param>
/// <param name="Category">Its category.</param>
/// <param name="Name">Its name.</param>
/// <param name="Values">Its values.</param>
/// <param name="Description">What it is for.</param>
public record DesignTokenEntry(string Address, string Category, string Name, IReadOnlyList<DesignTokenValue> Values, string? Description = null);
