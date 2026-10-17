// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// What the menu does in a regime.
/// </summary>
/// <param name="Mode">The chosen mode.</param>
/// <param name="Presentation">How the menu is presented.</param>
/// <param name="Width">The width of the visible menu in pixels, when something is always visible.</param>
/// <param name="Scrim">Whether the open menu is drawn over a dimming scrim.</param>
/// <param name="EffectiveMode">The mode the menu really behaves as; differs from <paramref name="Mode"/> when the regime replaces it.</param>
/// <param name="Note">Why the effective mode differs, when it does.</param>
public record MenuBehavior(NavigationMode Mode, MenuPresentation Presentation, int? Width, bool Scrim, NavigationMode EffectiveMode, string? Note);
