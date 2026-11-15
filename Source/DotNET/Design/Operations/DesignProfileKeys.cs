// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// The keys of a UI profile a design may change.
/// </summary>
public static class DesignProfileKeys
{
    /// <summary>The theme.</summary>
    public const string Theme = "theme";

    /// <summary>The colour scheme: light, dark or system.</summary>
    public const string ColorScheme = "colorScheme";

    /// <summary>The accent colour.</summary>
    public const string Accent = "accent";

    /// <summary>The corner style.</summary>
    public const string Corners = "corners";

    /// <summary>The font.</summary>
    public const string Font = "font";

    /// <summary>The root template - the shell.</summary>
    public const string RootTemplate = "rootTemplate";

    /// <summary>The template new screens are built on.</summary>
    public const string NewScreenTemplate = "newScreenTemplate";

    /// <summary>
    /// Gets every key, in the order a design lists them.
    /// </summary>
    public static readonly IReadOnlyList<string> All = [Theme, ColorScheme, Accent, Corners, Font, RootTemplate, NewScreenTemplate];
}
