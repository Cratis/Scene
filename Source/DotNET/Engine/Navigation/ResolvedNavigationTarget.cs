// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Where a navigation item goes, resolved against the application structure.
/// </summary>
/// <param name="Module">The module the item targets.</param>
/// <param name="Feature">The feature the item names, a dotted path inside the module; <see langword="null"/> when it targets the module.</param>
/// <param name="ResolvedFeature">
/// The qualified id of the feature the item opens: the named feature, or for a module target the module's first feature.
/// <see langword="null"/> when the module or feature does not exist, or the module has no features.
/// </param>
public record ResolvedNavigationTarget(string Module, string? Feature = null, string? ResolvedFeature = null);
