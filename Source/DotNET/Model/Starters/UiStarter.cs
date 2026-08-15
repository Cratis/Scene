// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Starters;

/// <summary>
/// A packaged, versioned UI starting point: a package list, the themes it ships compatible with, and a
/// gallery of ordinary screens shipped alongside it - part of Cratis/Scene#6. A starter is data, not a
/// <c>.play</c> language construct; Studio's "new project" flow scaffolds from it, and its gallery boots
/// through the real <c>Scene.Engine</c> + <c>Scene.React</c> inside a sandboxed <see cref="Profiles.UiProfile"/>
/// built from <see cref="Packages"/> - there is no separate preview pipeline and no mocked screens.
/// </summary>
/// <param name="Name">The starter's name.</param>
/// <param name="Packages">The component packages this starter bundles, in the same override-priority order a <see cref="Profiles.UiProfile"/> declares them.</param>
/// <param name="Themes">The names of the themes this starter ships as compatible choices.</param>
/// <param name="Gallery">The names of the ordinary <see cref="Screens.Screen"/>s shipped as this starter's sample gallery.</param>
public record UiStarter(string Name, IReadOnlyList<string> Packages, IReadOnlyList<string> Themes, IReadOnlyList<string> Gallery);
