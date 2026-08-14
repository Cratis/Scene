// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// A named target: a platform, a default size class, and an ordered list of component packages. Declaration
/// order in <see cref="Packages"/> is override priority — a later package shadows an earlier one when both
/// resolve the same bare component name. <c>core</c> is always the final fallback, so a minimum vocabulary
/// resolves regardless of which packages a profile lists.
/// </summary>
/// <param name="Name">The profile's name.</param>
/// <param name="TargetPlatform">The platform this profile targets (e.g. <c>web</c>, <c>ios</c>, <c>android</c>, <c>desktop</c>).</param>
/// <param name="Packages">The component packages this profile draws from, in override-priority order.</param>
/// <param name="DefaultSizeClass">The size class assumed when the renderer cannot otherwise determine one.</param>
public record UiProfile(string Name, string TargetPlatform, IReadOnlyList<string> Packages, SizeClass? DefaultSizeClass = null);
