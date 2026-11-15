// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// The values the keys of a profile take.
/// </summary>
/// <param name="ColorSchemes">The colour schemes.</param>
/// <param name="Corners">The corner styles.</param>
/// <param name="Fonts">The fonts.</param>
/// <param name="Themes">The themes.</param>
/// <param name="RootTemplates">The root templates.</param>
/// <param name="NewScreenTemplates">The templates new screens may be built on.</param>
public record DesignProfileValues(
    IReadOnlyList<string> ColorSchemes,
    IReadOnlyList<string> Corners,
    IReadOnlyList<string> Fonts,
    IReadOnlyList<string> Themes,
    IReadOnlyList<string> RootTemplates,
    IReadOnlyList<string> NewScreenTemplates);
