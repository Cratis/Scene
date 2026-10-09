// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// A package and the templates it provides.
/// </summary>
/// <param name="Manifest">The package's declaration.</param>
/// <param name="Layouts">The layouts the package provides.</param>
/// <param name="ScreenTemplates">The screen templates the package provides.</param>
/// <param name="DialogTemplates">The dialog templates the package provides.</param>
public record TemplateSource(
    ScenePackage Manifest,
    IReadOnlyList<Layout>? Layouts = null,
    IReadOnlyList<ScreenTemplate>? ScreenTemplates = null,
    IReadOnlyList<DialogTemplate>? DialogTemplates = null);
