// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.SampleData;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// A blueprint package as the verification and the catalog read it: its manifest and the layouts and templates it provides, plus what a
/// manifest only names - the screens of its screen set, the sample-data packs its references point to, and the package's files.
/// </summary>
/// <param name="Manifest">The package manifest.</param>
/// <param name="Layouts">The layouts the package provides.</param>
/// <param name="ScreenTemplates">The screen templates the package provides.</param>
/// <param name="DialogTemplates">The dialog templates the package provides.</param>
/// <param name="Screens">The screens the package provides. When given, every screen of the screen set must be among them.</param>
/// <param name="Packs">The sample-data packs the manifest's references point to, loaded.</param>
/// <param name="Files">The package-relative paths of the files the package contains. When given, the thumbnails and sample-data files the manifest names must be among them.</param>
public record BlueprintSource(
    ScenePackage Manifest,
    IReadOnlyList<Layout>? Layouts = null,
    IReadOnlyList<ScreenTemplate>? ScreenTemplates = null,
    IReadOnlyList<DialogTemplate>? DialogTemplates = null,
    IReadOnlyList<Screen>? Screens = null,
    IReadOnlyList<SampleDataPack>? Packs = null,
    IReadOnlyList<string>? Files = null)
{
    /// <summary>
    /// The templates of this source, without the screens and files.
    /// </summary>
    /// <returns>The source as a <see cref="TemplateSource"/>.</returns>
    public TemplateSource AsTemplateSource() => new(Manifest, Layouts, ScreenTemplates, DialogTemplates);
}
