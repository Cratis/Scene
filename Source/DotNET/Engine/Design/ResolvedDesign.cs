// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model.DesignSystems;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// A design system resolved for one theme and mode, with the appearance of the profile applied: what a renderer draws.
/// </summary>
/// <param name="DesignSystem">The name of the design system.</param>
/// <param name="Theme">The name of the theme in effect.</param>
/// <param name="Mode">The mode in effect, or <see langword="null"/> when the design system declares none.</param>
/// <param name="ColorScheme">The scheme in effect: never <see cref="Model.Profiles.ColorScheme.System"/>.</param>
/// <param name="Tokens">The value of each token role, with the accent, corners and font of the profile applied.</param>
/// <param name="Components">The components, every part resolved to a value.</param>
/// <param name="Appearance">What the appearance of the profile resolved to: the font and the diagnostics of refusing an accent, a font or a binding.</param>
/// <param name="Diagnostics">What went wrong selecting the theme and mode, and resolving the parts.</param>
public record ResolvedDesign(
    string DesignSystem,
    string Theme,
    string? Mode,
    ColorScheme ColorScheme,
    IReadOnlyDictionary<string, string> Tokens,
    IReadOnlyList<ResolvedDesignComponent> Components,
    ResolvedAppearance Appearance,
    IReadOnlyList<DesignDiagnostic> Diagnostics);
