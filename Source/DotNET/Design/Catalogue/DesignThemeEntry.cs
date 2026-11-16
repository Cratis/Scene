// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// A theme a profile may use.
/// </summary>
/// <param name="Name">Its name.</param>
/// <param name="Source">Where it comes from.</param>
/// <param name="Modes">The modes it has.</param>
/// <param name="IsDark">Set to true for a dark theme a package ships.</param>
/// <param name="IsDefault">Set to true for the design system's default theme.</param>
public record DesignThemeEntry(string Name, DesignThemeSource Source, IReadOnlyList<string> Modes, bool? IsDark = null, bool? IsDefault = null);
