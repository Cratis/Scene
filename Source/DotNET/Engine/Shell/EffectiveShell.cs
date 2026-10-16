// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Blueprints;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// The one answer to "what is this application's shell?", the same for every host.
/// </summary>
/// <param name="Origin">Where in the resolution order the shell came from.</param>
/// <param name="Reference">The pinned reference to the shell. <see langword="null"/> for the built-in bare shell.</param>
/// <param name="Kind">Whether the shell is a layout or a root screen template.</param>
/// <param name="Source">Whose template the shell is.</param>
/// <param name="Name">The shell's name.</param>
/// <param name="Outlets">The names of the shell's outlets (slots), in declaration order.</param>
/// <param name="PrimaryOutlet">The outlet every screen's content is placed in. <c language="csharp">content</c> unless the shell names another.</param>
/// <param name="Options">The shell's own configuration, as the profile wrote it. Empty when the profile leaves everything at the shell's defaults.</param>
/// <param name="Diagnostics">Everything found wrong, in a stable order: the root and fallbacks first, then the profile's theme and packages, then the screens.</param>
/// <param name="Package">The package that supplies the shell. <see langword="null"/> for the built-in bare shell and for a template of the application itself.</param>
/// <param name="PackageVersion">The installed version of the supplying package.</param>
/// <param name="Pin">How the shell's pin relates to the installed version. Present for a shell from a blueprint.</param>
/// <param name="Layout">The shell template when <paramref name="Kind"/> is <see cref="ShellKind.Layout"/> (for the bare shell, a layout with one <c language="csharp">content</c> slot).</param>
/// <param name="RootTemplate">The shell template when <paramref name="Kind"/> is <see cref="ShellKind.ScreenTemplate"/>.</param>
public record EffectiveShell(
    ShellOrigin Origin,
    TemplateReference? Reference,
    ShellKind Kind,
    ShellSource Source,
    string Name,
    IReadOnlyList<string> Outlets,
    string PrimaryOutlet,
    IReadOnlyDictionary<string, JsonNode?> Options,
    IReadOnlyList<ShellDiagnostic> Diagnostics,
    string? Package = null,
    string? PackageVersion = null,
    BlueprintPinEvaluation? Pin = null,
    Model.Layouts.Layout? Layout = null,
    ScreenTemplate? RootTemplate = null);
