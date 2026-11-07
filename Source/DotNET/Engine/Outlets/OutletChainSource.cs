// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// What the chain of outlet levels of a screen is built from: the layouts, screen templates and screens of a Scene
/// document, and what a host adds - the navigation model and the levels of its modules and features.
/// </summary>
/// <param name="Layouts">The layouts; the screen's layout is a level.</param>
/// <param name="ScreenTemplates">The screen templates; the screen's template is a level.</param>
/// <param name="Screens">The screens; the screen is the last level, and every other screen's outlet contributions apply too.</param>
/// <param name="Navigation">The navigation model: its application outlets are the top level, and a module's refinements and contributions join that module's level.</param>
/// <param name="Levels">The levels of modules and features the host knows; a level whose name is in the screen's path joins the chain there, any other contributes.</param>
public record OutletChainSource(
    IReadOnlyList<Layout>? Layouts = null,
    IReadOnlyList<ScreenTemplate>? ScreenTemplates = null,
    IReadOnlyList<Screen>? Screens = null,
    NavigationModel? Navigation = null,
    IReadOnlyList<OutletLevel>? Levels = null);
