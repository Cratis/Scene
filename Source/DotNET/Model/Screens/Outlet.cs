// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// A named replacement surface for routed or nested screen content.
/// </summary>
/// <param name="Name">Stable outlet name used by destinations.</param>
/// <param name="Description">Optional description for designers.</param>
/// <param name="Accepts">
/// The semantic template types (<see cref="TemplateMetadata.Type"/>) a screen must have to be placed in this
/// outlet. <see langword="null"/> accepts any screen.
/// </param>
public record Outlet(string Name, string? Description = null, IReadOnlyList<string>? Accepts = null);
