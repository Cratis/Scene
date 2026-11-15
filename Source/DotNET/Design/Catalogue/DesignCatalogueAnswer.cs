// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// What the catalogue answers: a list, a description, or that nothing of that name is there.
/// </summary>
/// <param name="Found">Whether there was an answer.</param>
/// <param name="Items">The items of a list.</param>
/// <param name="Item">The description of one thing.</param>
public record DesignCatalogueAnswer(bool Found, IReadOnlyList<object>? Items = null, object? Item = null);
