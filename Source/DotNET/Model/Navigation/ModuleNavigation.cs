// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// The navigation a module declares for the regions it changes. A region it does not declare inherits the application's.
/// </summary>
/// <param name="Module">The module identity.</param>
/// <param name="Regions">The regions the module changes.</param>
public record ModuleNavigation(string Module, IReadOnlyList<NavigationRegion> Regions);
