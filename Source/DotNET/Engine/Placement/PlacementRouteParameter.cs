// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// One route parameter a routed slot is addressed by, with the page's value for it when it has one.
/// </summary>
/// <param name="Name">The name of the parameter, such as <c language="csharp">sku</c>.</param>
/// <param name="Value">The page's value for it, such as <c language="csharp">NK-101</c>; <see langword="null"/> when the page has none yet.</param>
public record PlacementRouteParameter(string Name, string? Value = null);
