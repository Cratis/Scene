// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// The application-level navigation: the base every module inherits, extends or overrides.
/// </summary>
/// <param name="Regions">The regions the application defines items for.</param>
/// <param name="Logo">The application logo.</param>
public record ApplicationNavigation(IReadOnlyList<NavigationRegion> Regions, ApplicationLogo? Logo = null);
