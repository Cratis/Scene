// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// A named replacement surface for routed or nested screen content.
/// </summary>
/// <param name="Name">Stable outlet name used by destinations.</param>
/// <param name="Description">Optional description for designers.</param>
public record Outlet(string Name, string? Description = null);
