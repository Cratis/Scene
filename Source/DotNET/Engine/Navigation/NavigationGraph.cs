// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;

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
public record NavigationGraph(
    IReadOnlyList<NavigationEntry> Entries,
    IReadOnlyList<Screen>? Screens = null,
    IReadOnlyList<Layout>? Layouts = null,
    IReadOnlyList<ScreenTemplate>? ScreenTemplates = null,
    IReadOnlyList<DialogTemplate>? DialogTemplates = null);
