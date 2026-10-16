// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// What the effective shell is resolved against.
/// </summary>
/// <param name="Library">The application's own templates and the blueprints that are available.</param>
/// <param name="Screens">The application's screens. When given, content placed in an outlet the shell lacks is reported.</param>
/// <param name="Themes">The themes known to the host. When given, the profile's theme is checked against its packages.</param>
/// <param name="AvailablePackages">The names of every package that is available. When given, packages of the profile that are not in it are reported.</param>
public record ShellResolutionContext(
    TemplateLibrary Library,
    IReadOnlyList<Screen>? Screens = null,
    IReadOnlyList<Theme>? Themes = null,
    IReadOnlyList<string>? AvailablePackages = null);
