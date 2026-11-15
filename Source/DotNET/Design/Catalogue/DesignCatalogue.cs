// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.DesignSystems;

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// What a design is grounded in, built deterministically from the design system, the themes, the profile's packages, the screen templates and
/// what the host supplies. Every design operation is checked against it, and the AI read tools answer from it.
/// </summary>
/// <param name="Tokens">The design system's token roles.</param>
/// <param name="DesignComponents">The design system's components.</param>
/// <param name="Themes">The themes a profile may use.</param>
/// <param name="Components">The components of the profile's packages.</param>
/// <param name="Templates">The screen templates a screen may be built on.</param>
/// <param name="Shapes">The data shapes.</param>
/// <param name="Queries">The queries.</param>
/// <param name="Commands">The commands.</param>
/// <param name="DesignSystem">The name of the design system.</param>
/// <param name="Words">The design system's words.</param>
/// <param name="Profile">The profile.</param>
/// <param name="TemplateSet">The templates a session may use, when it is constrained; the catalogue lists only these.</param>
public record DesignCatalogue(
    IReadOnlyList<DesignTokenEntry> Tokens,
    IReadOnlyList<DesignSystemComponentEntry> DesignComponents,
    IReadOnlyList<DesignThemeEntry> Themes,
    IReadOnlyList<DesignComponentEntry> Components,
    IReadOnlyList<DesignTemplateEntry> Templates,
    IReadOnlyList<DesignShapeEntry> Shapes,
    IReadOnlyList<DesignQueryEntry> Queries,
    IReadOnlyList<DesignCommandEntry> Commands,
    string? DesignSystem = null,
    DesignWords? Words = null,
    DesignProfileEntry? Profile = null,
    IReadOnlyList<string>? TemplateSet = null);
