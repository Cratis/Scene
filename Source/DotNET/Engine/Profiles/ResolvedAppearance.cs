// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The appearance as a renderer applies it.
/// </summary>
/// <param name="ColorScheme">The scheme in effect: never <see cref="Model.Profiles.ColorScheme.System"/>.</param>
/// <param name="Tokens">The effective semantic tokens: the theme's, with the accent, the corner radius and the font family applied.</param>
/// <param name="Font">The id of the font in effect; the system font when the chosen one is unavailable, <see langword="null"/> when the profile chooses none.</param>
/// <param name="FontStylesheet">The stylesheet a host loads to get a hosted font.</param>
/// <param name="Diagnostics">Everything that was refused.</param>
public record ResolvedAppearance(
    ColorScheme ColorScheme,
    IReadOnlyDictionary<string, string> Tokens,
    string? Font,
    string? FontStylesheet,
    IReadOnlyList<AppearanceDiagnostic> Diagnostics);
