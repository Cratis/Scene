// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Shell;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// What a profile is checked against.
/// </summary>
/// <param name="Packages">Every package that could be selected; the dependency rules read their manifests.</param>
/// <param name="Library">The application's own templates and the blueprints that are available.</param>
/// <param name="Theme">The theme the profile names, when it is known. <see langword="null"/>, the theme is not checked.</param>
/// <param name="Shell">The shell the profile resolves to (<see cref="ShellResolver.Resolve"/>). Its unusable-shell diagnostics become blockers.</param>
/// <param name="Usages">What existing screens rely on.</param>
public record ProfileBlockerContext(
    IReadOnlyList<ScenePackage> Packages,
    TemplateLibrary Library,
    Theme? Theme = null,
    EffectiveShell? Shell = null,
    IReadOnlyList<ProfileUsage>? Usages = null);
