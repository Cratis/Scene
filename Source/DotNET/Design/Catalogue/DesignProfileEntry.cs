// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// The UI profile a design changes.
/// </summary>
/// <param name="Name">Its name.</param>
/// <param name="Packages">Its packages.</param>
/// <param name="Values">The values its keys take.</param>
/// <param name="Theme">Its theme.</param>
/// <param name="Layout">Its layout.</param>
/// <param name="Root">Its root template.</param>
public record DesignProfileEntry(string Name, IReadOnlyList<string> Packages, DesignProfileValues Values, string? Theme = null, string? Layout = null, string? Root = null);
