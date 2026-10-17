// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// What a navigation mode looks like and how it behaves.
/// </summary>
/// <param name="Id">The mode.</param>
/// <param name="Label">The name shown in a picker.</param>
/// <param name="Description">The one-line description a host shows under the mode.</param>
/// <param name="Presentation">How the menu is presented with a pointer.</param>
/// <param name="Width">The width of the visible menu in pixels; <see langword="null"/> when nothing is always visible.</param>
/// <param name="Scrim">Whether the menu is drawn over a dimming scrim while it is open.</param>
/// <param name="NeedsHover">Whether the mode only works with a pointer that can hover.</param>
public record NavigationModeInfo(NavigationMode Id, string Label, string Description, MenuPresentation Presentation, int? Width, bool Scrim, bool NeedsHover);
