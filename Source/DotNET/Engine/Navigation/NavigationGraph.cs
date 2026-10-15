// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Screens;
using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Everything navigation diagnostics look at. A <see langword="null"/> catalog means "not known here", so
/// targets in it are not reported as unavailable; an empty catalog means "known to be empty".
/// </summary>
/// <param name="Entries">The destinations to check, in authored order.</param>
/// <param name="Screens">The screens destinations may open.</param>
/// <param name="Layouts">The layouts that may own outlets.</param>
/// <param name="ScreenTemplates">The screen templates that may own outlets, and that give screens their semantic type.</param>
/// <param name="DialogTemplates">The dialog templates dialog destinations may open.</param>
/// <param name="Structure">The modules, features and slices of the application; with <paramref name="Navigation"/>, the navigation regions are checked against them.</param>
/// <param name="Navigation">The application and module navigation regions to check against <paramref name="Structure"/>.</param>
/// <param name="Slots">The rendering slots navigation items may render into; <c language="csharp">content</c> only when <see langword="null"/>.</param>
public record NavigationGraph(
    IReadOnlyList<NavigationEntry> Entries,
    IReadOnlyList<Screen>? Screens = null,
    IReadOnlyList<Layout>? Layouts = null,
    IReadOnlyList<ScreenTemplate>? ScreenTemplates = null,
    IReadOnlyList<DialogTemplate>? DialogTemplates = null,
    ApplicationStructure? Structure = null,
    NavigationModel? Navigation = null,
    IReadOnlyList<string>? Slots = null);
